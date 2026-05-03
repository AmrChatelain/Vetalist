"use server"

import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function toggleVetVerified(vetProfileId: string, value: boolean) {
  try {
    await requireAdmin()

    await db.vetProfile.update({
      where: { id: vetProfileId },
      data: { isVerified: value },
    })

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function getActiveVets() {
  await requireAdmin()

  return db.vetProfile.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { isVerified: "desc" }, // verified ones first
  })
}