"use client"

import { useState, useTransition } from "react"
import { updateSlotDuration } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { Clock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const SLOT_OPTIONS = [
  { value: 15,  label: "15 min",  desc: "Quick consultations"  },
  { value: 30,  label: "30 min",  desc: "Standard appointment" },
  { value: 45,  label: "45 min",  desc: "Extended visit"       },
  { value: 60,  label: "60 min",  desc: "Full hour"            },
]

interface SlotDurationPickerProps {
  currentDuration: number
}

export function SlotDurationPicker({ currentDuration }: SlotDurationPickerProps) {
  const [selected, setSelected]   = useState(currentDuration)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const res = await updateSlotDuration(selected)
      if (res.success) {
        toast.success("Slot duration updated")
      } else {
        toast.error(res.error ?? "Failed to update")
      }
    })
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock size={15} className="text-blue-500" />
          Appointment Slot Duration
        </CardTitle>
        <CardDescription>
          How long is each appointment slot? Clients will book in these increments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={String(selected)}
          onValueChange={(v) => setSelected(Number(v))}
          className="grid grid-cols-2 gap-3"
        >
          {SLOT_OPTIONS.map((opt) => (
            <div key={opt.value}>
              <RadioGroupItem
                value={String(opt.value)}
                id={`slot-${opt.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`slot-${opt.value}`}
                className={`flex flex-col gap-0.5 p-4 rounded-lg border-2 cursor-pointer transition-all
                  peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50
                  hover:border-slate-300 hover:bg-slate-50
                  ${selected === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
              >
                <span className="font-semibold text-slate-900 text-sm">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          onClick={handleSave}
          disabled={isPending || selected === currentDuration}
          className="w-full gap-2"
        >
          <Save size={14} />
          {isPending ? "Saving..." : "Save slot duration"}
        </Button>
      </CardContent>
    </Card>
  )
}