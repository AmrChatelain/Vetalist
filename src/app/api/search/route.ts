import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getNextSlotsForVets } from "@/lib/get-next-slot"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q          = searchParams.get("q")?.trim()          ?? ""
  const city       = searchParams.get("city")?.trim()       ?? ""
  const specialty  = searchParams.get("specialty")?.trim()  ?? ""
  const language   = searchParams.get("language")?.trim()   ?? ""
  const emergency  = searchParams.get("emergency")          // "true" | null
  const available  = searchParams.get("available")          // "today" | "week" | null
  const payment    = searchParams.get("payment")?.trim()    ?? ""

  // Build the where clause
  const where: any = {
    status:   "ACTIVE",
    isActive: true,
  }

  // Emergency filter
  if (emergency === "true") {
    where.acceptsEmergencies = true
  }

  // City filter
  if (city) {
    where.city = { contains: city, mode: "insensitive" }
  }

  // Specialty — checks both specialties[] and careTypes[]
  if (specialty) {
    where.OR = [
      { specialties: { has: specialty } },
      { careTypes:   { has: specialty } },
    ]
  }

  // Language filter
  if (language) {
    where.languagesSpoken = { has: language }
  }

  // Payment filter
  if (payment) {
    where.paymentMethods = { has: payment }
  }

  // Generic text search (q) — name, city, clinic name
  if (q && !city && !specialty) {
    where.OR = [
      { city:       { contains: q, mode: "insensitive" } },
      { clinicName: { contains: q, mode: "insensitive" } },
      { specialties: { has: q } },
      { user: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName:  { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ]
  }

  const vets = await db.vetProfile.findMany({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName:  true,
          image:     true,
        },
      },
    },
    orderBy: { city: "asc" },
    take: 50,
  })

  // Get next available slot for each vet
  const vetIds   = vets.map((v) => v.id)
  const nextSlots = await getNextSlotsForVets(vetIds)

  // Apply availability filter AFTER getting slots (can't do this in DB query)
  const now     = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekEnd  = new Date(now.getTime() + 7 * 86_400_000)

  let results = vets.map((vet) => ({
    ...vet,
    nextSlot: nextSlots[vet.id] ?? null,
  }))

  if (available === "today") {
    results = results.filter(
      (v) => v.nextSlot && v.nextSlot <= todayEnd
    )
  } else if (available === "week") {
    results = results.filter(
      (v) => v.nextSlot && v.nextSlot <= weekEnd
    )
  }

  // Sort by next slot (soonest first), then no-slot vets at end
  results.sort((a, b) => {
    if (a.nextSlot && b.nextSlot) return a.nextSlot.getTime() - b.nextSlot.getTime()
    if (a.nextSlot && !b.nextSlot) return -1
    if (!a.nextSlot && b.nextSlot) return 1
    return 0
  })

  return NextResponse.json({ results, total: results.length })
}