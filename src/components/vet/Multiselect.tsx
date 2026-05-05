"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronDown, Search, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface MultiSelectProps {
  options:     readonly string[]
  selected:    string[]
  onChange:    (values: string[]) => void
  placeholder?: string
  label?:      string
  error?:      string
  hint?:       string
  maxHeight?:  number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionner...",
  label,
  error,
  hint,
  maxHeight = 260,
}: MultiSelectProps) {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState("")
  const containerRef        = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = options.filter(
    (o) =>
      o.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(o)
  )

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
      setQuery("")
    }
  }

  function remove(value: string) {
    onChange(selected.filter((v) => v !== value))
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger box */}
      <div
        className={`min-h-[42px] w-full rounded-lg border bg-slate-50 px-3 py-2 cursor-pointer transition-all
          ${open
            ? "border-blue-400 ring-2 ring-blue-100 bg-white"
            : error
              ? "border-red-300"
              : "border-slate-200 hover:border-slate-300"
          }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1.5 items-center min-h-[24px]">
          {selected.length === 0 ? (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          ) : (
            selected.map((val) => (
              <Badge
                key={val}
                variant="secondary"
                className="text-xs gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
              >
                {val}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(val) }}
                  className="rounded-full hover:bg-blue-200 p-0.5 transition-colors"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))
          )}
          <ChevronDown
            size={14}
            className={`ml-auto text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden mt-1"
          style={{ maxWidth: containerRef.current?.offsetWidth }}
        >
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-7 h-8 text-sm bg-slate-50"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Aucun résultat
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between group"
                  onClick={(e) => { e.stopPropagation(); toggle(option) }}
                >
                  {option}
                  <Check size={13} className="opacity-0 group-hover:opacity-50 text-blue-500" />
                </button>
              ))
            )}
          </div>

          {/* Selected count */}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 font-medium"
                onClick={(e) => { e.stopPropagation(); onChange([]) }}
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}