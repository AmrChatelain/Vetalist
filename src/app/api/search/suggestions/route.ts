import { NextResponse } from "next/server"
import db from "@/lib/db"
import { VETERINARY_SPECIALTIES, CARE_TYPES } from "@/lib/veterinary-specialties"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) {
    return NextResponse.json({ cities: [], specialties: [], vets: [] })
  }

  const lower = q.toLowerCase()

  // Run all 3 queries in parallel
  const [cityResults, vetResults] = await Promise.all([
    // Distinct cities matching query
    db.vetProfile.findMany({
      where: {
        status: "ACTIVE",
        city: { contains: q, mode: "insensitive" },
      },
      select: { city: true },
      distinct: ["city"],
      take: 5,
    }),

    // Vet names matching query
    db.vetProfile.findMany({
      where: {
        status: "ACTIVE",
        isActive: true,
        user: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName:  { contains: q, mode: "insensitive" } },
          ],
        },
      },
      select: {
        id: true,
        clinicName: true,
        city: true,
        user: { select: { firstName: true, lastName: true } },
      },
      take: 4,
    }),
  ])

  // Match specialties and care types from predefined lists (no DB query needed)
  const matchedSpecialties = [
    ...VETERINARY_SPECIALTIES.filter((s) => s.toLowerCase().includes(lower)),
    ...CARE_TYPES.filter((c) => c.toLowerCase().includes(lower)),
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i) // dedupe
    .slice(0, 5)

  return NextResponse.json({
    cities: cityResults.map((r) => r.city),
    specialties: matchedSpecialties,
    vets: vetResults.map((v) => ({
      id:         v.id,
      name:       `Dr. ${v.user.firstName} ${v.user.lastName}`,
      clinicName: v.clinicName,
      city:       v.city,
    })),
  })
}