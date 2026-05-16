import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getClientDashboardData } from "@/actions/client.actions"
import { AppointmentsClient } from "@/components/client/AppointmentsClient"
import { CalendarDays } from "lucide-react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes rendez-vous",
  robots: { index: false, follow: false },
};


export default async function ClientAppointmentsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getClientDashboardData()
  if (!data) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e] flex items-center gap-3">
          <CalendarDays size={28} className="text-violet-500" />
          Mes rendez-vous
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Consultez et gérez tous vos rendez-vous vétérinaires.
        </p>
      </div>

      <AppointmentsClient
        upcoming={data.upcomingAppointments}
        past={data.pastAppointments}
      />
    </div>
  )
}