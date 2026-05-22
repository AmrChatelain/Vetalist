"use client"

import { useState, useTransition } from "react"
import { addAvailabilityBlock, deleteAvailabilityBlock } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { CalendarOff, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface AvailabilityBlock {
  id: string
  startDate: Date
  endDate: Date
  reason: string | null
}

interface TimeOffManagerProps {
  initialBlocks: AvailabilityBlock[]
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function daysBetween(start: Date, end: Date) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / 86_400_000) + 1
}

export function TimeOffManager({ initialBlocks }: TimeOffManagerProps) {
  const [blocks, setBlocks]          = useState(initialBlocks)
  const [open, setOpen]              = useState(false)
  const [startDate, setStartDate]    = useState("")
  const [endDate, setEndDate]        = useState("")
  const [reason, setReason]          = useState("")
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates")
      return
    }
    startTransition(async () => {
      const res = await addAvailabilityBlock({ startDate, endDate, reason })
      if (res.success) {
        toast.success("Time off added")
        setOpen(false)
        setStartDate("")
        setEndDate("")
        setReason("")
        // Optimistically add a temp block — page will refresh with real data
        setBlocks((prev) => [
          ...prev,
          {
            id:        crypto.randomUUID(),
            startDate: new Date(startDate),
            endDate:   new Date(endDate),
            reason:    reason || null,
          },
        ])
      } else {
        toast.error(res.error ?? "Failed to add block")
      }
    })
  }

  function handleDelete(blockId: string) {
    startTransition(async () => {
      const res = await deleteAvailabilityBlock(blockId)
      if (res.success) {
        toast.success("Time off removed")
        setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      } else {
        toast.error(res.error ?? "Failed to remove")
      }
    })
  }

  const upcoming = blocks
    .filter((b) => new Date(b.endDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const past = blocks
    .filter((b) => new Date(b.endDate) < new Date())
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarOff size={15} className="text-amber-500" />
              Time Off & Closures
            </CardTitle>
            <CardDescription className="mt-0.5">
              Block dates when your clinic is closed or you're unavailable.
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus size={13} /> Add time off
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarOff size={16} className="text-amber-500" />
                  Block time off
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Start date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      End date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reason <span className="text-slate-400 font-normal normal-case">(optional)</span>
                  </Label>
                  <Input
                    id="reason"
                    placeholder="e.g. Vacation, Conference, Public holiday"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    <CalendarOff size={14} />
                    Blocking <strong>{daysBetween(new Date(startDate), new Date(endDate))} day(s)</strong> from{" "}
                    {formatDate(new Date(startDate))} to {formatDate(new Date(endDate))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Cancel</Button>
                </DialogClose>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={isPending || !startDate || !endDate}
                  className="gap-1.5"
                >
                  <Plus size={13} />
                  {isPending ? "Adding..." : "Add block"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upcoming */}
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarOff size={18} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No time off scheduled</p>
            <p className="text-xs text-slate-400 mt-1">Add blocks for vacations, holidays, or clinic closures.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upcoming</p>
                <div className="space-y-2">
                  {upcoming.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800">
                            {formatDate(block.startDate)}
                            {block.startDate.toISOString() !== block.endDate.toISOString() && (
                              <> → {formatDate(block.endDate)}</>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-white text-xs py-0">
                              {daysBetween(block.startDate, block.endDate)} day{daysBetween(block.startDate, block.endDate) > 1 ? "s" : ""}
                            </Badge>
                            {block.reason && (
                              <span className="text-xs text-slate-500 truncate">{block.reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() => handleDelete(block.id)}
                        disabled={isPending}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Past</p>
                <div className="space-y-2">
                  {past.slice(0, 3).map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg opacity-60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                        <div className="text-sm text-slate-500">
                          {formatDate(block.startDate)} → {formatDate(block.endDate)}
                          {block.reason && (
                            <span className="text-xs ml-2 text-slate-400">({block.reason})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}