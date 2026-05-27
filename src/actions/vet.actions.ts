"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import {
  confirmationEmail,
  cancellationEmail,
  vetApprovedEmail,
  vetRejectedEmail,
  type AppointmentEmailData,
} from "@/emails/templates";

// ─── Sanitize input to prevent XSS in email templates ────────────────────────
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

async function getVetProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.vetProfile.findUnique({ where: { userId: session.user.id } });
}

// ─── Build email data from appointment ───────────────────────────────────────

async function buildAppointmentEmailData(
  appointmentId: string,
): Promise<AppointmentEmailData | null> {
  const apt = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: { select: { firstName: true, lastName: true, email: true } },
      pet: { select: { name: true } },
      vet: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!apt) return null;

  return {
    clientFirstName: apt.client.firstName,
    vetName: `${apt.vet.user.firstName} ${apt.vet.user.lastName}`,
    clinicName: apt.vet.clinicName ?? "Vetalist Clinic",
    address: [apt.vet.street, apt.vet.addressComplement, `${apt.vet.zipCode} ${apt.vet.city}`].filter(Boolean).join(", "),
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
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function confirmAppointment(appointmentId: string) {
  try {
    const vet = await getVetProfile();
    if (!vet) return { success: false, error: "Unauthorized" };

    const apt = await db.appointment.update({
      where: { id: appointmentId, vetId: vet.id },
      data: { status: "CONFIRMED" },
      include: {
        client: { select: { email: true, firstName: true } },
      },
    });

    // Log the email
    await db.emailLog.create({
      data: {
        appointmentId,
        recipientEmail: apt.client.email,
        emailType: "CONFIRMATION",
      },
    });

    // Send confirmation email to client
    const emailData = await buildAppointmentEmailData(appointmentId);
    if (emailData) {
      const { subject, html } = confirmationEmail(emailData);
      await sendEmail({ to: apt.client.email, subject, html });
    }

    revalidatePath("/dashboard/vet");
    revalidatePath("/dashboard/vet/appointments");
    return { success: true };
  } catch (e: any) {
    console.error("confirmAppointment error:", e);
    return { success: false, error: e.message };
  }
}

export async function cancelAppointment(appointmentId: string, reason: string) {
  try {
    const vet = await getVetProfile();
    if (!vet) return { success: false, error: "Unauthorized" };

    const apt = await db.appointment.update({
      where: { id: appointmentId, vetId: vet.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: "VET",
      },
      include: {
        client: { select: { email: true, firstName: true } },
      },
    });

    // Log the email
    await db.emailLog.create({
      data: {
        appointmentId,
        recipientEmail: apt.client.email,
        emailType: "CANCELLATION",
      },
    });

    // Send cancellation email with vet's reason
    const emailData = await buildAppointmentEmailData(appointmentId);
    if (emailData) {
      const { subject, html } = cancellationEmail(emailData, "VET", reason);
      await sendEmail({ to: apt.client.email, subject, html });
    }

    revalidatePath("/dashboard/vet");
    revalidatePath("/dashboard/vet/appointments");
    return { success: true };
  } catch (e: any) {
    console.error("cancelAppointment error:", e);
    return { success: false, error: e.message };
  }
}

// ─── Toggles ──────────────────────────────────────────────────────────────────

export async function toggleAcceptingPatients(value: boolean) {
  try {
    const vet = await getVetProfile();
    if (!vet) return { success: false, error: "Unauthorized" };
    await db.vetProfile.update({
      where: { id: vet.id },
      data: { isActive: value },
    });
    revalidatePath("/dashboard/vet");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleAcceptingEmergencies(value: boolean) {
  try {
    const vet = await getVetProfile();
    if (!vet) return { success: false, error: "Unauthorized" };
    await db.vetProfile.update({
      where: { id: vet.id },
      data: { acceptsEmergencies: value },
    });
    revalidatePath("/dashboard/vet");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Working Hours ─────────────────────────────────────────────────────────────

export type WorkingHourInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export async function saveWorkingHours(hours: WorkingHourInput[]) {
  try {
    const vet = await getVetProfile();
    if (!vet) return { success: false, error: "Unauthorized" };

    await db.$transaction([
      db.workingHour.deleteMany({ where: { vetProfileId: vet.id } }),
      db.workingHour.createMany({
        data: hours.map((h) => ({ ...h, vetProfileId: vet.id })),
      }),
    ]);

    revalidatePath("/dashboard/vet/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getVetDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const vet = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, image: true },
      },
      workingHours: true,
      appointments: {
        where: {
          startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        include: {
          client: { select: { firstName: true, lastName: true } },
          pet: { select: { name: true, species: true } },
        },
        orderBy: { startTime: "asc" },
        take: 500,
      },
    },
  });

  if (!vet) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 86_400_000);

  const todayAppointments = vet.appointments.filter(
    (a) => a.startTime >= todayStart && a.startTime < todayEnd,
  );
  const upcomingWeek = vet.appointments.filter(
    (a) =>
      a.startTime >= now && a.startTime < weekEnd && a.status !== "CANCELLED",
  );
  const pending = vet.appointments.filter((a) => a.status === "PENDING");
  const upcoming = vet.appointments.filter(
    (a) =>
      a.startTime >= now && a.status !== "CANCELLED" && a.status !== "DONE",
  );
  const past = vet.appointments.filter(
    (a) => a.startTime < now || a.status === "DONE" || a.status === "CANCELLED",
  );

  return {
    vet,
    stats: {
      todayCount: todayAppointments.length,
      pendingCount: pending.length,
      weekCount: upcomingWeek.length,
      isActive: vet.isActive,
      acceptsEmergencies: vet.acceptsEmergencies,
    },
    upcomingAppointments: upcoming,
    pastAppointments: past,
    workingHours: vet.workingHours,
  };
}

// ─── Admin: get pending vets ───────────────────────────────────────────────────

export async function getPendingVets() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return [];

  return db.vetProfile.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { user: { firstName: "asc" } },
  });
}

// ─── Admin: approve vet ───────────────────────────────────────────────────────

export async function approveVet(vetProfileId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const vet = await db.vetProfile.update({
      where: { id: vetProfileId },
      data: { status: "ACTIVE", isVerified: false },
      include: {
        user: { select: { email: true, firstName: true } },
      },
    });

    const { subject, html } = vetApprovedEmail(vet.user.firstName);
    await sendEmail({ to: vet.user.email, subject, html });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Admin: reject vet ────────────────────────────────────────────────────────

export async function rejectVet(vetProfileId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const clean = sanitizeText(reason);
    const vet = await db.vetProfile.update({
      where: { id: vetProfileId },
      data: { status: "REJECTED", rejectionReason: clean },
      include: {
        user: { select: { email: true, firstName: true } },
      },
    });

    const { subject, html } = vetRejectedEmail(vet.user.firstName, clean);
    await sendEmail({ to: vet.user.email, subject, html });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}