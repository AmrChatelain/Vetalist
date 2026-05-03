"use server"

import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"

export type { OnboardingInput }

export async function updateVetOnboarding(data: OnboardingInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (session.user.role !== "VET") return { success: false, error: "Not a vet account" }

    const validated = onboardingSchema.parse(data)

    await db.vetProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...validated,
        status: "PENDING_APPROVAL",
      },
      create: {
        userId: session.user.id,
        ...validated,
        status: "PENDING_APPROVAL",
      },
    })

    revalidatePath("/dashboard/vet")
    revalidatePath("/onboarding")
    return { success: true }
  } catch (e: any) {
    console.error("Onboarding error:", e)
    return { success: false, error: e.message || "Failed to save profile" }
  }
}