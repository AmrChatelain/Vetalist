// All email templates in one file — clean, no extra dependencies

function base(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vetalist</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;text-align:center;line-height:36px;font-size:18px;">🐾</div>
                      <span style="font-size:1.3rem;font-weight:700;color:white;letter-spacing:-0.02em;">Vetalist</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f1f5f9;background:#f8fafc;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                Vetalist · Book trusted vets in seconds<br/>
                <a href="mailto:support@vetalist.com" style="color:#3b82f6;text-decoration:none;">support@vetalist.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function appointmentBlock(data: AppointmentEmailData): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0;">
      <tr>
        <td>
          <table width="100%" cellpadding="4" cellspacing="0">
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;width:100px;">Date</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.date}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Time</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.time}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Veterinarian</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">Dr. ${data.vetName}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Clinic</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.clinicName}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Address</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.address}</td>
            </tr>
            ${data.petName ? `
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Pet</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.petName}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Reason</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.reason}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

export type AppointmentEmailData = {
  clientFirstName: string
  vetName:         string
  clinicName:      string
  address:         string
  date:            string
  time:            string
  petName?:        string | null
  reason:          string
}

// ─── 1. Appointment Confirmed (sent when vet clicks Confirm) ──────────────────
export function confirmationEmail(data: AppointmentEmailData): { subject: string; html: string } {
  return {
    subject: `✅ Appointment confirmed — ${data.date} at ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">✅</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Appointment confirmed!</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Hi ${data.clientFirstName}, your appointment has been confirmed by the veterinarian.
        </p>
      </div>

      ${appointmentBlock(data)}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#15803d;font-weight:500;">
          📍 <strong>What to bring:</strong> Your pet's health record if available, and arrive 5 minutes early.
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        Need to cancel or reschedule? Please contact the clinic directly or reach us at
        <a href="mailto:support@vetalist.com" style="color:#3b82f6;">support@vetalist.com</a>.
      </p>
    `),
  }
}

// ─── 2. Appointment Cancelled by Vet (with optional reason) ──────────────────
export function cancellationEmail(
  data: AppointmentEmailData,
  cancelledBy: "VET" | "CLIENT",
  reason?: string | null
): { subject: string; html: string } {
  const byVet = cancelledBy === "VET"
  return {
    subject: `❌ Appointment cancelled — ${data.date} at ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">❌</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Appointment cancelled</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Hi ${data.clientFirstName}, your appointment has been cancelled
          ${byVet ? "by the veterinarian" : ""}.
        </p>
      </div>

      ${appointmentBlock(data)}

      ${reason ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.06em;">
          Reason from the veterinarian
        </p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">${reason}</p>
      </div>` : ""}

      <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
        We're sorry for the inconvenience. You can
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/search" style="color:#3b82f6;font-weight:500;">find another veterinarian</a>
        on Vetalist, or contact us at
        <a href="mailto:support@vetalist.com" style="color:#3b82f6;">support@vetalist.com</a>.
      </p>
    `),
  }
}

// ─── 3. Reminder 24h before ───────────────────────────────────────────────────
export function reminder24hEmail(data: AppointmentEmailData): { subject: string; html: string } {
  return {
    subject: `⏰ Reminder: Appointment tomorrow at ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fffbeb;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">⏰</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">See you tomorrow!</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Hi ${data.clientFirstName}, this is a reminder for your appointment tomorrow.
        </p>
      </div>

      ${appointmentBlock(data)}

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#92400e;font-weight:500;">
          🐾 <strong>Remember to bring</strong> your pet's vaccination records and arrive a few minutes early.
        </p>
      </div>
    `),
  }
}

// ─── 4. Reminder 1h before ────────────────────────────────────────────────────
export function reminder1hEmail(data: AppointmentEmailData): { subject: string; html: string } {
  return {
    subject: `🔔 Your appointment is in 1 hour — ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">🔔</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">1 hour to go!</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Hi ${data.clientFirstName}, your appointment is coming up very soon.
        </p>
      </div>

      ${appointmentBlock(data)}

      <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
        If you can't make it, please contact the clinic as soon as possible.
      </p>
    `),
  }
}

// ─── 5. Vet Approval notification ─────────────────────────────────────────────
export function vetApprovedEmail(vetFirstName: string): { subject: string; html: string } {
  return {
    subject: "🎉 Your Vetalist profile is approved!",
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">🎉</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">You're live on Vetalist!</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Congratulations Dr. ${vetFirstName}, your profile has been reviewed and approved.
        </p>
      </div>

      <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#1d4ed8;font-weight:600;">What happens now:</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#1e40af;line-height:1.8;">
          <li>Clients can find and book you on Vetalist</li>
          <li>You'll receive an email for each new booking</li>
          <li>Log in to confirm or manage appointments</li>
        </ul>
      </div>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vet"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Go to my dashboard →
        </a>
      </div>
    `),
  }
}

// ─── 6. Vet Rejection notification ────────────────────────────────────────────
export function vetRejectedEmail(vetFirstName: string, reason: string): { subject: string; html: string } {
  return {
    subject: "Update on your Vetalist application",
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">📋</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Application update</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Hi Dr. ${vetFirstName}, we've reviewed your application and need to share some feedback.
        </p>
      </div>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.06em;">
          Reason
        </p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">${reason}</p>
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">
        You can update your information and resubmit your application at any time.
      </p>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pending-approval"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Review & resubmit →
        </a>
      </div>
    `),
  }
}