import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getNextSlotsForVets } from "@/lib/get-next-slot"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q         = searchParams.get("q")?.trim()         ?? ""
  const city      = searchParams.get("city")?.trim()      ?? ""
  const specialty = searchParams.get("specialty")?.trim() ?? ""
  const language  = searchParams.get("language")?.trim()  ?? "" // comma-separated
  const emergency = searchParams.get("emergency")
  const available = searchParams.get("available")
  const payment   = searchParams.get("payment")?.trim()   ?? ""

  const languageList = language
    ? language.split(",").map((l) => l.trim()).filter(Boolean)
    : []

  // ── Build where clause ─────────────────────────────────────────────────────
  const where: any    = { status: "ACTIVE", isActive: true }
  const andClauses: any[] = []

  if (emergency === "true") where.acceptsEmergencies = true
  if (city)    where.city           = { contains: city,   mode: "insensitive" }
  if (payment) where.paymentMethods = { has: payment }

  // Specialty — checks both specialties[] and careTypes[]
  if (specialty) {
    andClauses.push({
      OR: [
        { specialties: { has: specialty } },
        { careTypes:   { has: specialty } },
      ],
    })
  }

  // Language — multi-select
  // Vets with empty languagesSpoken[] are treated as French-speaking
  if (languageList.length > 0) {
    const includeFrench = languageList.includes("Français")
    const langClause: any[] = [{ languagesSpoken: { hasSome: languageList } }]
    if (includeFrench) {
      langClause.push({ languagesSpoken: { isEmpty: true } })
    }
    andClauses.push({ OR: langClause })
  }

  // Generic text search
  if (q) {
    andClauses.push({
      OR: [
        { city:        { contains: q, mode: "insensitive" } },
        { clinicName:  { contains: q, mode: "insensitive" } },
        { specialties: { has: q } },
        {
          user: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName:  { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ],
    })
  }

  if (andClauses.length > 0) where.AND = andClauses

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const vets = await db.vetProfile.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, image: true } },
    },
    orderBy: { city: "asc" },
    take: 50,
  })

  const nextSlots = await getNextSlotsForVets(vets.map((v) => v.id))

  const now      = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekEnd  = new Date(now.getTime() + 7 * 86_400_000)

  let results = vets.map((vet) => ({
    ...vet,
    nextSlot: nextSlots[vet.id] ?? null,
  }))

  if (available === "today") {
    results = results.filter((v) => v.nextSlot && v.nextSlot <= todayEnd)
  } else if (available === "week") {
    results = results.filter((v) => v.nextSlot && v.nextSlot <= weekEnd)
  }

  results.sort((a, b) => {
    if (a.nextSlot && b.nextSlot) return a.nextSlot.getTime() - b.nextSlot.getTime()
    if (a.nextSlot && !b.nextSlot) return -1
    if (!a.nextSlot && b.nextSlot) return  1
    return 0
  })

  return NextResponse.json({ results, total: results.length })
}