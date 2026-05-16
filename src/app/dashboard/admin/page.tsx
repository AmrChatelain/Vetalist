import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPendingVets } from "@/actions/vet.actions"
import { getActiveVets } from "@/actions/admin.actions"
import { AdminVetReview } from "@/components/admin/AdminVetReview"
import { AdminVerifiedControl } from "@/components/admin/AdminVerifiedControl"
import db from "@/lib/db"
import { Users, Clock, CheckCircle2, ShieldCheck, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Admin — Tableau de bord",
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const [pendingVets, activeVets, totalVets, totalClients, activeCount] =
    await Promise.all([
      getPendingVets(),
      getActiveVets(),
      db.user.count({ where: { role: "VET" } }),
      db.user.count({ where: { role: "CLIENT" } }),
      db.vetProfile.count({ where: { status: "ACTIVE" } }),
    ])

  const stats = [
    { label: "Pending review", value: pendingVets.length, icon: Clock,         color: "text-amber-500",   bg: "bg-amber-50"   },
    { label: "Active vets",    value: activeCount,         icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total vets",     value: totalVets,           icon: ShieldCheck,   color: "text-blue-500",    bg: "bg-blue-50"    },
    { label: "Total clients",  value: totalClients,        icon: Users,         color: "text-violet-500",  bg: "bg-violet-50"  },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review applications and manage veterinarian badges.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Applications */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock size={15} className="text-amber-500" />
                Pending Applications
              </CardTitle>
              <CardDescription className="mt-0.5">
                Review license numbers and approve or reject each application.
              </CardDescription>
            </div>
            <Badge
              variant={pendingVets.length > 0 ? "default" : "secondary"}
              className={pendingVets.length > 0
                ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100"
                : ""}
            >
              {pendingVets.length} pending
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        {pendingVets.length === 0 ? (
          <CardContent className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={22} className="text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">All caught up!</p>
            <p className="text-sm text-slate-400 mt-1">No pending applications right now.</p>
          </CardContent>
        ) : (
          <AdminVetReview vets={pendingVets as any} />
        )}
      </Card>

      {/* Trusted Badge Control */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BadgeCheck size={15} className="text-blue-500" />
                Trusted Badge Control
              </CardTitle>
              <CardDescription className="mt-0.5">
                Grant or remove the trusted badge for active vets after a clinic visit or deeper verification.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {activeVets.filter((v) => v.isVerified).length} / {activeVets.length} trusted
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <AdminVerifiedControl vets={activeVets as any} />
      </Card>
    </div>
  )
}