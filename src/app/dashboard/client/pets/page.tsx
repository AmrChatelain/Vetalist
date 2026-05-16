import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { PetsClient } from "@/components/client/PetsClient"
import { PawPrint } from "lucide-react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes animaux",
  robots: { index: false, follow: false },
};


export default async function ClientPetsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const pets = await db.pet.findMany({
    where:   { clientId: session.user.id, isArchived: false },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1a2e] flex items-center gap-3">
          <PawPrint size={28} className="text-violet-500" />
          Mes animaux
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gérez le profil de vos animaux de compagnie.
        </p>
      </div>

      <PetsClient initialPets={pets} />
    </div>
  )
}