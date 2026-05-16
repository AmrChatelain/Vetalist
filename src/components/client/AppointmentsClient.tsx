"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cancelAppointmentByClient } from "@/actions/client.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  CalendarDays, Clock, MapPin, PawPrint,
  Stethoscope, X, AlertCircle, ChevronRight, Siren,
} from "lucide-react"

type Appointment = {
  id:          string
  startTime:   Date
  endTime:     Date
  status:      string
  reason:      string
  notes:       string | null
  isEmergency: boolean
  vet: {
    id:         string
    clinicName: string | null
    city:       string
    user:       { firstName: string; lastName: string }
  }
  pet: { name: string; species: string } | null
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "En attente", className: "bg-amber-100 text-amber-700 border-amber-200"       },
  CONFIRMED: { label: "Confirmé",   className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Annulé",     className: "bg-red-100 text-red-700 border-red-200"             },
  DONE:      { label: "Terminé",    className: "bg-slate-100 text-slate-600 border-slate-200"       },
}

const SPECIES_EMOJI: Record<string, string> = {
  Chien: "🐕", Chat: "🐱", Lapin: "🐰", Oiseau: "🦜",
  Reptile: "🦎", Rongeur: "🐹", Autre: "🐾",
}

function AppointmentCard({
  apt,
  onCancel,
}: {
  apt: Appointment
  onCancel: (apt: Appointment) => void
}) {
  const status     = STATUS_LABELS[apt.status] ?? STATUS_LABELS.PENDING
  const canCancel  = apt.status === "PENDING" || apt.status === "CONFIRMED"
  const isPast     = new Date(apt.startTime) < new Date()

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Stethoscope size={16} className="text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              Dr. {apt.vet.user.firstName} {apt.vet.user.lastName}
            </p>
            {apt.vet.clinicName && (
              <p className="text-xs text-slate-400">{apt.vet.clinicName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {apt.isEmergency && (
            <Badge className="bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-100 gap-1 text-xs">
              <Siren size={10} /> Urgence
            </Badge>
          )}
          <Badge className={`text-xs border hover:opacity-100 ${status.className}`}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-violet-400 shrink-0" />
          <span className="capitalize">
            {new Date(apt.startTime).toLocaleDateString("fr-FR", {
              weekday: "short", day: "numeric", month: "long",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-violet-400 shrink-0" />
          {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-violet-400 shrink-0" />
          {apt.vet.city}
        </div>
        {apt.pet && (
          <div className="flex items-center gap-2">
            <PawPrint size={13} className="text-violet-400 shrink-0" />
            {SPECIES_EMOJI[apt.pet.species] ?? "🐾"} {apt.pet.name}
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-600">
        <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">Motif : </span>
        {apt.reason}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full text-xs gap-1"
        >
          <Link href={`/vets/${apt.vet.id}`}>
            Voir le profil <ChevronRight size={12} />
          </Link>
        </Button>
        {canCancel && !isPast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(apt)}
            className="rounded-full text-xs text-red-500 border-red-200 hover:bg-red-50 gap-1 ml-auto"
          >
            <X size={12} /> Annuler
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({
  apt,
  onClose,
  onConfirm,
  isPending,
}: {
  apt:       Appointment
  onClose:   () => void
  onConfirm: (reason: string) => void
  isPending: boolean
}) {
  const [reason, setReason] = useState("")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Annuler ce rendez-vous ?</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Dr. {apt.vet.user.firstName} {apt.vet.user.lastName} —{" "}
              {new Date(apt.startTime).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long",
              })}{" "}
              à{" "}
              {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
            Motif d'annulation (optionnel)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : Indisponibilité, urgence personnelle..."
            rows={3}
            className="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-full"
          >
            Retour
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AppointmentsClient({
  upcoming,
  past,
}: {
  upcoming: Appointment[]
  past:     Appointment[]
}) {
  const router            = useRouter()
  const [tab, setTab]     = useState<"upcoming" | "past">("upcoming")
  const [cancelling, setCancelling] = useState<Appointment | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancelConfirm(reason: string) {
    if (!cancelling) return
    startTransition(async () => {
      const result = await cancelAppointmentByClient(cancelling.id, reason || undefined)
      if (result.success) {
        toast.success("Rendez-vous annulé avec succès")
        setCancelling(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Une erreur s'est produite")
      }
    })
  }

  const displayed = tab === "upcoming" ? upcoming : past

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 w-fit shadow-sm">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? "bg-violet-500 text-white shadow-sm"
                : "text-slate-500 hover:text-violet-600"
            }`}
          >
            {t === "upcoming"
              ? `À venir ${upcoming.length > 0 ? `(${upcoming.length})` : ""}`
              : `Passés ${past.length > 0 ? `(${past.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16">
          <CalendarDays size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 text-sm">
            {tab === "upcoming"
              ? "Aucun rendez-vous à venir"
              : "Aucun rendez-vous passé"}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/search"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline"
            >
              Trouver un vétérinaire <ChevronRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((apt) => (
            <AppointmentCard key={apt.id} apt={apt} onCancel={setCancelling} />
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelling && (
        <CancelModal
          apt={cancelling}
          onClose={() => setCancelling(null)}
          onConfirm={handleCancelConfirm}
          isPending={isPending}
        />
      )}
    </div>
  )
}