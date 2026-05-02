"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const onboardingSchema = z.object({
  bio:             z.string().min(20, "Bio must be at least 20 characters"),
  specialties:     z.array(z.string().min(1)).min(1, "At least one specialty required"),
  languagesSpoken: z.array(z.string().min(1)).min(1, "At least one language required"),
  clinicName:      z.string().min(2,  "Clinic name is required"),
  clinicPhone:     z.string().min(6,  "Valid phone number required"),
  city:            z.string().min(2,  "City is required"),
  street:          z.string().min(5,  "Street address is required"),
  zipCode:         z.string().min(3,  "Zip code is required"),
  careTypes:       z.array(z.string().min(1)).min(1, "At least one care type required"),
  paymentMethods:  z.array(z.string().min(1)).min(1, "At least one payment method required"),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

export async function updateVetOnboarding(data: OnboardingInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const validated = onboardingSchema.parse(data)

    await prisma.vetProfile.upsert({
      where: { userId: session.user.id },
      update: { ...validated, status: "PENDING_APPROVAL" },
      create: { userId: session.user.id, ...validated, status: "PENDING_APPROVAL" },
    })

    revalidatePath("/dashboard/vet")
    revalidatePath("/onboarding")
    return { success: true }
  } catch (e: any) {
    console.error("Onboarding error:", e)
    return { success: false, error: e.message || "Failed to save profile" }
  }
}