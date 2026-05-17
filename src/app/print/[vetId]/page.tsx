import { notFound } from "next/navigation"
import db from "@/lib/db"
import type { Metadata } from "next"
import { PrintFlyer } from "@/components/PrintFlyer"

export const metadata: Metadata = {
  title:  "Affiche — Vetalist",
  robots: { index: false, follow: false },
}

interface PrintPageProps {
  params: Promise<{ vetId: string }>
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { vetId } = await params

  const vet = await db.vetProfile.findUnique({
    where:  { id: vetId, status: "ACTIVE" },
    select: {
      id:          true,
      clinicName:  true,
      city:        true,
      street:      true,
      zipCode:     true,
      clinicPhone: true,
      specialties: true,
      workingHours: {
        orderBy: { dayOfWeek: "asc" },
        select:  { dayOfWeek: true, startTime: true, endTime: true },
      },
      user: { select: { firstName: true, lastName: true } },
    },
  })

  if (!vet) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vetalist.fr"
  const profileUrl = `${appUrl}/vets/${vet.id}`

  return (
    <PrintFlyer
      vet={vet}
      profileUrl={profileUrl}
    />
  )
}