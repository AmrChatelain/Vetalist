import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { z } from "zod"

const bookingSchema = z.object({
  vetId:       z.string(),
  petId:       z.string().nullable().optional(),
  startTime:   z.string().datetime(),
  reason:      z.string().min(5, "Motif trop court").max(500),
  notes:       z.string().max(500).optional(),
  isEmergency: z.boolean().default(false),
  newPet: z.object({
    name:      z.string().min(1),
    species:   z.string().min(1),
    breed:     z.string().optional(),
    birthDate: z.string().optional().nullable(),
    gender:    z.enum(["MALE", "FEMALE"]).optional().nullable(),
  }).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Réservé aux clients" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { vetId, petId, startTime, reason, notes, isEmergency, newPet } = parsed.data

  // Fetch vet with all fields needed for email template
  const vet = await db.vetProfile.findUnique({
    where:  { id: vetId, status: "ACTIVE", isActive: true },
    select: {
      id:              true,
      slotDurationMin: true,
      clinicName:      true,
      street:          true,
      zipCode:         true,
      city:            true,
      user:            { select: { firstName: true, lastName: true, email: true } },
    },
  })
  if (!vet) {
    return NextResponse.json({ error: "Vétérinaire introuvable" }, { status: 404 })
  }

  const start = new Date(startTime)
  const end   = new Date(start.getTime() + vet.slotDurationMin * 60_000)

  // Race condition guard — double-check slot is still free at write time
  const conflict = await db.appointment.findFirst({
    where: {
      vetId,
      status:    { in: ["PENDING", "CONFIRMED"] },
      startTime: { lt: end },
      endTime:   { gt: start },
    },
  })
  if (conflict) {
    return NextResponse.json(
      { error: "Ce créneau vient d'être pris. Veuillez en choisir un autre." },
      { status: 409 }
    )
  }

  // Fetch client
  const client = await db.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, email: true, firstName: true, lastName: true },
  })
  if (!client) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  // Resolve pet: use existing or create new inline
  let resolvedPetId: string | null = petId ?? null
  let snapshot: {
    snapshotPetName?:      string
    snapshotPetSpecies?:   string
    snapshotPetBreed?:     string | null
    snapshotPetBirthDate?: Date | null
    snapshotPetGender?:    "MALE" | "FEMALE" | null
  } = {}

  if (newPet && !petId) {
    const created = await db.pet.create({
      data: {
        clientId:  client.id,
        name:      newPet.name,
        species:   newPet.species,
        breed:     newPet.breed     ?? null,
        birthDate: newPet.birthDate ? new Date(newPet.birthDate) : null,
        gender:    newPet.gender    ?? null,
      },
    })
    resolvedPetId = created.id
    snapshot = {
      snapshotPetName:      created.name,
      snapshotPetSpecies:   created.species,
      snapshotPetBreed:     created.breed,
      snapshotPetBirthDate: created.birthDate,
      snapshotPetGender:    created.gender,
    }
  } else if (resolvedPetId) {
    const pet = await db.pet.findUnique({
      where: { id: resolvedPetId, clientId: client.id },
    })
    if (pet) {
      snapshot = {
        snapshotPetName:      pet.name,
        snapshotPetSpecies:   pet.species,
        snapshotPetBreed:     pet.breed,
        snapshotPetBirthDate: pet.birthDate,
        snapshotPetGender:    pet.gender,
      }
    }
  }

  // Create appointment — status starts as PENDING
  // ✉️  No email sent here. The "confirmationEmail" template says "Rendez-vous confirmé !"
  //     and fires from the vet's confirmAppointment action when they click Confirm.
  const appointment = await db.appointment.create({
    data: {
      vetId,
      clientId:    client.id,
      petId:       resolvedPetId,
      startTime:   start,
      endTime:     end,
      reason,
      notes:       notes ?? null,
      isEmergency,
      status:      "PENDING",
      ...snapshot,
    },
  })

  return NextResponse.json({ appointmentId: appointment.id }, { status: 201 })
}

export async function GET() {
  return NextResponse.json({ message: "Appointments API" })
}