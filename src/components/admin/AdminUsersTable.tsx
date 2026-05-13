"use client"

import { useState } from "react"
import { Search, User, Stethoscope, BadgeCheck, CalendarDays, PawPrint } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientUser {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  image: string | null
  _count: { clientAppointments: number; pets: number }
}

interface VetUser {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  image: string | null
  vetProfile: {
    status: string
    clinicName: string | null
    city: string
    isVerified: boolean
  } | null
}

interface AdminUsersTableProps {
  clients: ClientUser[]
  vets: VetUser[]
}

const vetStatusStyle: Record<string, string> = {
  ACTIVE:              "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_ONBOARDING:  "bg-slate-50 text-slate-600 border-slate-200",
  PENDING_APPROVAL:    "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED:            "bg-red-50 text-red-600 border-red-200",
}

const vetStatusLabel: Record<string, string> = {
  ACTIVE:             "Actif",
  PENDING_ONBOARDING: "Profil incomplet",
  PENDING_APPROVAL:   "En attente",
  REJECTED:           "Refusé",
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function AdminUsersTable({ clients, vets }: AdminUsersTableProps) {
  const [search, setSearch] = useState("")

  const filterClients = clients.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const filterVets = vets.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.vetProfile?.clinicName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="clients" className="px-6 pt-4 pb-2">
        <TabsList className="bg-slate-100 mb-4">
          <TabsTrigger value="clients" className="gap-1.5 text-xs">
            <User size={12} /> Clients ({filterClients.length})
          </TabsTrigger>
          <TabsTrigger value="vets" className="gap-1.5 text-xs">
            <Stethoscope size={12} /> Vétérinaires ({filterVets.length})
          </TabsTrigger>
        </TabsList>

        {/* Clients tab */}
        <TabsContent value="clients">
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Utilisateur</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">E-mail</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Animaux</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">RDV</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filterClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : filterClients.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <PawPrint size={11} /> {u._count.pets}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <CalendarDays size={11} /> {u._count.clientAppointments}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Vets tab */}
        <TabsContent value="vets">
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Vétérinaire</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Clinique</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Badge</th>
                  <th className="px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filterVets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                      Aucun vétérinaire trouvé
                    </td>
                  </tr>
                ) : filterVets.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">Dr. {u.firstName} {u.lastName}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {u.vetProfile?.clinicName ?? "—"}<br/>
                      <span className="text-slate-400">{u.vetProfile?.city ?? ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.vetProfile ? (
                        <Badge
                          variant="outline"
                          className={`text-xs ${vetStatusStyle[u.vetProfile.status] ?? ""}`}
                        >
                          {vetStatusLabel[u.vetProfile.status] ?? u.vetProfile.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Incomplet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.vetProfile?.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                          <BadgeCheck size={13} /> Vérifié
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}