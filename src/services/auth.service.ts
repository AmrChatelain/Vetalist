import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schema for registration validation
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional for OAuth / future-proofing
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["CLIENT", "VET"]),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterInput) {
  const validatedData = registerSchema.parse(data);
  const { email, password, firstName, lastName, role, phone } = validatedData;

  // Check if a user with this email already exists (e.g. signed up via Google)
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // ✅ If they signed up via Google (no passwordHash), allow them to add a password
    if (!existingUser.passwordHash && password) {
      const passwordHash = await bcrypt.hash(password, 12);
      return await prisma.user.update({
        where: { email },
        data: { passwordHash },
      });
    }
    throw new Error("An account with this email already exists.");
  }

  // Hash the password only if provided (email/password signup)
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  return await prisma.$transaction(async (tx) => {
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