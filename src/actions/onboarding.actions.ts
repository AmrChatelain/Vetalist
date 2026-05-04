"use server"

import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { z } from "zod"

export type { OnboardingInput }

// ─── First-time onboarding (sets status to PENDING_APPROVAL) ─────────────────
export async function updateVetOnboarding(data: OnboardingInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (session.user.role !== "VET") return { success: false, error: "Not a vet account" }

    const validated = onboardingSchema.parse(data)

    await db.vetProfile.upsert({
      where: { userId: session.user.id },
      update: { ...validated, status: "PENDING_APPROVAL" },
      create: { userId: session.user.id, ...validated, status: "PENDING_APPROVAL" },
    })

    revalidatePath("/onboarding")
    revalidatePath("/dashboard/vet")
    return { success: true }
  } catch (e: any) {
    console.error("Onboarding error:", e)
    return { success: false, error: e.message || "Failed to save profile" }
  }
}

// ─── Profile update for already-approved vets (NEVER touches status) ─────────
// This is used by the ProfileEditor on /dashboard/vet/profile
export async function updateVetProfile(data: OnboardingInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }
    if (session.user.role !== "VET") return { success: false, error: "Not a vet account" }

    const validated = onboardingSchema.parse(data)

    const existing = await db.vetProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    })

    if (!existing) return { success: false, error: "Profile not found. Please complete onboarding first." }

    // Explicitly exclude status — approved vets keep their status
    const { ...profileData } = validated

    await db.vetProfile.update({
      where: { userId: session.user.id },
      data: profileData,
    })

    revalidatePath("/dashboard/vet")
    revalidatePath("/dashboard/vet/profile")
    return { success: true }
  } catch (e: any) {
    console.error("Profile update error:", e)
    return { success: false, error: e.message || "Failed to update profile" }
  }
}

// ─── Slot duration ─────────────────────────────────────────────────────────────
const slotSchema = z.object({
  slotDurationMin: z.number().int().min(10).max(120),
})

export async function updateSlotDuration(slotDurationMin: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    slotSchema.parse({ slotDurationMin })

    await db.vetProfile.update({
      where: { userId: session.user.id },
      data: { slotDurationMin },
    })

    revalidatePath("/dashboard/vet/settings")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Availability blocks (time off) ───────────────────────────────────────────
const blockSchema = z.object({
  startDate: z.string().min(1, "Start date required"),
  endDate:   z.string().min(1, "End date required"),
  reason:    z.string().optional(),
})

export async function addAvailabilityBlock(data: {
  startDate: string
  endDate: string
  reason?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const validated = blockSchema.parse(data)

    const vet = await db.vetProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!vet) return { success: false, error: "Profile not found" }

    const start = new Date(validated.startDate)
    const end   = new Date(validated.endDate)

    if (end < start) return { success: false, error: "End date must be after start date" }

    await db.availabilityBlock.create({
      data: {
        vetProfileId: vet.id,
        startDate:    start,
        endDate:      end,
        reason:       validated.reason || null,
      },
    })

    revalidatePath("/dashboard/vet/settings")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteAvailabilityBlock(blockId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const vet = await db.vetProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!vet) return { success: false, error: "Profile not found" }

    await db.availabilityBlock.delete({
      where: { id: blockId, vetProfileId: vet.id },
    })

    revalidatePath("/dashboard/vet/settings")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Photo URL update ──────────────────────────────────────────────────────────
export async function updateVetPhoto(photoUrl: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    await db.vetProfile.update({
      where: { userId: session.user.id },
      data: { photoUrl },
    })

    revalidatePath("/dashboard/vet/profile")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}