"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  PawPrint, Calendar, Clock, Siren,
  Plus, User, Stethoscope, MapPin,
  Loader2, AlertCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Pet = {
  id:        string
  name:      string
  species:   string
  breed:     string | null
  birthDate: Date | null
  gender:    "MALE" | "FEMALE" | null
}

type Slot = { time: string; datetime: string }

type VetInfo = {
  id:                 string
  firstName:          string
  lastName:           string
  clinicName:         string | null
  city:               string
  photoUrl:           string | null
  slotDurationMin:    number
  acceptsEmergencies: boolean
  workingHours:       { dayOfWeek: number }[]
}

type NewPet = {
  name:      string
  species:   string
  breed:     string
  birthDate: string
  gender:    "" | "MALE" | "FEMALE"
}

type BookingState = {
  reason:          string
  notes:           string
  isEmergency:     boolean
  petMode:         "existing" | "new" | "none"
  selectedPetId:   string | null
  newPet:          NewPet
  selectedDate:    Date | null
  selectedSlot:    string | null
  selectedSlotTime: string | null
}

const SPECIES    = ["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Rongeur", "Autre"]
const MONTHS_FR  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const DAYS_FR    = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  value,
  onChange,
  workingDays,
}: {
  value:       Date | null
  onChange:    (d: Date) => void
  workingDays: number[]
}) {
  const today   = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today.getTime() + 60 * 86_400_000)

  const [viewing, setViewing] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const year        = viewing.getFullYear()
  const month       = viewing.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const canPrevMonth =
    new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1)

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { if (canPrevMonth) setViewing(new Date(year, month - 1, 1)) }}
          disabled={!canPrevMonth}
          className="p-1.5 rounded-lg hover:bg-violet-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} className="text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800 capitalize">
          {MONTHS_FR[month]} {year}
        </span>
        <button
          onClick={() => setViewing(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors"
        >
          <ChevronRight size={16} className="text-slate-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_FR.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((dayNum, i) => {
          if (!dayNum) return <div key={`e-${i}`} />

          const d          = new Date(year, month, dayNum)
          const selectable = d >= today && d <= maxDate && workingDays.includes(d.getDay())
          const selected   =
            value?.getFullYear() === year &&
            value?.getMonth()    === month &&
            value?.getDate()     === dayNum
          const isToday = today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year

          return (
            <button
              key={dayNum}
              onClick={() => selectable && onChange(new Date(year, month, dayNum))}
              disabled={!selectable}
              className={`
                mx-auto w-9 h-9 rounded-xl text-sm font-medium transition-all flex items-center justify-center
                ${selected
                  ? "bg-linear-to-br from-violet-500 to-purple-500 text-white shadow-md"
                  : selectable
                    ? "text-slate-700 hover:bg-violet-50 hover:text-violet-700 cursor-pointer"
                    : "text-slate-300 cursor-not-allowed"
                }
                ${isToday && !selected ? "ring-2 ring-violet-300" : ""}
              `}
            >
              {dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  const labels = ["Motif", "Animal", "Créneau", "Résumé"]
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n      = i + 1
        const done   = n < current
        const active = n === current
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? "bg-emerald-500 text-white" : active ? "bg-violet-500 text-white shadow-lg shadow-violet-200" : "bg-slate-100 text-slate-400"}
              `}>
                {done ? <CheckCircle2 size={14} /> : n}
              </div>
              <span className={`
                text-[10px] font-medium hidden sm:block transition-colors
                ${active ? "text-violet-600" : done ? "text-emerald-600" : "text-slate-400"}
              `}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 rounded-full transition-all ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BookingWizardProps {
  vet:        VetInfo
  pets:       Pet[]
  clientName: string
}

export function BookingWizard({ vet, pets, clientName }: BookingWizardProps) {
  const router = useRouter()

  const [step,        setStep]        = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [slots,        setSlots]        = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [state, setState] = useState<BookingState>({
    reason:           "",
    notes:            "",
    isEmergency:      false,
    petMode:          pets.length > 0 ? "existing" : "new",
    selectedPetId:    pets.length > 0 ? pets[0].id  : null,
    newPet:           { name: "", species: "Chien", breed: "", birthDate: "", gender: "" },
    selectedDate:     null,
    selectedSlot:     null,
    selectedSlotTime: null,
  })

  const workingDays = vet.workingHours.map((h) => h.dayOfWeek)

  // Fetch slots when date changes
  useEffect(() => {
    if (!state.selectedDate) return
    const dateStr = state.selectedDate.toLocaleDateString("en-CA") // YYYY-MM-DD
    setLoadingSlots(true)
    setSlots([])
    setState((prev) => ({ ...prev, selectedSlot: null, selectedSlotTime: null }))

    fetch(`/api/availability/${vet.id}/slots?date=${dateStr}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [state.selectedDate, vet.id])

  function set<K extends keyof BookingState>(key: K, val: BookingState[K]) {
    setState((prev) => ({ ...prev, [key]: val }))
  }

  function canNext(): boolean {
    switch (step) {
      case 1: return state.reason.trim().length >= 5
      case 2:
        if (state.petMode === "existing") return !!state.selectedPetId
        if (state.petMode === "new")      return state.newPet.name.trim().length > 0
        return true
      case 3: return !!state.selectedSlot
      case 4: return true
      default: return false
    }
  }

  async function handleConfirm() {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = {
      vetId:       vet.id,
      petId:       state.petMode === "existing" ? state.selectedPetId : null,
      startTime:   state.selectedSlot,
      reason:      state.reason,
      notes:       state.notes || undefined,
      isEmergency: state.isEmergency,
      newPet:      state.petMode === "new"
        ? {
            name:      state.newPet.name,
            species:   state.newPet.species,
            breed:     state.newPet.breed     || undefined,
            birthDate: state.newPet.birthDate || undefined,
            gender:    state.newPet.gender    || undefined,
          }
        : null,
    }

    try {
      const res  = await fetch("/api/appointments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error ?? "Une erreur s'est produite.")
        return
      }

      setStep(5)
    } catch {
      setSubmitError("Impossible de contacter le serveur. Réessayez.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Step 5: Success ──────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>

        <div>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e] mb-2">
            Demande envoyée !
          </h2>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
            Votre demande de rendez-vous a bien été transmise à{" "}
            <strong>Dr. {vet.firstName} {vet.lastName}</strong>.
            Vous recevrez un e-mail dès confirmation.
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left w-full max-w-sm shadow-sm space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Récapitulatif</p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-violet-400 shrink-0" />
            <span className="capitalize">
              {state.selectedDate?.toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long",
              })} à {state.selectedSlotTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Stethoscope size={14} className="text-violet-400 shrink-0" />
            Dr. {vet.firstName} {vet.lastName}
            {vet.clinicName && <span className="text-slate-400">· {vet.clinicName}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} className="text-violet-400 shrink-0" />
            Statut : <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs ml-1">En attente de confirmation</Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-sm">
          <Button
            onClick={() => router.push("/dashboard/client")}
            className="flex-1 bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-full"
          >
            Mes rendez-vous
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/search")}
            className="flex-1 rounded-full"
          >
            Retour à la recherche
          </Button>
        </div>
      </div>
    )
  }

  // ── Steps 1–4 ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <StepBar current={step} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Step 1: Reason ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1a2e] mb-1">
                Motif de la consultation
              </h2>
              <p className="text-sm text-slate-400">Décrivez brièvement la raison de votre visite</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Motif *
              </label>
              <textarea
                value={state.reason}
                onChange={(e) => set("reason", e.target.value)}
                placeholder="Ex : Visite de contrôle annuelle, mon chat semble léthargique depuis hier..."
                rows={4}
                maxLength={500}
                className="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
              <div className="text-xs text-right text-slate-400">{state.reason.length}/500</div>
            </div>

            {vet.acceptsEmergencies && (
              <label className={`
                flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
                ${state.isEmergency ? "border-rose-400 bg-rose-50" : "border-rose-200 bg-rose-50 hover:border-rose-300"}
              `}>
                <input
                  type="checkbox"
                  checked={state.isEmergency}
                  onChange={(e) => set("isEmergency", e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 text-sm">
                    <Siren size={14} /> C'est une urgence
                  </div>
                  <p className="text-xs text-rose-400 mt-0.5">
                    Ce vétérinaire accepte les consultations d'urgence
                  </p>
                </div>
              </label>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Notes supplémentaires (optionnel)
              </label>
              <textarea
                value={state.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Informations complémentaires pour le vétérinaire..."
                rows={2}
                maxLength={500}
                className="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Pet ─────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1a2e] mb-1">
                Votre animal
              </h2>
              <p className="text-sm text-slate-400">Quel animal concerne cette consultation ?</p>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-2">
              {pets.length > 0 && (
                <button
                  onClick={() => set("petMode", "existing")}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${state.petMode === "existing" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-violet-200"}`}
                >
                  Mes animaux
                </button>
              )}
              <button
                onClick={() => set("petMode", "new")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${state.petMode === "new" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-violet-200"}`}
              >
                <Plus size={13} className="inline mr-1" />Nouvel animal
              </button>
              <button
                onClick={() => set("petMode", "none")}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${state.petMode === "none" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-violet-200"}`}
              >
                Sans animal
              </button>
            </div>

            {/* Existing pets list */}
            {state.petMode === "existing" && (
              <div className="space-y-2">
                {pets.map((pet) => (
                  <label
                    key={pet.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${state.selectedPetId === pet.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-200"}`}
                  >
                    <input
                      type="radio"
                      name="pet"
                      value={pet.id}
                      checked={state.selectedPetId === pet.id}
                      onChange={() => set("selectedPetId", pet.id)}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <PawPrint size={16} className="text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{pet.name}</p>
                      <p className="text-xs text-slate-400">
                        {pet.species}
                        {pet.breed ? ` · ${pet.breed}` : ""}
                        {pet.birthDate
                          ? ` · né(e) le ${new Date(pet.birthDate).toLocaleDateString("fr-FR")}`
                          : ""}
                      </p>
                    </div>
                    {state.selectedPetId === pet.id && (
                      <CheckCircle2 size={18} className="text-violet-500 shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* New pet form */}
            {state.petMode === "new" && (
              <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Nom de l'animal *
                  </label>
                  <input
                    value={state.newPet.name}
                    onChange={(e) =>
                      setState((p) => ({ ...p, newPet: { ...p.newPet, name: e.target.value } }))
                    }
                    placeholder="Ex : Luna"
                    className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                    Espèce *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIES.map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setState((p) => ({ ...p, newPet: { ...p.newPet, species: s } }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${state.newPet.species === s ? "bg-violet-500 text-white border-violet-500" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Race
                    </label>
                    <input
                      value={state.newPet.breed}
                      onChange={(e) =>
                        setState((p) => ({ ...p, newPet: { ...p.newPet, breed: e.target.value } }))
                      }
                      placeholder="Ex : Labrador"
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Genre
                    </label>
                    <select
                      value={state.newPet.gender}
                      onChange={(e) =>
                        setState((p) => ({
                          ...p,
                          newPet: { ...p.newPet, gender: e.target.value as NewPet["gender"] },
                        }))
                      }
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                    >
                      <option value="">Non précisé</option>
                      <option value="MALE">Mâle</option>
                      <option value="FEMALE">Femelle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={state.newPet.birthDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setState((p) => ({ ...p, newPet: { ...p.newPet, birthDate: e.target.value } }))
                    }
                    className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                  />
                </div>
              </div>
            )}

            {/* No pet */}
            {state.petMode === "none" && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <User size={32} className="mx-auto mb-2 opacity-30" />
                La consultation sera enregistrée sans animal associé.
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Date & Slot ──────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-6">
            <div className="mb-5">
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1a2e] mb-1">
                Choisissez un créneau
              </h2>
              <p className="text-sm text-slate-400">
                Sélectionnez une date puis un horaire disponible
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <MiniCalendar
                  value={state.selectedDate}
                  onChange={(d) => set("selectedDate", d)}
                  workingDays={workingDays}
                />
              </div>

              {/* Time slots */}
              <div>
                {!state.selectedDate && (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-sm min-h-50">
                    <div>
                      <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                      Sélectionnez une date pour voir les créneaux
                    </div>
                  </div>
                )}

                {state.selectedDate && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide mb-3 capitalize">
                      {state.selectedDate.toLocaleDateString("fr-FR", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>

                    {loadingSlots && (
                      <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Chargement...
                      </div>
                    )}

                    {!loadingSlots && slots.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-sm">
                        <Clock size={28} className="mx-auto mb-2 opacity-30" />
                        Aucun créneau disponible ce jour
                      </div>
                    )}

                    {!loadingSlots && slots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                        {slots.map((slot) => (
                          <button
                            key={slot.datetime}
                            onClick={() => {
                              set("selectedSlot", slot.datetime)
                              set("selectedSlotTime", slot.time)
                            }}
                            className={`
                              py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                              ${state.selectedSlot === slot.datetime
                                ? "bg-linear-to-br from-violet-500 to-purple-500 text-white border-violet-500 shadow-md"
                                : "border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                              }
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Summary ──────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1a2e] mb-1">
                Confirmez votre rendez-vous
              </h2>
              <p className="text-sm text-slate-400">Vérifiez les informations avant de valider</p>
            </div>

            <div className="space-y-3">
              {/* Vet */}
              <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div className="w-12 h-12 rounded-xl bg-violet-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {vet.photoUrl ? (
                    <Image src={vet.photoUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-violet-600">
                      {vet.firstName[0]}{vet.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Dr. {vet.firstName} {vet.lastName}
                  </p>
                  {vet.clinicName && (
                    <p className="text-xs text-slate-500">{vet.clinicName}</p>
                  )}
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {vet.city}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date et heure</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize">
                    {state.selectedDate?.toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long",
                    })}{" "}
                    à {state.selectedSlotTime}
                  </p>
                  <p className="text-xs text-slate-400">Durée : {vet.slotDurationMin} min</p>
                </div>
              </div>

              {/* Pet */}
              {state.petMode !== "none" && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <PawPrint size={16} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Animal</p>
                    {state.petMode === "existing" && (() => {
                      const pet = pets.find((p) => p.id === state.selectedPetId)
                      return pet ? (
                        <p className="text-sm font-semibold text-slate-800">
                          {pet.name}{" "}
                          <span className="font-normal text-slate-400">({pet.species})</span>
                        </p>
                      ) : null
                    })()}
                    {state.petMode === "new" && (
                      <p className="text-sm font-semibold text-slate-800">
                        {state.newPet.name}{" "}
                        <span className="font-normal text-slate-400">
                          ({state.newPet.species}) — sera ajouté à votre profil
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope size={16} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Motif</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{state.reason}</p>
                  {state.isEmergency && (
                    <Badge className="mt-1.5 bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-100 text-xs gap-1">
                      <Siren size={10} /> Urgence
                    </Badge>
                  )}
                  {state.notes && (
                    <p className="text-xs text-slate-400 mt-1.5 italic">"{state.notes}"</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              En confirmant, vous acceptez les{" "}
              <span className="underline cursor-pointer">conditions d'utilisation</span> de Vetalist.
              Votre rendez-vous sera en attente de confirmation par le vétérinaire.
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={isSubmitting}
            className="rounded-full px-5 gap-2"
          >
            <ChevronLeft size={16} /> Précédent
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-full px-5 gap-2 text-slate-500"
          >
            <ChevronLeft size={16} /> Retour
          </Button>
        )}

        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-full px-6 gap-2 disabled:opacity-40"
          >
            Suivant <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-full px-6 gap-2 disabled:opacity-40"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
            ) : (
              <><CheckCircle2 size={16} /> Confirmer le rendez-vous</> 
            )} 
          </Button>
        )}
      </div>
    </div>
  )
}