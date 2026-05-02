"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Confirms a pending appointment.
 * Ensures the user is a VET and owns the vet profile associated with the appointment.
 */
export async function confirmAppointment(appointmentId: string) {
  const session = await auth();

  if (!session || session.user.role !== "VET") {
    throw new Error("Unauthorized: Only veterinarians can manage appointments.");
  }

  try {
    // 1. Find the appointment and verify it belongs to this vet
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { vet: true },
    });

    if (!appointment) throw new Error("Appointment not found.");
    if (appointment.vetId !== session.user.id && session.user.role !== "ADMIN") {
       // Note: In a real scenario, we'd match against the VetProfile ID or ensure 
       // the session user ID maps correctly to the vet profile. 
       // Given our schema, appointment.vetId links to VetProfile.id.
       // We need to make sure the session user is linked to that VetProfile.
    }

    // Verification: Does this user own the VetProfile associated with this appointment?
    const vetProfile = await prisma.vetProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vetProfile || appointment.vetId !== vetProfile.id) {
      throw new Error("Unauthorized: You do not manage this appointment.");
    }

    // 2. Update status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED" },
    });

    revalidatePath("/vet/appointments");
    return { success: true };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to confirm appointment" };
  }
}

/**
 * Cancels an appointment.
 * Allows the vet to provide a reason for cancellation.
 */
export async function cancelAppointment(appointmentId: string, reason?: string) {
  const session = await auth();

  if (!session || session.user.role !== "VET") {
    throw new Error("Unauthorized.");
  }

  try {
    const vetProfile = await prisma.vetProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vetProfile) throw new Error("Vet profile not found.");

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.vetId !== vetProfile.id) {
      throw new Error("Unauthorized or appointment not found.");
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: "CANCELLED",
        cancellationReason: reason || "Cancelled by veterinarian",
        cancelledAt: new Date(),
        cancelledBy: "VET"
      },
    });

    revalidatePath("/vet/appointments");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to cancel appointment" };
  }
}
