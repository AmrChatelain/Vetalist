import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import db from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, PawPrint } from "lucide-react"
import { BookingWizard } from "@/components/booking/BookingWizard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Prendre rendez-vous",
  robots: { index: false, follow: false }, // booking pages not indexed
}

interface BookingPageProps {
  params: Promise<{ vetId: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { vetId } = await params

  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/book/${vetId}`)
  if (session.user.role !== "CLIENT") redirect("/dashboard/vet")

  const [vet, pets] = await Promise.all([
    db.vetProfile.findUnique({
      where:  { id: vetId, status: "ACTIVE", isActive: true },
      select: {
        id:                 true,
        photoUrl:           true,
        clinicName:         true,
        city:               true,
        slotDurationMin:    true,
        acceptsEmergencies: true,
        workingHours:       { select: { dayOfWeek: true } },
        user:               { select: { firstName: true, lastName: true, image: true } },
      },
    }),
    db.pet.findMany({
      where:   { clientId: session.user.id, isArchived: false },
      orderBy: { name: "asc" },
    }),
  ])

  if (!vet) notFound()

  const vetInfo = {
    id:                 vet.id,
    firstName:          vet.user.firstName,
    lastName:           vet.user.lastName,
    clinicName:         vet.clinicName,
    city:               vet.city,
    photoUrl:           vet.photoUrl || vet.user.image || null,
    slotDurationMin:    vet.slotDurationMin,
    acceptsEmergencies: vet.acceptsEmergencies,
    workingHours:       vet.workingHours,
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/vets/${vetId}`}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={14} /> Retour au profil
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <PawPrint className="text-white w-4 h-4" />
            </div>
            <span className="font-['Playfair_Display'] text-xl font-semibold text-[#1e1a2e]">
              Veta<span className="text-[#a78bfa]">list</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e] mb-3">
            Prendre rendez-vous
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>avec</span>
            {vet.photoUrl || vet.user.image ? (
              <Image
                src={(vet.photoUrl || vet.user.image)!}
                alt=""
                width={24}
                height={24}
                className="rounded-full w-6 h-6 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-600">
                {vet.user.firstName[0]}
              </div>
            )}
            <span className="font-semibold text-slate-700">
              Dr. {vet.user.firstName} {vet.user.lastName}
            </span>
            {vet.clinicName && (
              <span className="text-slate-400 hidden sm:inline">· {vet.clinicName}</span>
            )}
          </div>
        </div>

        <BookingWizard
          vet={vetInfo}
          pets={pets}
          clientName={`${session.user.firstName} ${session.user.lastName}`}
        />
      </div>
    </div>
  )
}