import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveVets } from "@/actions/admin.actions"
import { AdminVerifiedControl } from "@/components/admin/AdminVerifiedControl"
import { BadgeCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Badges",
  robots: { index: false, follow: false },
};


export default async function AdminBadgesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const activeVets = await getActiveVets()
  const trustedCount = activeVets.filter((v) => v.isVerified).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Badges de confiance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Accordez ou retirez le badge "Vétérinaire de confiance" après vérification approfondie.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <BadgeCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong className="block mb-1">Comment fonctionne le badge</strong>
          Le badge "Vérifié" s'affiche sur le profil public du vétérinaire et dans les résultats de recherche.
          Accordez-le après une visite de clinique ou une vérification approfondie des documents.
          Vous pouvez le retirer à tout moment si nécessaire.
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BadgeCheck size={15} className="text-blue-500" />
                Contrôle des badges
              </CardTitle>
              <CardDescription className="mt-0.5">
                Activez ou désactivez le badge de confiance pour chaque vétérinaire actif.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {trustedCount} / {activeVets.length} vérifiés
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <AdminVerifiedControl vets={activeVets as any} />
      </Card>
    </div>
  )
}