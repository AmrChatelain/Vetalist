import { redirect } from "next/navigation"
import { getVetDashboardData } from "@/actions/vet.actions"
import Link from "next/link"
import {
  CalendarDays, Clock, AlertCircle,
  CheckCircle2, ChevronRight, PawPrint,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Tableau de bord", // or "Mes rendez-vous", "Mon profil" etc
  robots: { index: false, follow: false },
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "En attente", className: "bg-amber-100 text-amber-700 border-amber-200"       },
  CONFIRMED: { label: "Confirmé",   className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Annulé",     className: "bg-red-100 text-red-700 border-red-200"             },
  DONE:      { label: "Terminé",    className: "bg-slate-100 text-slate-600 border-slate-200"       },
}

export default async function VetDashboardPage() {
  const data = await getVetDashboardData()
  if (!data) redirect("/login")

  const { vet, stats, upcomingAppointments } = data
  const firstName = vet.user.firstName

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-3xl font-bold text-[#0f172a]">
          Bonjour, Dr. {firstName} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Voici un résumé de votre activité du jour.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aujourd'hui</span>
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarDays size={14} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f172a]">{stats.todayCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">rendez-vous aujourd'hui</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En attente</span>
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={14} className="text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f172a]">{stats.pendingCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">à confirmer</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cette semaine</span>
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f172a]">{stats.weekCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">rendez-vous cette semaine</p>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#0f172a] flex items-center gap-2">
            <CalendarDays size={16} className="text-blue-500" />
            Prochains rendez-vous
          </h2>
          <Link
            href="/dashboard/vet/appointments"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Tous les RDV <ChevronRight size={12} />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 5).map((apt) => {
              const status = STATUS_LABELS[apt.status] ?? STATUS_LABELS.PENDING
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                >
                  {/* Date block */}
                  <div className="text-center shrink-0 w-12">
                    <div className="text-xs font-bold text-blue-600 uppercase">
                      {new Date(apt.startTime).toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                    <div className="text-2xl font-bold text-[#0f172a] leading-none">
                      {new Date(apt.startTime).getDate()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        {apt.client.firstName} {apt.client.lastName}
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
                      {apt.pet && (
                        <span className="flex items-center gap-1">
                          <PawPrint size={10} />
                          {apt.pet.name} ({apt.pet.species})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {upcomingAppointments.length > 5 && (
              <Link
                href="/dashboard/vet/appointments"
                className="flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:underline pt-2"
              >
                Voir {upcomingAppointments.length - 5} de plus <ChevronRight size={13} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}