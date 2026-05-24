"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

const LABELS: Record<string, string> = {
  q:         "Recherche",
  city:      "Ville",
  specialty: "Spécialité",
  language:  "Langue",
  emergency: "Urgences",
  available: "Disponibilité",
  payment:   "Paiement",
}

const AVAILABLE_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  week:  "Cette semaine",
}

export function ActiveFiltersBar() {
  const router = useRouter()
  const params = useSearchParams()

  const chips: { key: string; value: string; label: string }[] = []

  const q         = params.get("q")
  const city      = params.get("city")
  const specialty = params.get("specialty")
  const language  = params.get("language")
  const emergency = params.get("emergency")
  const available = params.get("available")
  const payment   = params.get("payment")

  if (q)         chips.push({ key: "q",         value: q,         label: `"${q}"` })
  if (city)      chips.push({ key: "city",      value: city,      label: `📍 ${city}` })
  if (specialty) chips.push({ key: "specialty", value: specialty, label: specialty })
  if (emergency === "true") chips.push({ key: "emergency", value: "true", label: "Urgences" })
  if (available) chips.push({ key: "available", value: available, label: AVAILABLE_LABELS[available] ?? available })
  if (payment)   chips.push({ key: "payment",   value: payment,   label: payment })

  // Language can be multi-value (comma-separated)
  if (language) {
    language.split(",").filter(Boolean).forEach((lang) => {
      chips.push({ key: `language:${lang}`, value: lang, label: lang })
    })
  }

  if (chips.length === 0) return null

  function removeChip(key: string, value: string) {
    const sp = new URLSearchParams(params.toString())

    if (key.startsWith("language:")) {
      // Remove just this language from the comma-separated list
      const current = sp.get("language")?.split(",").filter(Boolean) ?? []
      const next    = current.filter((l) => l !== value)
      if (next.length > 0) sp.set("language", next.join(","))
      else                 sp.delete("language")
    } else {
      sp.delete(key)
    }

    router.push(`/search?${sp.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.push("/search", { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap py-3">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => removeChip(chip.key, chip.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium rounded-full hover:bg-violet-100 transition-colors group"
        >
          {chip.label}
          <X size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1 underline underline-offset-2"
        >
          Tout effacer
        </button>
      )}
    </div>
  )
}