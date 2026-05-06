import { Suspense } from "react"
import { SearchBar } from "@/components/search/SearchBar"
import { SearchFilters } from "@/components/search/SearchFilters"
import { VetCard } from "@/components/search/VetCard"
import { getNextSlotsForVets } from "@/lib/get-next-slot"
import db from "@/lib/db"
import { Loader2, SearchX } from "lucide-react"

interface SearchPageProps {
  searchParams: {
    q?:         string
    city?:      string
    specialty?: string
    language?:  string
    emergency?: string
    available?: string
    payment?:   string
  }
}

async function SearchResults({ searchParams }: SearchPageProps) {
  const {
    q         = "",
    city      = "",
    specialty = "",
    language  = "",
    emergency,
    available,
    payment   = "",
  } = searchParams

  // Build where clause
  const where: any = {
    status:   "ACTIVE",
    isActive: true,
  }

  if (emergency === "true") where.acceptsEmergencies = true
  if (city)     where.city              = { contains: city,     mode: "insensitive" }
  if (language) where.languagesSpoken   = { has: language }
  if (payment)  where.paymentMethods    = { has: payment }

  if (specialty) {
    where.OR = [
      { specialties: { has: specialty } },
      { careTypes:   { has: specialty } },
    ]
  }

  if (q && !city && !specialty) {
    where.OR = [
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
    ]
  }

  const vets = await db.vetProfile.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, image: true } },
    },
    orderBy: { city: "asc" },
    take: 50,
  })

  // Get next available slots for all vets
  const nextSlots = await getNextSlotsForVets(vets.map((v) => v.id))

  // Apply availability filter after getting slots
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

  // Sort: soonest next slot first
  results.sort((a, b) => {
    if (a.nextSlot && b.nextSlot) return a.nextSlot.getTime() - b.nextSlot.getTime()
    if (a.nextSlot && !b.nextSlot) return -1
    if (!a.nextSlot && b.nextSlot) return 1
    return 0
  })

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <SearchX size={28} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun résultat trouvé</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Essayez de modifier vos filtres ou d'élargir votre recherche à une autre ville.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((vet) => (
        <VetCard
          key={vet.id}
          id={vet.id}
          firstName={vet.user.firstName}
          lastName={vet.user.lastName}
          photoUrl={vet.photoUrl}
          image={vet.user.image}
          clinicName={vet.clinicName}
          city={vet.city}
          bio={vet.bio}
          specialties={vet.specialties}
          languagesSpoken={vet.languagesSpoken}
          careTypes={vet.careTypes}
          isVerified={vet.isVerified}
          acceptsEmergencies={(vet as any).acceptsEmergencies ?? false}
          nextSlot={vet.nextSlot}
        />
      ))}
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q         = searchParams.q         ?? ""
  const city      = searchParams.city      ?? ""
  const specialty = searchParams.specialty ?? ""
  const emergency = searchParams.emergency

  // Build a readable summary of the search
  const searchSummary = [
    q         && `"${q}"`,
    city      && `à ${city}`,
    specialty && `— ${specialty}`,
    emergency === "true" && "urgences uniquement",
  ].filter(Boolean).join(" ")

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top search bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <SearchBar
            initialQuery={q || city || specialty}
            size="default"
            placeholder="Spécialité, ville, nom du vétérinaire..."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Result header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 font-['Sora']">
            {searchSummary
              ? `Vétérinaires — ${searchSummary}`
              : "Tous les vétérinaires"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Résultats triés par prochaine disponibilité
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters sidebar */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <Suspense fallback={null}>
              <SearchFilters />
            </Suspense>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-violet-400" />
                </div>
              }
            >
              <SearchResults searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}