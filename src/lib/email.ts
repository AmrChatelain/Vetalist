import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailClient = resend;

export const emailTemplates = {
  bookingConfirmation: (data: any) => `<h1>Booking Confirmed</h1><p>Hello ${data.name}, your appointment is set.</p>`,
  reminder24h: (data: any) => `<h1>Reminder</h1><p>Your appointment is in 24 hours.</p>`,
  reminder1h: (data: any) => `<h1>Quick Reminder</h1><p>Your appointment is in 1 hour.</p>`,
  cancellation: (data: any) => `<h1>Cancellation</h1><p>Your appointment has been cancelled.</p>`,
  passwordReset: (data: { resetLink: string; email: string }) => `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for <b>${data.email}</b>.</p>
    <p>Click the button below to reset it. This link expires in <b>1 hour</b>.</p>
    <a href="${data.resetLink}" style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px;">
      Reset Password
    </a>
    <p style="margin-top:24px;color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
  `,
};