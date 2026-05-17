import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileEditor from "@/components/vet/ProfileEditor";
import { PhotoUpload } from "@/components/vet/PhotoUpload";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

export default async function VetProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vet = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vet) redirect("/onboarding");

  const defaultValues = {
    bio: vet.bio ?? "",
    specialties: vet.specialties,
    languagesSpoken: vet.languagesSpoken,
    licenseNumber: vet.licenseNumber ?? "",
    clinicName: vet.clinicName ?? "",
    clinicPhone: vet.clinicPhone ?? "",
    city: vet.city,
    street: vet.street,
    zipCode: vet.zipCode,
    careTypes: vet.careTypes,
    paymentMethods: vet.paymentMethods,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mon profil professionnel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gardez votre profil à jour pour que les clients puissent vous trouver
          et vous faire confiance.
        </p>
      </div>

      {/* Photo upload — top of the page */}
      <PhotoUpload currentPhotoUrl={vet.photoUrl} vetId={vet.id} />

      {/* Profile editor — uses updateVetProfile which never resets status */}
      <ProfileEditor defaultValues={defaultValues as any} isUpdate />
      <Link
        href={`/print/${vet.id}`}
        target="_blank"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
      >
        🖨️ Télécharger mon affiche
      </Link>
    </div>
  );
}
