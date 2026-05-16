import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vetId: string }> }
) {
  const { vetId } = await params
  const dateStr = req.nextUrl.searchParams.get("date") // expects YYYY-MM-DD

  if (!dateStr) {
    return NextResponse.json({ error: "date requis" }, { status: 400 })
  }

  const [year, month, day] = dateStr.split("-").map(Number)
  const dayStart  = new Date(year, month - 1, day, 0, 0, 0, 0)
  const dayEnd    = new Date(year, month - 1, day, 23, 59, 59, 999)
  const dayOfWeek = dayStart.getDay()

  const [vetProfile, workingHours, blocks, appointments] = await Promise.all([
    db.vetProfile.findUnique({
      where: { id: vetId, status: "ACTIVE" },
      select: { slotDurationMin: true },
    }),
    db.workingHour.findMany({
      where: { vetProfileId: vetId, dayOfWeek },
    }),
    db.availabilityBlock.findMany({
      where: {
        vetProfileId: vetId,
        startDate: { lte: dayEnd },
        endDate:   { gte: dayStart },
      },
    }),
    db.appointment.findMany({
      where: {
        vetId,
        status:    { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
      select: { startTime: true, endTime: true },
    }),
  ])

  if (!vetProfile || workingHours.length === 0 || blocks.length > 0) {
    return NextResponse.json({ slots: [] })
  }

  const hours    = workingHours[0]
  const slotMin  = vetProfile.slotDurationMin || 30
  const startMin = timeToMinutes(hours.startTime)
  const endMin   = timeToMinutes(hours.endTime)
  const now      = new Date()

  const slots: { time: string; datetime: string }[] = []

  for (let s = startMin; s + slotMin <= endMin; s += slotMin) {
    const slotDate = new Date(dayStart)
    slotDate.setHours(Math.floor(s / 60), s % 60, 0, 0)
    const slotEnd = new Date(slotDate.getTime() + slotMin * 60_000)

    if (slotDate <= now) continue

    const isBooked = appointments.some(
      (a) => a.startTime < slotEnd && a.endTime > slotDate
    )
    if (isBooked) continue

    slots.push({
      time:     slotDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      datetime: slotDate.toISOString(),
    })
  }

  return NextResponse.json({ slots })
}