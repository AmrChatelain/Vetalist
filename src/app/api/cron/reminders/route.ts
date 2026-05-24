import { NextResponse } from "next/server"
import db from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { reminder24hEmail, reminder1hEmail } from "@/emails/templates"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now       = new Date()
  const in24h     = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in1h      = new Date(now.getTime() + 60 * 60 * 1000)
  const window30m = 30 * 60 * 1000

  let sent24h = 0
  let sent1h  = 0
  let errors  = 0

  // ── Helper: build full address string ──────────────────────────────────────
  function buildAddress(vet: {
    street: string
    addressComplement?: string | null
    zipCode: string
    city: string
  }): string {
    const parts = [vet.street]
    if (vet.addressComplement) parts.push(vet.addressComplement)
    parts.push(`${vet.zipCode} ${vet.city}`)
    return parts.join(", ")
  }

  try {
    // ── 24h reminders ─────────────────────────────────────────────────────────
    const upcoming24h = await db.appointment.findMany({
      where: {
        status:            "CONFIRMED",
        reminder24hSentAt: null,
        startTime: {
          gte: new Date(in24h.getTime() - window30m),
          lte: new Date(in24h.getTime() + window30m),
        },
      },
      include: {
        client: { select: { email: true, firstName: true } },
        pet:    { select: { name: true } },
        vet: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    for (const apt of upcoming24h) {
      try {
        const { subject, html } = reminder24hEmail({
          clientFirstName: apt.client.firstName,
          vetName:         `${apt.vet.user.firstName} ${apt.vet.user.lastName}`,
          clinicName:      apt.vet.clinicName ?? "Vetalist Clinic",
          address:         buildAddress(apt.vet),
          date: new Date(apt.startTime).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          }),
          time: new Date(apt.startTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit", minute: "2-digit",
          }),
          petName: apt.pet?.name ?? null,
          reason:  apt.reason,
        })

        await sendEmail({ to: apt.client.email, subject, html })
        await db.appointment.update({ where: { id: apt.id }, data: { reminder24hSentAt: now } })
        await db.emailLog.create({
          data: { appointmentId: apt.id, recipientEmail: apt.client.email, emailType: "REMINDER_24H" },
        })

        sent24h++
      } catch (e) {
        console.error(`24h reminder failed for apt ${apt.id}:`, e)
        errors++
      }
    }

    // ── 1h reminders ──────────────────────────────────────────────────────────
    const upcoming1h = await db.appointment.findMany({
      where: {
        status:           "CONFIRMED",
        reminder1hSentAt: null,
        startTime: {
          gte: new Date(in1h.getTime() - window30m),
          lte: new Date(in1h.getTime() + window30m),
        },
      },
      include: {
        client: { select: { email: true, firstName: true } },
        pet:    { select: { name: true } },
        vet: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    for (const apt of upcoming1h) {
      try {
        const { subject, html } = reminder1hEmail({
          clientFirstName: apt.client.firstName,
          vetName:         `${apt.vet.user.firstName} ${apt.vet.user.lastName}`,
          clinicName:      apt.vet.clinicName ?? "Vetalist Clinic",
          address:         buildAddress(apt.vet),
          date: new Date(apt.startTime).toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          }),
          time: new Date(apt.startTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit", minute: "2-digit",
          }),
          petName: apt.pet?.name ?? null,
          reason:  apt.reason,
        })

        await sendEmail({ to: apt.client.email, subject, html })
        await db.appointment.update({ where: { id: apt.id }, data: { reminder1hSentAt: now } })
        await db.emailLog.create({
          data: { appointmentId: apt.id, recipientEmail: apt.client.email, emailType: "REMINDER_1H" },
        })

        sent1h++
      } catch (e) {
        console.error(`1h reminder failed for apt ${apt.id}:`, e)
        errors++
      }
    }

    return NextResponse.json({ ok: true, sent24h, sent1h, errors, timestamp: now.toISOString() })
  } catch (e: any) {
    console.error("Reminder cron error:", e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}