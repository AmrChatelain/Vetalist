import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import ProfileEditor from "@/components/vet/ProfileEditor"

export default async function VetProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vet = await prisma.vetProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Pre-fill existing data if the vet has already onboarded
  const defaultValues = vet ? {
    bio:             vet.bio             ?? "",
    specialties:     vet.specialties,
    languagesSpoken: vet.languagesSpoken,
    clinicName:      vet.clinicName      ?? "",
    clinicPhone:     vet.clinicPhone     ?? "",
    city:            vet.city,
    street:          vet.street,
    zipCode:         vet.zipCode,
    careTypes:       vet.careTypes,
    paymentMethods:  vet.paymentMethods,
  } : undefined

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Professional Profile
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 4 }}>
          Keep your profile up to date so clients can find and trust you.
        </p>
      </div>
      <ProfileEditor defaultValues={defaultValues} />
    </div>
  )
}