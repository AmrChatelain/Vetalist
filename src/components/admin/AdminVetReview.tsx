"use client"

import { useState, useTransition } from "react"
import { approveVet, rejectVet } from "@/actions/vet.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, XCircle, ChevronDown,
  ShieldCheck, MapPin, Phone, Stethoscope, BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface VetApplication {
  id: string
  licenseNumber: string | null
  clinicName: string | null
  clinicPhone: string | null
  city: string
  street: string
  zipCode: string
  bio: string | null
  specialties: string[]
  languagesSpoken: string[]
  careTypes: string[]
  paymentMethods: string[]
  user: { firstName: string; lastName: string; email: string }
}

interface AdminVetReviewProps {
  vets: VetApplication[]
}

export function AdminVetReview({ vets: initialVets }: AdminVetReviewProps) {
  const router = useRouter()
  const [vets, setVets] = useState(initialVets)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleApprove(vetId: string) {
    startTransition(async () => {
      const res = await approveVet(vetId)
      if (res.success) {
        toast.success("Vet approved successfully")
        setVets((v) => v.filter((x) => x.id !== vetId))
        router.refresh()
      } else {
        toast.error(res.error ?? "Failed to approve")
      }
    })
  }

  function handleRejectSubmit(vetId: string) {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    startTransition(async () => {
      const res = await rejectVet(vetId, rejectReason)
      if (res.success) {
        toast.success("Application rejected")
        setVets((v) => v.filter((x) => x.id !== vetId))
        setRejectingId(null)
        setRejectReason("")
        router.refresh()
      } else {
        toast.error(res.error ?? "Failed to reject")
      }
    })
  }

  return (
    <div className="divide-y divide-slate-100">
      {vets.map((vet) => {
        const initials = `${vet.user.firstName[0]}${vet.user.lastName[0]}`.toUpperCase()
        const isExpanded = expanded === vet.id
        const isRejecting = rejectingId === vet.id

        return (
          <Collapsible
            key={vet.id}
            open={isExpanded}
            onOpenChange={(open) => setExpanded(open ? vet.id : null)}
          >
            {/* Main row */}
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm">
                  Dr. {vet.user.firstName} {vet.user.lastName}
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

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 gap-1.5"
                  onClick={() => handleApprove(vet.id)}
                  disabled={isPending}
                >
                  <CheckCircle2 size={13} /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 gap-1.5"
                  onClick={() => {
                    setRejectingId(isRejecting ? null : vet.id)
                    setExpanded(vet.id)
                  }}
                  disabled={isPending}
                >
                  <XCircle size={13} /> Reject
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            {/* Expanded detail */}
            <CollapsibleContent>
              <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                {/* Bio */}
                {vet.bio && (
                  <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed">
                    {vet.bio}
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.specialties.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.languagesSpoken.map((l, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{l}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Care Types</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.careTypes.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.paymentMethods.map((p, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                    <p className="text-sm text-slate-600">{vet.street}, {vet.zipCode} {vet.city}</p>
                  </div>
                  {vet.clinicPhone && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Phone size={11} /> {vet.clinicPhone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rejection form */}
                {isRejecting && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                      <XCircle size={13} /> Reason for rejection
                    </p>
                    <Textarea
                      placeholder="Explain why this application is being rejected. The vet will see this message."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="bg-white border-red-200 focus-visible:ring-red-300 text-sm min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setRejectingId(null); setRejectReason("") }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectSubmit(vet.id)}
                        disabled={isPending}
                        className="gap-1.5"
                      >
                        <XCircle size={12} />
                        {isPending ? "Rejecting..." : "Confirm rejection"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}