"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { forgotPasswordEmail } from "@/emails/templates"

// ─── Request Reset ─────────────────────────────────────────────────────────────
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return the same response — never reveal if an email exists or not
  const safeResponse = {
    success: true,
    message: "Si un compte existe avec cet e-mail, vous recevrez un lien de réinitialisation.",
  }

  if (!user) return safeResponse

  // OAuth users have no password — no point sending a reset
  if (!user.passwordHash) return safeResponse

  // Delete any existing token for this user (only one active at a time)
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  const { subject, html } = forgotPasswordEmail(user.firstName, resetUrl)

  await resend.emails.send({
    from: "Vetalist <no-reply@vetalist.com>",
    to: user.email,
    subject,
    html,
  })

  // Log it — appointmentId is null since this isn't appointment-related
  await prisma.emailLog.create({
    data: {
      recipientEmail: user.email,
      emailType: "FORGOT_PASSWORD",
      appointmentId: null,
    },
  })

  return safeResponse
}

// ─── Validate Token (used by the reset page on load) ──────────────────────────
export async function validateResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return { valid: false, error: "Lien invalide ou déjà utilisé." }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return { valid: false, error: "Ce lien a expiré. Veuillez faire une nouvelle demande." }
  }

  return { valid: true, firstName: record.user.firstName }
}

// ─── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return { success: false, error: "Lien invalide ou déjà utilisé." }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return { success: false, error: "Ce lien a expiré. Veuillez faire une nouvelle demande." }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  })

  // Delete token so it can't be reused
  await prisma.passwordResetToken.delete({ where: { token } })

  return { success: true }
}