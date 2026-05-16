import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPendingVets } from "@/actions/vet.actions"
import { getActiveVets } from "@/actions/admin.actions"
import { AdminVetReview } from "@/components/admin/AdminVetReview"
import { AdminVerifiedControl } from "@/components/admin/AdminVerifiedControl"
import db from "@/lib/db"
import { Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Vétérinaires",
  robots: { index: false, follow: false },
};


export default async function AdminVetsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const [pendingVets, activeVets, rejectedCount] = await Promise.all([
    getPendingVets(),
    getActiveVets(),
    db.vetProfile.count({ where: { status: "REJECTED" } }),
  ])

  const rejectedVets = await db.vetProfile.findMany({
    where: { status: "REJECTED" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { user: { firstName: "asc" } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gestion des vétérinaires
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Examinez les candidatures et gérez les profils vétérinaires.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pending" className="gap-2">
            <Clock size={13} />
            En attente
            {pendingVets.length > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingVets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <CheckCircle2 size={13} />
            Approuvés ({activeVets.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle size={13} />
            Refusés ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock size={15} className="text-amber-500" />
                    Candidatures en attente
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Vérifiez le numéro de licence et approuvez ou refusez chaque candidature.
                  </CardDescription>
                </div>
                <Badge
                  variant={pendingVets.length > 0 ? "default" : "secondary"}
                  className={pendingVets.length > 0
                    ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    : ""}
                >
                  {pendingVets.length} en attente
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            {pendingVets.length === 0 ? (
              <CardContent className="py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">Tout est à jour !</p>
                <p className="text-sm text-slate-400 mt-1">Aucune candidature en attente.</p>
              </CardContent>
            ) : (
              <AdminVetReview vets={pendingVets as any} />
            )}
          </Card>
        </TabsContent>

        {/* Active */}
        <TabsContent value="active" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    Vétérinaires approuvés
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Tous les vétérinaires actifs sur la plateforme.
                  </CardDescription>
                </div>
                <Badge variant="secondary">{activeVets.length} actifs</Badge>
              </div>
            </CardHeader>
            <Separator />
            <AdminVerifiedControl vets={activeVets as any} />
          </Card>
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle size={15} className="text-red-500" />
                Candidatures refusées
              </CardTitle>
              <CardDescription className="mt-0.5">
                Ces vétérinaires ont été refusés. Ils peuvent soumettre à nouveau.
              </CardDescription>
            </CardHeader>
            <Separator />
            {rejectedVets.length === 0 ? (
              <CardContent className="py-16 text-center text-slate-400">
                <p>Aucune candidature refusée.</p>
              </CardContent>
            ) : (
              <div className="divide-y divide-slate-100">
                {rejectedVets.map((vet) => (
                  <div key={vet.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">
                      {vet.user.firstName[0]}{vet.user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm">
                        Dr. {vet.user.firstName} {vet.user.lastName}
                      </div>
                      <div className="text-xs text-slate-400">{vet.user.email}</div>
                      {vet.rejectionReason && (
                        <div className="text-xs text-red-500 mt-1 bg-red-50 rounded px-2 py-1 inline-block">
                          {vet.rejectionReason}
                        </div>
                      )}
                    </div>
                    <Badge variant="destructive" className="text-xs flex-shrink-0">
                      Refusé
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}