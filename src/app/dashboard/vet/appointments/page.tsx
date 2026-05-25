import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { AppointmentTable } from "@/components/vet/AppointmentTable";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes rendez-vous",
  robots: { index: false, follow: false },
};

async function getAppointments(vetProfileId: string) {
  const appointments = await db.appointment.findMany({
    where: {
      vetId: vetProfileId,
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      pet: {
        select: {
          name: true,
          species: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc", // This works if the enum order in Prisma matches our desired priority
      },
      {
        startTime: "asc",
      },
    ],
  });

  // Since Prisma enums might not sort exactly as we want (PENDING, CONFIRMED, CANCELLED, DONE),
  // we manually re-sort to ensure the UX requirement: PENDING -> CONFIRMED -> DONE/CANCELLED.
  const statusPriority: Record<string, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    CANCELLED: 3,
    DONE: 4,
  };

  return appointments.sort((a, b) => {
    const priorityA = statusPriority[a.status] || 99;
    const priorityB = statusPriority[b.status] || 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

export default async function VetAppointmentsPage() {
  const session = await auth();

  if (!session || session.user.role !== "VET") {
    redirect("/login");
  }

  // Find the vet profile associated with this user
  const vetProfile = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vetProfile) {
    // If for some reason a VET user has no profile, redirect to onboarding
    redirect("/onboarding");
  }

  const appointments = await getAppointments(vetProfile.id);

  return (
    <div className="container mx-auto py-10 px-4">
      <AppointmentTable initialAppointments={appointments} />
    </div>
  );
}
