"use server"

import prisma from "@/lib/db";
import { z } from "zod";

// Schema for onboarding validation
export const onboardingSchema = z.object({
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(3, "Zip code is required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  specialties: z.array(z.string()).default([]),
  languagesSpoken: z.array(z.string()).default([]),
  photoUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeVetProfile(userId: string, data: OnboardingInput) {
  const validatedData = onboardingSchema.parse(data);

  return await prisma.$transaction(async (tx) => {
    // 1. Check if user exists and is a VET
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new Error("User not found");
    if (user.role !== "VET") throw new Error("Only veterinarians can complete this profile");

    // 2. Check if profile already exists to prevent duplicates
    const existingProfile = await tx.vetProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error("Profile already exists. Please contact support.");
    }

    // 3. Create the VetProfile with PENDING_APPROVAL status
    const profile = await tx.vetProfile.create({
      data: {
        userId,
        street: validatedData.street,
        city: validatedData.city,
        zipCode: validatedData.zipCode,
        bio: validatedData.bio,
        specialties: validatedData.specialties,
        languagesSpoken: validatedData.languagesSpoken,
        photoUrl: validatedData.photoUrl || null,
        status: "PENDING_APPROVAL",
      },
    });

    return profile;
  });
}
