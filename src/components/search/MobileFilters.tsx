"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SearchFilters } from "./SearchFilters"

export function MobileFilters() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden mb-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-slate-200 text-slate-700 rounded-xl"
          >
            <SlidersHorizontal size={16} />
            Filtrer les résultats
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
          <SheetHeader className="px-5 pt-6 pb-4 border-b border-slate-100">
            <SheetTitle className="text-base font-bold text-slate-900">
              Filtres
            </SheetTitle>
          </SheetHeader>
          <div className="p-5">
            <SearchFilters />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}