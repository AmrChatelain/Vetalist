"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Stethoscope, User, Loader2, X } from "lucide-react"

type Suggestion = {
  type:  "city" | "specialty" | "vet"
  label: string
  sub?:  string
  id?:   string
  city?: string
}

interface SearchBarProps {
  initialQuery?: string
  size?:         "default" | "large"
  placeholder?:  string
  onSearch?:     (params: Record<string, string>) => void
  autoFocus?:    boolean
}

export function SearchBar({
  initialQuery = "",
  size         = "default",
  placeholder  = "Spécialité, ville, nom du vétérinaire...",
  onSearch,
  autoFocus    = false,
}: SearchBarProps) {
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef  = useRef<HTMLDivElement>(null)

  const [query, setQuery]           = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]       = useState(false)
  const [open, setOpen]             = useState(false)
  const [activeIdx, setActiveIdx]   = useState(-1)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout>>()

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  // Fetch suggestions with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()

        const all: Suggestion[] = [
          ...data.cities.map((c: string) => ({ type: "city" as const, label: c })),
          ...data.specialties.map((s: string) => ({ type: "specialty" as const, label: s })),
          ...data.vets.map((v: any) => ({
            type:  "vet" as const,
            label: v.name,
            sub:   v.clinicName ? `${v.clinicName} · ${v.city}` : v.city,
            id:    v.id,
            city:  v.city,
          })),
        ]

        setSuggestions(all)
        setOpen(all.length > 0)
        setActiveIdx(-1)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 220)
  }, [query])

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams(params)
    return `/search?${sp.toString()}`
  }

  function handleSelect(s: Suggestion) {
    setOpen(false)
    if (s.type === "vet" && s.id) {
      router.push(`/vets/${s.id}`)
      return
    }
    const params: Record<string, string> = {}
    if (s.type === "city")      params.city      = s.label
    if (s.type === "specialty") params.specialty  = s.label
    if (query) params.q = query
    if (onSearch) onSearch(params)
    else router.push(buildUrl(params))
    setQuery(s.label)
  }

  function handleSubmit() {
    if (!query.trim()) return
    setOpen(false)
    const params: Record<string, string> = { q: query.trim() }
    if (onSearch) onSearch(params)
    else router.push(buildUrl(params))
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter") handleSubmit()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx])
      } else {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const isLarge = size === "large"

  const iconMap = {
    city:      <MapPin size={14} className="text-violet-400 flex-shrink-0" />,
    specialty: <Stethoscope size={14} className="text-blue-400 flex-shrink-0" />,
    vet:       <User size={14} className="text-emerald-400 flex-shrink-0" />,
  }

  const labelMap = {
    city:      "Ville",
    specialty: "Spécialité",
    vet:       "Vétérinaire",
  }

  // Group suggestions
  const cities     = suggestions.filter((s) => s.type === "city")
  const specialties = suggestions.filter((s) => s.type === "specialty")
  const vets       = suggestions.filter((s) => s.type === "vet")

  let globalIdx = 0
  function getIdx() { return globalIdx++ }

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className={`flex items-center gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm
        focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-violet-400 transition-all
        ${isLarge ? "px-5 py-3.5" : "px-4 py-2.5"}`}
      >
        {loading
          ? <Loader2 size={isLarge ? 18 : 16} className="text-violet-400 animate-spin flex-shrink-0" />
          : <Search size={isLarge ? 18 : 16} className="text-slate-400 flex-shrink-0" />}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400
            ${isLarge ? "text-base" : "text-sm"}`}
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); inputRef.current?.focus() }}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={15} />
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className={`bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold
            hover:opacity-90 transition-opacity flex-shrink-0
            ${isLarge ? "px-5 py-2 text-sm" : "px-3.5 py-1.5 text-xs"}`}
        >
          Rechercher
        </button>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          ref={dropRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* Cities */}
          {cities.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Villes
              </div>
              {cities.map((s) => {
                const idx = getIdx()
                return (
                  <button
                    key={`city-${s.label}`}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50 transition-colors
                      ${activeIdx === idx ? "bg-violet-50" : ""}`}
                    onClick={() => handleSelect(s)}
                  >
                    {iconMap.city}
                    <span className="text-sm text-slate-700">{s.label}</span>
                    <span className="ml-auto text-xs text-slate-400">{labelMap.city}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className={cities.length > 0 ? "border-t border-slate-100" : ""}>
              <div className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Spécialités
              </div>
              {specialties.map((s) => {
                const idx = getIdx()
                return (
                  <button
                    key={`spec-${s.label}`}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50 transition-colors
                      ${activeIdx === idx ? "bg-violet-50" : ""}`}
                    onClick={() => handleSelect(s)}
                  >
                    {iconMap.specialty}
                    <span className="text-sm text-slate-700">{s.label}</span>
                    <span className="ml-auto text-xs text-slate-400">{labelMap.specialty}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Vets */}
          {vets.length > 0 && (
            <div className={(cities.length > 0 || specialties.length > 0) ? "border-t border-slate-100" : ""}>
              <div className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vétérinaires
              </div>
              {vets.map((s) => {
                const idx = getIdx()
                return (
                  <button
                    key={`vet-${s.id}`}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50 transition-colors
                      ${activeIdx === idx ? "bg-violet-50" : ""}`}
                    onClick={() => handleSelect(s)}
                  >
                    {iconMap.vet}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{s.label}</div>
                      {s.sub && <div className="text-xs text-slate-400 truncate">{s.sub}</div>}
                    </div>
                    <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{labelMap.vet}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5">
            <Search size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              Appuyez sur <kbd className="bg-white border border-slate-200 rounded px-1 text-[10px]">Entrée</kbd> pour rechercher
            </span>
          </div>
        </div>
      )}
    </div>
  )
}