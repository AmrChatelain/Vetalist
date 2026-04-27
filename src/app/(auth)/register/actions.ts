"use server"

import { registerUser, RegisterInput } from "@/services/auth.service";
import { z } from "zod";

// Schema for form-level validation to provide specific field errors
const FormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  role: z.enum(["CLIENT", "VET"]),
});

export type RegisterActionResult = 
  | { success: true }
  | { error: string }
  | { errors: Record<string, string[]> };

export async function registerAction(formData: FormData): Promise<RegisterActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  
  // 1. Validate input
  const validatedFields = FormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    // 2. Map to Service Input
    const data: RegisterInput = {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      firstName: validatedFields.data.firstName,
      lastName: validatedFields.data.lastName,
      role: validatedFields.data.role,
    };

    // 3. Call the service layer
    await registerUser(data);
    return { success: true };
  } catch (e: any) {
    // Handle specific error messages from the service (like "Address is required for Vet")
    return { error: e.message || "An unexpected error occurred during registration." };
  }
}
