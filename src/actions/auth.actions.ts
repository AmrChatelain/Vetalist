"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function forgotPasswordAction(email: string) {
  const validated = ForgotPasswordSchema.safeParse({ email });

  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) return { error: "Something went wrong. Please try again." };

  return { message: "If this email exists, you'll receive a reset link shortly." };
}