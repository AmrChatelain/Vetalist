import { prisma } from "@/lib/db";

export async function fixUserRole(email: string, newRole: "CLIENT" | "VET" | "ADMIN") {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: `User with email ${email} not found.` };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole },
    });

    return { success: true, message: `Successfully updated ${email} to ${newRole}` };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Database error occurred." };
  }
}
