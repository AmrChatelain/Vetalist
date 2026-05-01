import { auth } from "@/lib/auth";
import { VetService } from "@/services/vet.service";
import { z } from "zod";

/**
 * Schema for the multi-step onboarding process.
 * This ensures all data is validated before hitting the database.
 */
export const onboardingSchema = z.object({
  // Step 1: Professional Details
  bio: z.string().min(20, "Bio must be at least 20 characters").optional(),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  languagesSpoken: z.array(z.string()).min(1, "Select at least one language"),

  // Step 2: Clinic Details
  clinicName: z.string().min(2, "Clinic name is required"),
  clinicPhone: z.string().min(5, "Valid phone number is required"),
  city: z.string().min(2, "City is required"),
  street: z.string().min(2, "Street address is required"),
  zipCode: z.string().min(3, "Zip code is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),

  // Step 3: Practice Details
  careTypes: z.array(z.string()).min(1, "Select at least one care type"),
  paymentMethods: z.array(z.string()).min(1, "Select at least one payment method"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * Server Action to update the Vet Profile during onboarding.
 */
export async function updateVetOnboarding(data: OnboardingInput) {
  const session = await auth();

  if (!session || session.user.role !== "VET") {
    throw new Error("Unauthorized: Only vets can complete onboarding.");
  }

  try {
    // We use the user ID from the session to find the correct profile
    await VetService.updateOnboardingProfile(session.user.id, data);
    return { success: true };
  } catch (error) {
    console.error("Onboarding Action Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred." 
    };
  }
}
