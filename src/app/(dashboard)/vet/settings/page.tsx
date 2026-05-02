import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Settings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 4 }}>
          Manage your schedule and availability preferences.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <AvailabilityManager existingHours={vet.workingHours} />
        <VetToggles
          isActive={vet.isActive}
          acceptsEmergencies={(vet as any).acceptsEmergencies ?? true}
        />
      </div>
    </div>
  )
}