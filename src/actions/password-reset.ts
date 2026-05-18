"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { forgotPasswordEmail } from "@/emails/templates"
import { passwordResetRatelimit } from "@/lib/ratelimit"
import { headers } from "next/headers"

// ─── Request Reset ─────────────────────────────────────────────────────────────
export async function requestPasswordReset(email: string) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headersList.get("x-real-ip")
    ?? "anonymous"

  const { success } = await passwordResetRatelimit.limit(ip)

  const safeResponse = {
    success: true,
    message: "Si un compte existe avec cet e-mail, vous recevrez un lien de réinitialisation.",
  }

  // Return same response whether rate limited or not — never reveal limit to attacker
  if (!success) return safeResponse

  const user = await db.user.findUnique({ where: { email } })

  if (!user)             return safeResponse
  if (!user.passwordHash) return safeResponse

  await db.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token     = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await db.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetUrl          = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  const { subject, html } = forgotPasswordEmail(user.firstName, resetUrl)

  await sendEmail({ to: user.email, subject, html })

  await db.emailLog.create({
    data: {
      recipientEmail: user.email,
      emailType:      "FORGOT_PASSWORD",
      appointmentId:  null,
    },
  })

  return safeResponse
}

// ─── Validate Token ────────────────────────────────────────────────────────────
export async function validateResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({
    where:   { token },
    include: { user: true },
  })

  if (!record) return { valid: false, error: "Lien invalide ou déjà utilisé." }
  if (record.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { token } })
    return { valid: false, error: "Ce lien a expiré. Veuillez faire une nouvelle demande." }
  }

  return { valid: true, firstName: record.user.firstName }
}

// ─── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const record = await db.passwordResetToken.findUnique({
    where:   { token },
    include: { user: true },
  })

  if (!record) return { success: false, error: "Lien invalide ou déjà utilisé." }
  if (record.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { token } })
    return { success: false, error: "Ce lien a expiré. Veuillez faire une nouvelle demande." }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await db.user.update({
    where: { id: record.userId },
    data:  { passwordHash },
  })

  await db.passwordResetToken.delete({ where: { token } })

  return { success: true }
}