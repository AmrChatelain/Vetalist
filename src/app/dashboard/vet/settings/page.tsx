import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { redirect } from "next/navigation"
import { AvailabilityManager } from "@/components/vet/AvailabilityManager"
import { VetToggles } from "@/components/vet/VetToggles"
import { SlotDurationPicker } from "@/components/vet/SlotDurationPicker"
import { TimeOffManager } from "@/components/vet/TimeOffManager"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};


export default async function VetSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vet = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      workingHours:       true,
      availabilityBlocks: {
        orderBy: { startDate: "asc" },
      },
    },
  })

  if (!vet) redirect("/onboarding")

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your schedule, availability, and appointment preferences.
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left — wide column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Working hours */}
          <AvailabilityManager existingHours={vet.workingHours} />

          {/* Time off */}
          <TimeOffManager initialBlocks={vet.availabilityBlocks as any} />
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Practice status toggles */}
          <VetToggles
            isActive={vet.isActive}
            acceptsEmergencies={(vet as any).acceptsEmergencies ?? true}
          />

          {/* Slot duration */}
          <SlotDurationPicker currentDuration={vet.slotDurationMin} />
        </div>

      </div>
    </div>
  )
}