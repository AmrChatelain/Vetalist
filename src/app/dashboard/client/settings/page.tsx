import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { SettingsClient } from "@/components/client/SettingsClient"
import { UserCircle } from "lucide-react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};


export default async function ClientSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await db.user.findUnique({
    where:  { id: session.user.id },
    select: { firstName: true, lastName: true, phone: true, email: true, passwordHash: true },
  })
  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e] flex items-center gap-3">
          <UserCircle size={28} className="text-violet-500" />
          Mon profil
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      <SettingsClient
        user={{
          firstName:   user.firstName,
          lastName:    user.lastName,
          phone:       user.phone,
          email:       user.email,
          hasPassword: !!user.passwordHash,
        }}
      />
    </div>
  )
}