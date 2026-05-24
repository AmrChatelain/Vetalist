import { Suspense } from "react"
import { SearchBar }        from "@/components/search/SearchBar"
import { SearchFilters }    from "@/components/search/SearchFilters"
import { ActiveFiltersBar } from "@/components/search/ActiveFiltersBar"
import { VetCard }          from "@/components/search/VetCard"
import { getNextSlotsForVets } from "@/lib/get-next-slot"
import db    from "@/lib/db"
import { Loader2, SearchX, SlidersHorizontal } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "Rechercher un vétérinaire",
  description: "Trouvez un vétérinaire disponible près de chez vous. Filtrez par spécialité, ville, langue et disponibilité.",
  alternates:  { canonical: "https://vetalist.fr/search" },
  robots:      { index: true, follow: true },
}

interface SearchPageProps {
  searchParams: Promise<{
    q?:         string
    city?:      string
    specialty?: string
    language?:  string  // comma-separated: "Français,Anglais"
    emergency?: string
    available?: string
    payment?:   string
  }>
}

// ── Results server component ───────────────────────────────────────────────────
async function SearchResults({ searchParams }: SearchPageProps) {
  const p = await searchParams
  const {
    q         = "",
    city      = "",
    specialty = "",
    language  = "",
    emergency,
    available,
    payment   = "",
  } = p

  // Parse multi-language (comma-separated)
  const languageList = language ? language.split(",").map((l) => l.trim()).filter(Boolean) : []

  // ── Build where clause ────────────────────────────────────────────────────
  const where: any = { status: "ACTIVE", isActive: true }
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
  // Vets with empty languagesSpoken[] are treated as French-speaking by default
  if (languageList.length > 0) {
    const includeFrench = languageList.includes("Français")
    const langClause: any[] = [{ languagesSpoken: { hasSome: languageList } }]
    if (includeFrench) {
      // Empty array = vet didn't specify = assume French
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  // Availability filter (post-DB, needs slot data)
  if (available === "today") {
    results = results.filter((v) => v.nextSlot && v.nextSlot <= todayEnd)
  } else if (available === "week") {
    results = results.filter((v) => v.nextSlot && v.nextSlot <= weekEnd)
  }

  // Sort by soonest slot, no-slot vets at end
  results.sort((a, b) => {
    if (a.nextSlot && b.nextSlot) return a.nextSlot.getTime() - b.nextSlot.getTime()
    if (a.nextSlot && !b.nextSlot) return -1
    if (!a.nextSlot && b.nextSlot) return  1
    return 0
  })

  const hasFilters = !!(q || city || specialty || language || emergency || available || payment)

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <SearchX size={28} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Aucun vétérinaire trouvé
        </h3>
        <p className="text-sm text-slate-400 max-w-xs">
          {hasFilters
            ? "Aucun résultat ne correspond à vos critères. Essayez de modifier ou effacer vos filtres."
            : "Aucun vétérinaire n'est disponible pour le moment."}
        </p>
        {hasFilters && (
          <a
            href="/search"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium rounded-full hover:bg-violet-100 transition-colors"
          >
            <SlidersHorizontal size={13} />
            Effacer tous les filtres
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 font-medium">
        {results.length} vétérinaire{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
        {hasFilters ? " pour ces critères" : ""}
      </p>
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
          acceptsEmergencies={vet.acceptsEmergencies}
          nextSlot={vet.nextSlot}
        />
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const p = await searchParams
  const q         = p.q         ?? ""
  const city      = p.city      ?? ""
  const specialty = p.specialty ?? ""
  const language  = p.language  ?? ""
  const emergency = p.emergency

  // Build a clean header title — only show when there's an actual active search
  const hasAnyFilter = !!(q || city || specialty || language || emergency || p.available || p.payment)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <SearchBar
            initialQuery={q || city || specialty}
            size="default"
            placeholder="Spécialité, ville, nom du vétérinaire..."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Page title */}
        <div className="mb-2">
          <h1 className="text-xl font-bold text-slate-900 font-['Sora']">
            {hasAnyFilter ? "Résultats de recherche" : "Tous les vétérinaires"}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Résultats triés par prochaine disponibilité
          </p>
        </div>

        {/* Active filter chips — client component */}
        <Suspense fallback={null}>
          <ActiveFiltersBar />
        </Suspense>

        <div className="flex gap-6 items-start mt-4">

          {/* Filters sidebar */}
          <div className="w-72 shrink-0 hidden lg:block">
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