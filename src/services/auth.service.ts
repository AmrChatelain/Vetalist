import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schema for registration validation
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional for OAuth/future-proofing
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["CLIENT", "VET"]),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterInput) {
  const validatedData = registerSchema.parse(data);
  const { email, password, firstName, lastName, role, phone } = validatedData;

  // Hash the password only if it's provided (for manual email/pass signup)
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  return await prisma.$transaction(async (tx) => {
    // 1. Create the User
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        phone,
      },
    });

    return user;
  });
}
