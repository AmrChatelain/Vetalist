"use client"

import { useState, useTransition } from "react"
import { toggleVetVerified } from "@/actions/admin.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BadgeCheck, MapPin, Stethoscope, ShieldCheck, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ActiveVet {
  id: string
  clinicName: string | null
  city: string
  licenseNumber: string | null
  isVerified: boolean
  specialties: string[]
  user: { firstName: string; lastName: string; email: string }
}

interface AdminVerifiedControlProps {
  vets: ActiveVet[]
}

export function AdminVerifiedControl({ vets: initialVets }: AdminVerifiedControlProps) {
  const router = useRouter()
  const [vets, setVets] = useState(initialVets)
  const [isPending, startTransition] = useTransition()

  function handleToggle(vetId: string, current: boolean) {
    const next = !current

    // Optimistic update
    setVets((prev) => prev.map((v) => v.id === vetId ? { ...v, isVerified: next } : v))

    startTransition(async () => {
      const res = await toggleVetVerified(vetId, next)
      if (res.success) {
        toast.success(next ? "Trusted badge granted ✓" : "Badge removed")
        router.refresh()
      } else {
        // Rollback
        setVets((prev) => prev.map((v) => v.id === vetId ? { ...v, isVerified: current } : v))
        toast.error(res.error ?? "Failed to update")
      }
    })
  }

  if (vets.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="font-medium text-slate-500">No active vets yet.</p>
        <p className="text-sm mt-1">Approved vets will appear here.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {vets.map((vet) => {
        const initials = `${vet.user.firstName[0]}${vet.user.lastName[0]}`.toUpperCase()

        return (
          <div
            key={vet.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold
                ${vet.isVerified
                  ? "bg-gradient-to-br from-blue-500 to-blue-700 ring-2 ring-blue-300 ring-offset-1"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"
                }`}
              >
                {initials}
              </div>
              {vet.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <BadgeCheck size={8} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm">
                  Dr. {vet.user.firstName} {vet.user.lastName}
                </span>
                {vet.isVerified && (
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100 gap-1 text-xs">
                    <BadgeCheck size={9} /> Trusted
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{vet.user.email}</div>
              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                {vet.licenseNumber && (
                  <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 font-mono text-xs gap-1">
                    <ShieldCheck size={9} /> {vet.licenseNumber}
                  </Badge>
                )}
                {vet.clinicName && (
                  <Badge variant="outline" className="text-slate-600 text-xs gap-1">
                    <Stethoscope size={9} /> {vet.clinicName}
                  </Badge>
                )}
                <Badge variant="outline" className="text-slate-600 text-xs gap-1">
                  <MapPin size={9} /> {vet.city}
                </Badge>
              </div>
            </div>

            {/* Toggle + Button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Switch
                  id={`verified-${vet.id}`}
                  checked={vet.isVerified}
                  onCheckedChange={() => handleToggle(vet.id, vet.isVerified)}
                  disabled={isPending}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor={`verified-${vet.id}`}
                  className={`text-xs font-semibold cursor-pointer ${
                    vet.isVerified ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {vet.isVerified ? "Trusted" : "Standard"}
                </Label>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handleToggle(vet.id, vet.isVerified)}
                className={vet.isVerified
                  ? "text-slate-500 border-slate-200 hover:text-slate-700 gap-1.5"
                  : "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 gap-1.5"}
              >
                {vet.isVerified
                  ? <><ShieldOff size={12} /> Remove badge</>
                  : <><BadgeCheck size={12} /> Grant badge</>}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}