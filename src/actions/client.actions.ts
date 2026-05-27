"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { cancellationEmail } from "@/emails/templates";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getClient() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLIENT") return null;
  return {
    id: session.user.id,
    email: session.user.email as string,
    firstName: session.user.firstName as string,
    lastName: session.user.lastName as string,
  };
}

// ─── Dashboard data ───────────────────────────────────────────────────────────

export async function getClientDashboardData() {
  const client = await getClient();
  if (!client) return null;

  const now = new Date();

  const [appointments, pets] = await Promise.all([
    db.appointment.findMany({
      where: {
        clientId: client.id,
        startTime: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      include: {
        vet: {
          select: {
            id: true,
            clinicName: true,
            city: true,
            street: true,
            zipCode: true,
            photoUrl: true,
            slotDurationMin: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        pet: { select: { name: true, species: true } },
      },
      orderBy: { startTime: "asc" },
      take: 200,
    }),
    db.pet.findMany({
      where: { clientId: client.id, isArchived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  const upcoming = appointments.filter(
    (a) =>
      a.startTime >= now && a.status !== "CANCELLED" && a.status !== "DONE",
  );
  const past = appointments
    .filter(
      (a) =>
        a.startTime < now || a.status === "DONE" || a.status === "CANCELLED",
    )
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  return {
    stats: {
      upcomingCount: upcoming.length,
      petsCount: pets.length,
      nextAppointment: upcoming[0] ?? null,
    },
    upcomingAppointments: upcoming,
    pastAppointments: past,
    pets,
  };
}

// ─── Cancel appointment (by client) ──────────────────────────────────────────

export async function cancelAppointmentByClient(
  appointmentId: string,
  reason?: string,
) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    const apt = await db.appointment.findUnique({
      where: { id: appointmentId, clientId: client.id },
      include: {
        vet: {
          select: {
            clinicName: true,
            street: true,
            zipCode: true,
            city: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        pet: { select: { name: true } },
      },
    });

    if (!apt) return { success: false, error: "Rendez-vous introuvable" };
    if (apt.status !== "PENDING" && apt.status !== "CONFIRMED") {
      return {
        success: false,
        error: "Ce rendez-vous ne peut plus être annulé",
      };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason ?? null,
        cancelledAt: new Date(),
        cancelledBy: "CLIENT",
      },
    });

    // Confirmation email to client
    try {
      const emailData = {
        clientFirstName: client.firstName,
        vetName: `${apt.vet.user.firstName} ${apt.vet.user.lastName}`,
        clinicName: apt.vet.clinicName ?? "Vetalist",
        address: `${apt.vet.street}, ${apt.vet.zipCode} ${apt.vet.city}`,
        date: new Date(apt.startTime).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: new Date(apt.startTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        petName: apt.pet?.name ?? null,
        reason: apt.reason,
      };
      const { subject, html } = cancellationEmail(emailData, "CLIENT", reason);
      await sendEmail({ to: client.email, subject, html });
      await db.emailLog.create({
        data: {
          appointmentId,
          recipientEmail: client.email,
          emailType: "CANCELLATION",
        },
      });
    } catch (emailErr) {
      console.error("Email error (non-blocking):", emailErr);
    }

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/appointments");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Pets ─────────────────────────────────────────────────────────────────────

const petSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50),
  species: z.string().min(1, "L'espèce est requise"),
  breed: z.string().max(50).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

type PetInput = z.infer<typeof petSchema>;

export async function addPet(data: PetInput) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    const parsed = petSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Données invalides" };

    const { name, species, breed, birthDate, gender, notes } = parsed.data;
    await db.pet.create({
      data: {
        clientId: client.id,
        name,
        species,
        breed: breed ?? null,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: (gender as "MALE" | "FEMALE") ?? null,
        notes: notes ?? null,
      },
    });

    revalidatePath("/dashboard/client/pets");
    revalidatePath("/dashboard/client");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updatePet(petId: string, data: PetInput) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    const parsed = petSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Données invalides" };

    const { name, species, breed, birthDate, gender, notes } = parsed.data;
    await db.pet.update({
      where: { id: petId, clientId: client.id },
      data: {
        name,
        species,
        breed: breed ?? null,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: (gender as "MALE" | "FEMALE") ?? null,
        notes: notes ?? null,
      },
    });

    revalidatePath("/dashboard/client/pets");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function archivePet(petId: string) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    await db.pet.update({
      where: { id: petId, clientId: client.id },
      data: { isArchived: true, archivedAt: new Date() },
    });

    revalidatePath("/dashboard/client/pets");
    revalidatePath("/dashboard/client");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Profile settings ─────────────────────────────────────────────────────────

export async function updateClientProfile(data: {
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    const schema = z.object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      phone: z
        .string()
        .max(20)
        .optional()
        .nullable()
        .refine((val) => {
          if (!val) return true;
          const cleaned = val.replace(/\s/g, "");
          return (
            /^(\+33|0)[1-9]\d{8}$/.test(cleaned) ||
            /^\+[1-9]\d{7,14}$/.test(cleaned)
          );
        }, "Numéro de téléphone invalide"),
    });

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const phoneError = parsed.error.issues.find((e) => e.path[0] === "phone");
      return {
        success: false,
        error: phoneError ? phoneError.message : "Données invalides",
      };
    }

    await db.user.update({
      where: { id: client.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone ?? null,
      },
    });

    revalidatePath("/dashboard/client/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const client = await getClient();
    if (!client) return { success: false, error: "Non authentifié" };

    if (!data.newPassword || data.newPassword.length < 8)
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins 8 caractères.",
      };
    if (data.newPassword.length > 72)
      return {
        success: false,
        error: "Le mot de passe ne peut pas dépasser 72 caractères.",
      };
    if (!/[a-zA-Z]/.test(data.newPassword))
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une lettre.",
      };
    if (!/[0-9]/.test(data.newPassword))
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins un chiffre.",
      };

    const user = await db.user.findUnique({
      where: { id: client.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash)
      return {
        success: false,
        error: "Compte Google — aucun mot de passe à modifier",
      };

    const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!match)
      return { success: false, error: "Mot de passe actuel incorrect" };

    const hash = await bcrypt.hash(data.newPassword, 12);
    await db.user.update({
      where: { id: client.id },
      data: { passwordHash: hash },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}