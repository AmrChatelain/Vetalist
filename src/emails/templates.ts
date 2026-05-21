// All email templates in one file — clean, no extra dependencies

function base(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
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
                Vetalist · Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes<br/>
                <a href="mailto:support@vetalist.com" style="color:#3b82f6;text-decoration:none;">support@vetalist.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Heure</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.time}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Vétérinaire</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">Dr. ${data.vetName}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Clinique</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.clinicName}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Adresse</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.address}</td>
            </tr>
            ${
              data.petName
                ? `
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Animal</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.petName}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Motif</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.reason}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export type AppointmentEmailData = {
  clientFirstName: string;
  vetName: string;
  clinicName: string;
  address: string;
  date: string;
  time: string;
  petName?: string | null;
  reason: string;
};

// ─── 1. Appointment Confirmed (sent when vet clicks Confirm) ──────────────────
export function confirmationEmail(data: AppointmentEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `✅ Rendez-vous confirmé — ${data.date} à ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">✅</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Rendez-vous confirmé !</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour ${data.clientFirstName}, votre rendez-vous a été confirmé par le vétérinaire.
        </p>
      </div>

      ${appointmentBlock(data)}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#15803d;font-weight:500;">
          📍 <strong>À apporter :</strong> Le carnet de santé de votre animal si disponible, et arrivez 5 minutes à l'avance.
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        Besoin d'annuler ou de reporter ? Contactez directement la clinique ou écrivez-nous à
        <a href="mailto:support@vetalist.com" style="color:#3b82f6;">support@vetalist.com</a>.
      </p>
    `),
  };
}

// ─── 2. Appointment Cancelled by Vet (with optional reason) ──────────────────
export function cancellationEmail(
  data: AppointmentEmailData,
  cancelledBy: "VET" | "CLIENT",
  reason?: string | null,
): { subject: string; html: string } {
  const byVet = cancelledBy === "VET";
  return {
    subject: `❌ Rendez-vous annulé — ${data.date} à ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">❌</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Rendez-vous annulé</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour ${data.clientFirstName}, votre rendez-vous a été annulé
          ${byVet ? "par le vétérinaire" : ""}.
        </p>
      </div>

      ${appointmentBlock(data)}

      ${
        reason
          ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.06em;">
          Motif communiqué par le vétérinaire
        </p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">${reason}</p>
      </div>`
          : ""
      }

      <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
        Nous vous présentons nos excuses pour ce désagrément. Vous pouvez
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/search" style="color:#3b82f6;font-weight:500;">trouver un autre vétérinaire</a>
        sur Vetalist, ou nous contacter à
        <a href="mailto:support@vetalist.com" style="color:#3b82f6;">support@vetalist.com</a>.
      </p>
    `),
  };
}

// ─── 3. Reminder 24h before ───────────────────────────────────────────────────
export function reminder24hEmail(data: AppointmentEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `⏰ Rappel : Rendez-vous demain à ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fffbeb;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">⏰</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">À demain !</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour ${data.clientFirstName}, voici un rappel pour votre rendez-vous de demain.
        </p>
      </div>

      ${appointmentBlock(data)}

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#92400e;font-weight:500;">
          🐾 <strong>N'oubliez pas d'apporter</strong> le carnet de vaccination de votre animal et d'arriver quelques minutes à l'avance.
        </p>
      </div>
    `),
  };
}

// ─── 4. Reminder 1h before ────────────────────────────────────────────────────
export function reminder1hEmail(data: AppointmentEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `🔔 Votre rendez-vous est dans 1 heure — ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">🔔</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Plus qu'une heure !</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour ${data.clientFirstName}, votre rendez-vous approche.
        </p>
      </div>

      ${appointmentBlock(data)}

      <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
        Si vous ne pouvez pas vous y rendre, veuillez contacter la clinique dès que possible.
      </p>
    `),
  };
}

// ─── 5. Vet Approval notification ─────────────────────────────────────────────
export function vetApprovedEmail(vetFirstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "🎉 Votre profil Vetalist est approuvé !",
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">🎉</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Vous êtes en ligne sur Vetalist !</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Félicitations Dr. ${vetFirstName}, votre profil a été examiné et approuvé.
        </p>
      </div>

      <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#1d4ed8;font-weight:600;">Que se passe-t-il maintenant :</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#1e40af;line-height:1.8;">
          <li>Les clients peuvent vous trouver et prendre rendez-vous sur Vetalist</li>
          <li>Vous recevrez un e-mail pour chaque nouvelle réservation</li>
          <li>Connectez-vous pour confirmer ou gérer vos rendez-vous</li>
        </ul>
      </div>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/vet"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Accéder à mon tableau de bord →
        </a>
      </div>
    `),
  };
}

// ─── 6. Vet Rejection notification ────────────────────────────────────────────
export function vetRejectedEmail(
  vetFirstName: string,
  reason: string,
): { subject: string; html: string } {
  return {
    subject: "Mise à jour concernant votre candidature Vetalist",
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">📋</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Mise à jour de votre candidature</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour Dr. ${vetFirstName}, nous avons examiné votre candidature et souhaitons vous faire part de nos retours.
        </p>
      </div>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.06em;">
          Motif
        </p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">${reason}</p>
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">
        Vous pouvez mettre à jour vos informations et soumettre à nouveau votre candidature à tout moment.
      </p>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pending-approval"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Réviser et soumettre à nouveau →
        </a>
      </div>
    `),
  };
}

// ─── 7. Forgot Password ────────────────────────────────────────────────────────
export function forgotPasswordEmail(
  firstName: string,
  resetUrl: string,
): { subject: string; html: string } {
  return {
    subject: "🔐 Réinitialisation de votre mot de passe Vetalist",
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">🔐</div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">Réinitialisation du mot de passe</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour ${firstName}, nous avons reçu une demande de réinitialisation de votre mot de passe.
        </p>
      </div>

      <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 16px;font-size:13px;color:#1e40af;line-height:1.6;">
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.<br/>
          <strong>Ce lien expire dans 15 minutes.</strong>
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Réinitialiser mon mot de passe →
        </a>
      </div>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#7f1d1d;">
          ⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail. Votre mot de passe ne sera pas modifié.
        </p>
      </div>
    `),
  };
}

// ─── 8. New Booking Notification (sent to VET when client books) ──────────────
export type NewBookingEmailData = {
  vetFirstName: string;
  clientFirstName: string;
  clientLastName: string;
  clinicName: string;
  address: string;
  date: string;
  time: string;
  petName?: string | null;
  reason: string;
  isEmergency: boolean;
  dashboardUrl: string;
};

export function newBookingEmail(data: NewBookingEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `${data.isEmergency ? "🚨 URGENCE —" : "📅"} Nouvelle demande de RDV — ${data.date} à ${data.time}`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:${data.isEmergency ? "#fef2f2" : "#eff6ff"};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">
          ${data.isEmergency ? "🚨" : "📅"}
        </div>
        <h1 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">
          ${data.isEmergency ? "Demande urgente !" : "Nouvelle demande de rendez-vous"}
        </h1>
        <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
          Bonjour Dr. ${data.vetFirstName}, ${data.clientFirstName} ${data.clientLastName} souhaite prendre rendez-vous.
        </p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0;">
        <tr><td>
          <table width="100%" cellpadding="4" cellspacing="0">
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;width:100px;">Client</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.clientFirstName} ${data.clientLastName}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Date</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.date}</td>
            </tr>
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Heure</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.time}</td>
            </tr>
            ${
              data.petName
                ? `
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Animal</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.petName}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Motif</td>
              <td style="font-size:13px;color:#1e293b;font-weight:500;">${data.reason}</td>
            </tr>
            ${
              data.isEmergency
                ? `
            <tr>
              <td style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Type</td>
              <td style="font-size:13px;color:#dc2626;font-weight:700;">🚨 URGENCE</td>
            </tr>`
                : ""
            }
          </table>
        </td></tr>
      </table>

      <div style="text-align:center;margin-top:20px;">
        <a href="${data.dashboardUrl}"
          style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
          Confirmer ou refuser →
        </a>
      </div>

      <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        Connectez-vous à votre tableau de bord pour gérer ce rendez-vous.
      </p>
    `),
  };
}
