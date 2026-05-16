import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { redirect } from "next/navigation"
import ProfileEditor from "@/components/vet/ProfileEditor"
import { PhotoUpload } from "@/components/vet/PhotoUpload"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};


export default async function VetProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const vet = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!vet) redirect("/onboarding")

  const defaultValues = {
    bio:             vet.bio             ?? "",
    specialties:     vet.specialties,
    languagesSpoken: vet.languagesSpoken,
    licenseNumber:   vet.licenseNumber   ?? "",
    clinicName:      vet.clinicName      ?? "",
    clinicPhone:     vet.clinicPhone     ?? "",
    city:            vet.city,
    street:          vet.street,
    zipCode:         vet.zipCode,
    careTypes:       vet.careTypes,
    paymentMethods:  vet.paymentMethods,
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Professional Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your profile up to date so clients can find and trust you.
        </p>
      </div>

      {/* Photo upload — top of the page */}
      <PhotoUpload
        currentPhotoUrl={vet.photoUrl}
        vetId={vet.id}
      />

      {/* Profile editor — uses updateVetProfile which never resets status */}
      <ProfileEditor
        defaultValues={defaultValues as any}
        isUpdate
      />
    </div>
  )
}