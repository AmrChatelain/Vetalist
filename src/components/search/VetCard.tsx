import Link from "next/link"
import Image from "next/image"
import {
  MapPin, Clock, Stethoscope, Languages,
  BadgeCheck, Siren, Star, ChevronRight,
  CalendarDays,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface VetCardProps {
  id:                 string
  firstName:          string
  lastName:           string
  photoUrl:           string | null
  image:              string | null
  clinicName:         string | null
  city:               string
  bio:                string | null
  specialties:        string[]
  languagesSpoken:    string[]
  careTypes:          string[]
  isVerified:         boolean
  acceptsEmergencies: boolean
  nextSlot:           Date | null
}

function formatNextSlot(slot: Date | null): { label: string; urgency: "today" | "week" | "later" | "none" } {
  if (!slot) return { label: "Indisponible", urgency: "none" }

  const now      = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekEnd  = new Date(now.getTime() + 7 * 86_400_000)

  const time = slot.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const date = slot.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })

  if (slot <= todayEnd) return { label: `Aujourd'hui à ${time}`, urgency: "today" }
  if (slot <= weekEnd)  return { label: `${date} à ${time}`,     urgency: "week"  }
  return                       { label: `${date} à ${time}`,     urgency: "later" }
}

const urgencyStyle = {
  today: "bg-emerald-50 text-emerald-700 border-emerald-200",
  week:  "bg-blue-50 text-blue-700 border-blue-200",
  later: "bg-slate-50 text-slate-600 border-slate-200",
  none:  "bg-red-50 text-red-500 border-red-100",
}

export function VetCard({
  id, firstName, lastName, photoUrl, image,
  clinicName, city, bio, specialties,
  languagesSpoken, isVerified, acceptsEmergencies,
  nextSlot,
}: VetCardProps) {
  const { label, urgency } = formatNextSlot(nextSlot ? new Date(nextSlot) : null)
  const displayPhoto = photoUrl || image
  const displaySpecialties = specialties.slice(0, 3)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-violet-200 transition-all group">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-purple-50 border border-slate-100">
            {displayPhoto ? (
              <Image
                src={displayPhoto}
                alt={`Dr. ${firstName} ${lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-400 font-bold text-xl font-['Sora']">
                {firstName[0]}{lastName[0]}
              </div>
            )}
          </div>
          {isVerified && (
            <div className="flex items-center justify-center mt-1.5 gap-0.5">
              <BadgeCheck size={12} className="text-blue-500" />
              <span className="text-[10px] text-blue-500 font-semibold">Vérifié</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 font-['Sora'] text-base leading-tight">
                Dr. {firstName} {lastName}
              </h3>
              {clinicName && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Stethoscope size={11} />
                  {clinicName}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} />
                {city}
              </p>
            </div>

            {/* Emergency badge */}
            {acceptsEmergencies && (
              <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 gap-1 text-xs flex-shrink-0">
                <Siren size={10} /> Urgences
              </Badge>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {bio}
            </p>
          )}

          {/* Specialties */}
          {displaySpecialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {displaySpecialties.map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-2 py-0.5"
                >
                  {s}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-[11px] text-slate-400 px-1 py-0.5">
                  +{specialties.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Languages */}
          {languagesSpoken.length > 0 && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <Languages size={11} />
              {languagesSpoken.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Next slot */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${urgencyStyle[urgency]}`}>
          <CalendarDays size={12} />
          {label}
        </div>

        {/* CTA */}
        <Link href={`/vets/${id}`}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90 gap-1.5 rounded-xl font-semibold text-xs"
          >
            Voir le profil
            <ChevronRight size={13} />
          </Button>
        </Link>
      </div>
    </div>
  )
}