"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

async function getVetProfile() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.vetProfile.findUnique({ where: { userId: session.user.id } })
}

// ─── Appointments ────────────────────────────────────────────────────────────

export async function confirmAppointment(appointmentId: string) {
  try {
    const vet = await getVetProfile()
    if (!vet) return { success: false, error: "Unauthorized" }

    await prisma.appointment.update({
      where: { id: appointmentId, vetId: vet.id },
      data: { status: "CONFIRMED" },
    })

    revalidatePath("/dashboard/vet")
    revalidatePath("/dashboard/vet/appointments")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function cancelAppointment(appointmentId: string, reason: string) {
  try {
    const vet = await getVetProfile()
    if (!vet) return { success: false, error: "Unauthorized" }

    await prisma.appointment.update({
      where: { id: appointmentId, vetId: vet.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: "VET",
      },
    })

    revalidatePath("/dashboard/vet")
    revalidatePath("/dashboard/vet/appointments")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Toggles ─────────────────────────────────────────────────────────────────

export async function toggleAcceptingPatients(value: boolean) {
  try {
    const vet = await getVetProfile()
    if (!vet) return { success: false, error: "Unauthorized" }

    await prisma.vetProfile.update({
      where: { id: vet.id },
      data: { isActive: value },
    })

    revalidatePath("/dashboard/vet")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function toggleAcceptingEmergencies(value: boolean) {
  try {
    const vet = await getVetProfile()
    if (!vet) return { success: false, error: "Unauthorized" }

    await prisma.vetProfile.update({
      where: { id: vet.id },
      data: { acceptsEmergencies: value },
    })

    revalidatePath("/dashboard/vet")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Working Hours ────────────────────────────────────────────────────────────

export type WorkingHourInput = {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // "09:00"
  endTime: string   // "18:00"
}

export async function saveWorkingHours(hours: WorkingHourInput[]) {
  try {
    const vet = await getVetProfile()
    if (!vet) return { success: false, error: "Unauthorized" }

    // Replace all working hours in one transaction
    await prisma.$transaction([
      prisma.workingHour.deleteMany({ where: { vetProfileId: vet.id } }),
      prisma.workingHour.createMany({
        data: hours.map((h) => ({ ...h, vetProfileId: vet.id })),
      }),
    ])

    revalidatePath("/dashboard/vet")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getVetDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null

  const vet = await prisma.vetProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      workingHours: true,
      appointments: {
        include: {
          client: { select: { firstName: true, lastName: true } },
          pet:    { select: { name: true, species: true } },
        },
        orderBy: { startTime: "asc" },
      },
    },
  })

  if (!vet) return null

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd   = new Date(todayStart.getTime() + 86400000)
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000)

  const todayAppointments = vet.appointments.filter(
    (a) => a.startTime >= todayStart && a.startTime < todayEnd
  )
  const upcomingWeek = vet.appointments.filter(
    (a) => a.startTime >= now && a.startTime < weekEnd && a.status !== "CANCELLED"
  )
  const pending = vet.appointments.filter((a) => a.status === "PENDING")
  const upcoming = vet.appointments.filter(
    (a) => a.startTime >= now && a.status !== "CANCELLED" && a.status !== "DONE"
  )
  const past = vet.appointments.filter(
    (a) => a.startTime < now || a.status === "DONE" || a.status === "CANCELLED"
  )

  return {
    vet,
    stats: {
      todayCount:    todayAppointments.length,
      pendingCount:  pending.length,
      weekCount:     upcomingWeek.length,
      isActive:      vet.isActive,
      acceptsEmergencies: (vet as any).acceptsEmergencies ?? true,
    },
    upcomingAppointments: upcoming,
    pastAppointments:     past,
    workingHours:         vet.workingHours,
  }
}