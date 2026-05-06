"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SlidersHorizontal, X, Siren, CalendarDays, Languages, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  VETERINARY_SPECIALTIES,
  CARE_TYPES,
  LANGUAGES,
  PAYMENT_METHODS,
} from "@/lib/veterinary-specialties"

const ALL_SPECIALTIES = [...VETERINARY_SPECIALTIES, ...CARE_TYPES].filter(
  (v, i, arr) => arr.indexOf(v) === i
)

interface FilterChipProps {
  label:    string
  active:   boolean
  onClick:  () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all
        ${active
          ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
          : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
        }`}
    >
      {label}
    </button>
  )
}

export function SearchFilters() {
  const router     = useRouter()
  const params     = useSearchParams()

  const get = (key: string) => params.get(key) ?? ""

  const update = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    router.push(`/search?${sp.toString()}`, { scroll: false })
  }, [params, router])

  const toggle = useCallback((key: string, value: string) => {
    const current = get(key)
    update(key, current === value ? "" : value)
  }, [get, update])

  function clearAll() {
    const q = get("q")
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false })
  }

  const activeCount = ["specialty", "language", "emergency", "available", "payment"]
    .filter((k) => get(k)).length

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
          <SlidersHorizontal size={15} className="text-violet-500" />
          Filtres
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Tout effacer
          </button>
        )}
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          <CalendarDays size={12} /> Disponibilité
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "today", label: "Aujourd'hui" },
            { value: "week",  label: "Cette semaine" },
          ].map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={get("available") === opt.value}
              onClick={() => toggle("available", opt.value)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Emergency */}
      <div>
        <div
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
            ${get("emergency") === "true"
              ? "bg-rose-50 border-rose-200"
              : "bg-slate-50 border-slate-200 hover:border-rose-200"
            }`}
          onClick={() => toggle("emergency", "true")}
        >
          <div className="flex items-center gap-2">
            <Siren size={15} className={get("emergency") === "true" ? "text-rose-500" : "text-slate-400"} />
            <div>
              <div className={`text-sm font-semibold ${get("emergency") === "true" ? "text-rose-700" : "text-slate-700"}`}>
                Accepte les urgences
              </div>
              <div className="text-xs text-slate-400">Disponible pour les cas urgents</div>
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5
            ${get("emergency") === "true" ? "bg-rose-500 justify-end" : "bg-slate-200 justify-start"}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Specialty — show top 10 + scroll */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Spécialité
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {ALL_SPECIALTIES.slice(0, 20).map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={get("specialty") === s}
              onClick={() => toggle("specialty", s)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Language */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          <Languages size={12} /> Langue
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <FilterChip
              key={l}
              label={l}
              active={get("language") === l}
              onClick={() => toggle("language", l)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Payment */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          <CreditCard size={12} /> Paiement
        </div>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((p) => (
            <FilterChip
              key={p}
              label={p}
              active={get("payment") === p}
              onClick={() => toggle("payment", p)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}