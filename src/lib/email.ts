import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.RESEND_FROM || "Vetalist <noreply@vetalist.com>"

export type EmailPayload = {
  to:      string
  subject: string
  html:    string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email send error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (e: any) {
    console.error("Email exception:", e)
    return { success: false, error: e.message }
  }
}