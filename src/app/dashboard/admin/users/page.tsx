import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Utilisateurs",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [clients, vets, admins] = await Promise.all([
    db.user.findMany({
      where: { role: "CLIENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        image: true,
        _count: { select: { clientAppointments: true, pets: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { role: "VET" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        image: true,
        vetProfile: {
          select: {
            status: true,
            clinicName: true,
            city: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Utilisateurs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Vue d'ensemble de tous les utilisateurs de la plateforme.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Clients",
            value: clients.length,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Vétérinaires",
            value: vets.length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Administrateurs",
            value: admins,
            color: "text-slate-600",
            bg: "bg-slate-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-slate-200 rounded-xl p-4 text-center`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={15} className="text-slate-500" />
                Tous les utilisateurs
              </CardTitle>
              <CardDescription className="mt-0.5">
                Clients et vétérinaires inscrits sur Vetalist.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {clients.length + vets.length} total
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <AdminUsersTable clients={clients as any} vets={vets as any} />
      </Card>
    </div>
  );
}
