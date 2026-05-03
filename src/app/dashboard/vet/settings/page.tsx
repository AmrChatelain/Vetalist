import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { CalendarDays, Settings2, ShieldCheck } from "lucide-react"
import { AvailabilityManager } from "@/components/vet/AvailabilityManager"
import { VetToggles } from "@/components/vet/VetToggles"

export default async function VetSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vet = await prisma.vetProfile.findUnique({
    where: { userId: session.user.id },
    include: { workingHours: true },
  })

  if (!vet) redirect("/onboarding")

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings2 className="w-5 h-5 text-blue-600" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your schedule, practice status, and availability preferences.
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
          vet.isActive
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-700"
            : "bg-slate-50 border-slate-200 text-slate-600"
        }`}
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          {vet.isActive
            ? "Your practice is currently active and visible to clients."
            : "Your practice is hidden. Reactivate it to start receiving bookings."}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Manager — takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <AvailabilityManager existingHours={vet.workingHours} />
        </div>

        {/* Toggles Sidebar — stays at fixed width */}
        <div className="lg:col-span-1">
          <VetToggles
            isActive={vet.isActive}
            acceptsEmergencies={(vet as any).acceptsEmergencies ?? true}
          />
        </div>
      </div>

      {/* Quick Info Footer */}
      <div className="border-t pt-6 mt-2">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-blue-500" />
          Schedule Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Working Days</p>
              <p className="text-lg font-semibold text-slate-900">{vet.workingHours.length}/7</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className={`text-lg font-semibold ${vet.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                {vet.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-violet-50 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-600">🚨</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Emergencies</p>
              <p className={`text-lg font-semibold ${(vet as any).acceptsEmergencies ? "text-violet-600" : "text-slate-400"}`}>
                {(vet as any).acceptsEmergencies ? "Accepted" : "Declined"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
