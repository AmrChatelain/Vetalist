import db from "@/lib/db"

const DAY_MS = 86_400_000

type WorkingHour = {
  dayOfWeek: number
  startTime: string
  endTime:   string
}

type AvailabilityBlock = {
  startDate: Date
  endDate:   Date
}

type Appointment = {
  startTime: Date
  endTime:   Date
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function isBlocked(date: Date, blocks: AvailabilityBlock[]): boolean {
  return blocks.some(
    (b) => date >= b.startDate && date <= b.endDate
  )
}

function isBooked(slotStart: Date, slotEnd: Date, appointments: Appointment[]): boolean {
  return appointments.some(
    (a) => a.startTime < slotEnd && a.endTime > slotStart
  )
}

// ─── Pure function — no DB calls ──────────────────────────────────────────────

function findNextSlot(
  workingHours: WorkingHour[],
  blocks: AvailabilityBlock[],
  appointments: Appointment[],
  slotDurationMin: number,
): Date | null {
  const now = new Date()

  for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
    const checkDate = new Date(now.getTime() + dayOffset * DAY_MS)
    const dayOfWeek = checkDate.getDay()

    const hours = workingHours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!hours) continue

    const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
    if (isBlocked(dayStart, blocks)) continue

    const startMin = timeToMinutes(hours.startTime)
    const endMin   = timeToMinutes(hours.endTime)

    for (let slotStart = startMin; slotStart + slotDurationMin <= endMin; slotStart += slotDurationMin) {
      const slotDate    = new Date(dayStart)
      slotDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0)
      const slotEndDate = new Date(slotDate.getTime() + slotDurationMin * 60_000)

      if (slotDate <= now) continue
      if (isBooked(slotDate, slotEndDate, appointments)) continue

      return slotDate
    }
  }

  return null
}

// ─── Single vet — API unchanged ───────────────────────────────────────────────

export async function getNextAvailableSlot(vetProfileId: string): Promise<Date | null> {
  const now = new Date()

  const [workingHours, blocks, appointments, vetProfile] = await Promise.all([
    db.workingHour.findMany({ where: { vetProfileId } }),
    db.availabilityBlock.findMany({
      where: {
        vetProfileId,
        endDate: { gte: now },
      },
    }),
    db.appointment.findMany({
      where: {
        vetId:     vetProfileId,
        status:    { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: now },
      },
      select: { startTime: true, endTime: true },
    }),
    db.vetProfile.findUnique({
      where: { id: vetProfileId },
      select: { slotDurationMin: true },
    }),
  ])

  if (!vetProfile || workingHours.length === 0) return null

  return findNextSlot(
    workingHours,
    blocks as AvailabilityBlock[],
    appointments as Appointment[],
    vetProfile.slotDurationMin || 30,
  )
}

// ─── Multiple vets — 4 queries total regardless of N ─────────────────────────

export async function getNextSlotsForVets(
  vetProfileIds: string[]
): Promise<Record<string, Date | null>> {
  if (vetProfileIds.length === 0) return {}

  const now = new Date()

  const [allWorkingHours, allBlocks, allAppointments, allVetProfiles] = await Promise.all([
    db.workingHour.findMany({
      where: { vetProfileId: { in: vetProfileIds } },
    }),
    db.availabilityBlock.findMany({
      where: {
        vetProfileId: { in: vetProfileIds },
        endDate: { gte: now },
      },
    }),
    db.appointment.findMany({
      where: {
        vetId:     { in: vetProfileIds },
        status:    { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: now },
      },
      select: { vetId: true, startTime: true, endTime: true },
    }),
    db.vetProfile.findMany({
      where: { id: { in: vetProfileIds } },
      select: { id: true, slotDurationMin: true },
    }),
  ])

  // Group everything by vetProfileId in memory
  const workingHoursByVet = allWorkingHours.reduce<Record<string, WorkingHour[]>>((acc, wh) => {
    acc[wh.vetProfileId] ??= []
    acc[wh.vetProfileId].push(wh)
    return acc
  }, {})

  const blocksByVet = allBlocks.reduce<Record<string, AvailabilityBlock[]>>((acc, b) => {
    acc[b.vetProfileId] ??= []
    acc[b.vetProfileId].push(b)
    return acc
  }, {})

  const appointmentsByVet = allAppointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    acc[a.vetId] ??= []
    acc[a.vetId].push({ startTime: a.startTime, endTime: a.endTime })
    return acc
  }, {})

  const profileMap = Object.fromEntries(allVetProfiles.map((v) => [v.id, v]))

  // Call pure function per vet — no DB involved
  const result: Record<string, Date | null> = {}
  for (const id of vetProfileIds) {
    const profile = profileMap[id]
    if (!profile || !workingHoursByVet[id]?.length) {
      result[id] = null
      continue
    }
    result[id] = findNextSlot(
      workingHoursByVet[id],
      blocksByVet[id] ?? [],
      appointmentsByVet[id] ?? [],
      profile.slotDurationMin || 30,
    )
  }

  return result
}