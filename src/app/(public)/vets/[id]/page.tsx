import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { getNextAvailableSlot } from "@/lib/get-next-slot"
import {
  MapPin, Phone, Clock, Languages, CreditCard,
  BadgeCheck, Siren, ChevronRight, Star,
  Stethoscope, CalendarDays, ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params

  const vet = await db.vetProfile.findUnique({
    where:  { id, status: "ACTIVE" },
    select: {
      clinicName:  true,
      city:        true,
      specialties: true,
      photoUrl:    true,
      bio:         true,
      user:        { select: { firstName: true, lastName: true, image: true } },
    },
  })

  if (!vet) return { title: "Vétérinaire introuvable" }

  const name        = `Dr. ${vet.user.firstName} ${vet.user.lastName}`
  const clinic      = vet.clinicName ? ` — ${vet.clinicName}` : ""
  const title       = `${name}${clinic} à ${vet.city}`
  const description = vet.bio
    ?? `Prenez rendez-vous avec ${name} à ${vet.city}. ${vet.specialties.slice(0, 3).join(", ")}.`
  const image       = vet.photoUrl ?? vet.user.image ?? "/Vitalist-logo.png"

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: [{ url: image, width: 400, height: 400, alt: name }],
      type:   "profile",
    },
    twitter: { card: "summary", title, description, images: [image] },
    alternates: { canonical: `https://vetalist.fr/vets/${id}` },
  }
}

interface VetProfilePageProps {
  params: Promise<{ id: string }>
}

function formatNextSlot(slot: Date | null) {
  if (!slot) return { label: "Aucune disponibilité trouvée", color: "text-slate-400" }

  const now      = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekEnd  = new Date(now.getTime() + 7 * 86_400_000)

  const time = slot.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const date = slot.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  if (slot <= todayEnd) return { label: `Aujourd'hui à ${time}`, color: "text-emerald-600" }
  if (slot <= weekEnd)  return { label: `${date} à ${time}`,     color: "text-blue-600"    }
  return                       { label: `${date} à ${time}`,     color: "text-slate-600"   }
}

// ── Build a full address string ───────────────────────────────────────────────
function buildAddress(vet: {
  street: string
  addressComplement?: string | null
  zipCode: string
  city: string
}): string {
  const parts = [vet.street]
  if (vet.addressComplement) parts.push(vet.addressComplement)
  parts.push(`${vet.zipCode} ${vet.city}`)
  return parts.join(", ")
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { id } = await params
  const session = await auth()

  const vet = await db.vetProfile.findUnique({
    where:   { id, status: "ACTIVE" },
    include: {
      user:         { select: { firstName: true, lastName: true, image: true, email: true } },
      workingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  })

  if (!vet) notFound()

  const nextSlot = await getNextAvailableSlot(vet.id)
  const { label: slotLabel, color: slotColor } = formatNextSlot(nextSlot)

  const DAY_NAMES    = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const displayPhoto = vet.photoUrl || vet.user.image
  const isLoggedIn   = !!session?.user

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back nav */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft size={14} /> Retour aux résultats
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── LEFT: Main profile ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-violet-500 to-purple-600" />

              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-violet-100 shadow-sm">
                      {displayPhoto ? (
                        <Image
                          src={displayPhoto}
                          alt={`Dr. ${vet.user.firstName} ${vet.user.lastName}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-400 font-bold text-2xl">
                          {vet.user.firstName[0]}{vet.user.lastName[0]}
                        </div>
                      )}
                    </div>
                    {vet.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  {vet.acceptsEmergencies && (
                    <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 gap-1">
                      <Siren size={12} /> Accepte les urgences
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 font-['Sora']">
                    Dr. {vet.user.firstName} {vet.user.lastName}
                  </h1>
                  {vet.isVerified && (
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100 gap-1 mt-1">
                      <BadgeCheck size={11} /> Vérifié
                    </Badge>
                  )}
                </div>

                {vet.clinicName && (
                  <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                    <Stethoscope size={14} className="text-slate-400" />
                    {vet.clinicName}
                  </p>
                )}

                {/* Address with complement */}
                <div className="mt-1 text-sm text-slate-400">
                  <p className="flex items-start gap-1.5">
                    <MapPin size={13} className="shrink-0 mt-0.5" />
                    <span>
                      {vet.street}, {vet.zipCode} {vet.city}
                      {vet.addressComplement && (
                        <>
                          <br />
                          <span className="text-slate-400">{vet.addressComplement}</span>
                        </>
                      )}
                    </span>
                  </p>
                </div>

                {vet.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {vet.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-2.5 py-1 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {vet.bio && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  À propos
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">{vet.bio}</p>
              </div>
            )}

            {/* Services & Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Services & informations
              </h2>

              {vet.careTypes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Types de soins
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {vet.careTypes.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {vet.languagesSpoken.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Languages size={11} /> Langues
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {vet.languagesSpoken.map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {vet.paymentMethods.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CreditCard size={11} /> Paiement
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {vet.paymentMethods.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Working hours */}
            {vet.workingHours.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock size={13} /> Horaires d'ouverture
                </h2>
                <div className="space-y-2">
                  {DAY_NAMES.map((dayName, dayIdx) => {
                    const hours   = vet.workingHours.find((h) => h.dayOfWeek === dayIdx)
                    const isToday = new Date().getDay() === dayIdx
                    return (
                      <div
                        key={dayIdx}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm
                          ${isToday ? "bg-violet-50 border border-violet-100" : ""}`}
                      >
                        <span className={`font-medium ${isToday ? "text-violet-700" : "text-slate-600"}`}>
                          {dayName}
                          {isToday && (
                            <span className="ml-2 text-xs text-violet-500 font-normal">Aujourd'hui</span>
                          )}
                        </span>
                        {hours ? (
                          <span className={`text-sm ${isToday ? "text-violet-700 font-semibold" : "text-slate-500"}`}>
                            {hours.startTime} – {hours.endTime}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm">Fermé</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Next slot + Book CTA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <CalendarDays size={14} className="text-violet-500" />
                Prochaine disponibilité
              </h2>

              <div className={`text-sm font-semibold ${slotColor} mb-4`}>
                {slotLabel}
              </div>

              {isLoggedIn ? (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 rounded-xl font-semibold gap-2"
                >
                  <Link href={`/book/${vet.id}`}>
                    Prendre rendez-vous
                    <ChevronRight size={15} />
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 rounded-xl font-semibold gap-2"
                  >
                    <Link href={`/login?callbackUrl=/vets/${vet.id}`}>
                      Se connecter pour réserver
                      <ChevronRight size={15} />
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-slate-400">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="text-violet-500 hover:underline">
                      Créer un compte gratuit
                    </Link>
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                Vétérinaire vérifié par Vetalist
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-700">Contact & adresse</h2>

              <div className="flex items-start gap-2.5 text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {vet.street}<br />
                  {vet.addressComplement && (
                    <><span className="text-slate-400">{vet.addressComplement}</span><br /></>
                  )}
                  {vet.zipCode} {vet.city}
                </span>
              </div>

              {vet.clinicPhone && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <a
                    href={`tel:${vet.clinicPhone}`}
                    className="hover:text-violet-600 transition-colors"
                  >
                    {vet.clinicPhone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>Durée des RDV : {vet.slotDurationMin} minutes</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-xs text-violet-700 leading-relaxed">
              <strong>Réservation sécurisée</strong><br />
              Votre rendez-vous sera confirmé par le vétérinaire. Vous recevrez un e-mail de confirmation.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}