import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getClientDashboardData } from "@/actions/client.actions"
import { CalendarDays, PawPrint, ChevronRight, Clock, MapPin, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Mon espace", // or "Mes rendez-vous", "Mon profil" etc
  robots: { index: false, follow: false },
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "En attente", className: "bg-amber-100 text-amber-700 border-amber-200"   },
  CONFIRMED: { label: "Confirmé",   className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Annulé",     className: "bg-red-100 text-red-700 border-red-200"         },
  DONE:      { label: "Terminé",    className: "bg-slate-100 text-slate-600 border-slate-200"   },
}

const SPECIES_EMOJI: Record<string, string> = {
  Chien: "🐕", Chat: "🐱", Lapin: "🐰", Oiseau: "🦜",
  Reptile: "🦎", Rongeur: "🐹", Autre: "🐾",
}

export default async function ClientDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getClientDashboardData()
  if (!data) redirect("/login")

  const { stats, upcomingAppointments, pets } = data
  const firstName = session.user.firstName || "vous"

  const nextApt = stats.nextAppointment

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e]">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Voici un résumé de votre espace Vetalist.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Prochain RDV
            </span>
            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
              <CalendarDays size={14} className="text-violet-600" />
            </div>
          </div>
          {nextApt ? (
            <>
              <p className="text-sm font-bold text-slate-800">
                Dr. {nextApt.vet.user.firstName} {nextApt.vet.user.lastName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(nextApt.startTime).toLocaleDateString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short",
                })}{" "}
                à{" "}
                {new Date(nextApt.startTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Aucun à venir</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              RDV à venir
            </span>
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock size={14} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1e1a2e]">{stats.upcomingCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">rendez-vous planifiés</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mes animaux
            </span>
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
              <PawPrint size={14} className="text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1e1a2e]">{stats.petsCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">animal{stats.petsCount !== 1 ? "aux" : ""} enregistré{stats.petsCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1e1a2e] flex items-center gap-2">
            <CalendarDays size={16} className="text-violet-500" />
            Prochains rendez-vous
          </h2>
          <Link
            href="/dashboard/client/appointments"
            className="text-xs text-violet-600 hover:underline flex items-center gap-1"
          >
            Tous les RDV <ArrowRight size={12} />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Aucun rendez-vous à venir</p>
            <Link
              href="/search"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline"
            >
              Trouver un vétérinaire <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((apt) => {
              const status = STATUS_LABELS[apt.status] ?? STATUS_LABELS.PENDING
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-100 hover:bg-violet-50/30 transition-all"
                >
                  {/* Date block */}
                  <div className="text-center shrink-0 w-12">
                    <div className="text-xs font-bold text-violet-600 uppercase">
                      {new Date(apt.startTime).toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                    <div className="text-2xl font-bold text-[#1e1a2e] leading-none">
                      {new Date(apt.startTime).getDate()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        Dr. {apt.vet.user.firstName} {apt.vet.user.lastName}
                      </p>
                      <Badge className={`text-xs border hover:opacity-100 ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {apt.vet.city}
                      </span>
                      {apt.pet && (
                        <span>
                          {SPECIES_EMOJI[apt.pet.species] ?? "🐾"} {apt.pet.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {upcomingAppointments.length > 3 && (
              <Link
                href="/dashboard/client/appointments"
                className="flex items-center justify-center gap-1.5 text-sm text-violet-600 hover:underline pt-2"
              >
                Voir {upcomingAppointments.length - 3} de plus <ChevronRight size={13} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pets summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#1e1a2e] flex items-center gap-2">
            <PawPrint size={16} className="text-violet-500" />
            Mes animaux
          </h2>
          <Link
            href="/dashboard/client/pets"
            className="text-xs text-violet-600 hover:underline flex items-center gap-1"
          >
            Gérer <ArrowRight size={12} />
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-8">
            <PawPrint size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm">Aucun animal enregistré</p>
            <Link
              href="/dashboard/client/pets"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline"
            >
              Ajouter un animal <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {pets.slice(0, 5).map((pet) => (
              <div
                key={pet.id}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-violet-50 border border-violet-100 rounded-xl"
              >
                <span className="text-xl">{SPECIES_EMOJI[pet.species] ?? "🐾"}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{pet.name}</p>
                  <p className="text-xs text-slate-400">{pet.species}</p>
                </div>
              </div>
            ))}
            {pets.length > 5 && (
              <Link
                href="/dashboard/client/pets"
                className="flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 hover:border-violet-200 transition-colors"
              >
                +{pets.length - 5} autres
              </Link>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="font-['Playfair_Display'] text-xl font-bold text-white">
            Besoin d'un vétérinaire ?
          </p>
          <p className="text-violet-200 text-sm mt-1">
            Trouvez un spécialiste disponible près de chez vous.
          </p>
        </div>
        <Link
          href="/search"
          className="shrink-0 bg-white text-violet-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-violet-50 transition-colors flex items-center gap-1.5"
        >
          Rechercher <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}