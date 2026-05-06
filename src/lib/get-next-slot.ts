import db from "@/lib/db"

const DAY_MS = 86_400_000

type WorkingHour = {
  dayOfWeek: number
  startTime: string // "09:00"
  endTime:   string // "18:00"
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
    (a) =>
      a.startTime < slotEnd && a.endTime > slotStart
  )
}

/**
 * Returns the next available slot for a vet as a Date, or null if none found
 * within the next 30 days.
 */
export async function getNextAvailableSlot(vetProfileId: string): Promise<Date | null> {
  const [workingHours, blocks, appointments, vetProfile] = await Promise.all([
    db.workingHour.findMany({ where: { vetProfileId } }),
    db.availabilityBlock.findMany({
      where: {
        vetProfileId,
        endDate: { gte: new Date() },
      },
    }),
    db.appointment.findMany({
      where: {
        vetId:     vetProfileId,
        status:    { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: new Date() },
      },
      select: { startTime: true, endTime: true },
    }),
    db.vetProfile.findUnique({
      where: { id: vetProfileId },
      select: { slotDurationMin: true },
    }),
  ])

  if (!vetProfile || workingHours.length === 0) return null

  const slotMin = vetProfile.slotDurationMin || 30
  const now     = new Date()

  // Check up to 30 days ahead
  for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
    const checkDate = new Date(now.getTime() + dayOffset * DAY_MS)
    const dayOfWeek = checkDate.getDay() // 0 = Sunday

    const hours = workingHours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!hours) continue

    // Check if this day is in an availability block
    const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
    if (isBlocked(dayStart, blocks as AvailabilityBlock[])) continue

    const startMin  = timeToMinutes(hours.startTime)
    const endMin    = timeToMinutes(hours.endTime)

    // Try each slot in this working day
    for (let slotStart = startMin; slotStart + slotMin <= endMin; slotStart += slotMin) {
      const slotDate    = new Date(dayStart)
      slotDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0)

      const slotEndDate = new Date(slotDate.getTime() + slotMin * 60_000)

      // Skip slots in the past
      if (slotDate <= now) continue

      // Skip if booked
      if (isBooked(slotDate, slotEndDate, appointments as Appointment[])) continue

      // This slot is free!
      return slotDate
    }
  }

  return null
}

/**
 * Lightweight version: get next slot for multiple vets at once.
 * Returns a map of vetProfileId → next slot date (or null).
 */
export async function getNextSlotsForVets(
  vetProfileIds: string[]
): Promise<Record<string, Date | null>> {
  const results = await Promise.all(
    vetProfileIds.map(async (id) => ({
      id,
      slot: await getNextAvailableSlot(id),
    }))
  )

  return Object.fromEntries(results.map(({ id, slot }) => [id, slot]))
}