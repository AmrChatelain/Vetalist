import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { Clock, CheckCircle2, XCircle, Stethoscope, Mail } from "lucide-react"

export default async function PendingApprovalPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "VET") redirect("/dashboard/client")

  const vet = await db.vetProfile.findUnique({
    where: { userId: session.user.id },
    select: { status: true, rejectionReason: true, licenseNumber: true, clinicName: true },
  })

  // If no profile yet, send back to onboarding
  if (!vet) redirect("/onboarding")

  // If approved, send to dashboard
  if (vet.status === "ACTIVE") redirect("/dashboard/vet")

  const isRejected = vet.status === "REJECTED"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pa-root {
          min-height: 100vh;
          background: #f0f4f8;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .pa-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 40px rgba(0,0,0,0.07);
          padding: 48px 40px;
          width: 100%;
          max-width: 500px;
          text-align: center;
        }

        .pa-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 2rem; text-decoration: none;
        }

        .pa-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(59,130,246,0.35);
        }

        .pa-logo-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem; font-weight: 700; color: #0f172a;
        }

        .pa-logo-name span { color: #3b82f6; }

        .pa-icon-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .pa-icon-wrap.pending  { background: #fffbeb; color: #d97706; }
        .pa-icon-wrap.rejected { background: #fef2f2; color: #dc2626; }

        .pa-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.4rem; font-weight: 700; color: #0f172a;
          letter-spacing: -0.02em; margin-bottom: 10px;
        }

        .pa-subtitle { font-size: 0.875rem; color: #64748b; line-height: 1.7; }

        .pa-divider { height: 1px; background: #f1f5f9; margin: 24px 0; }

        .pa-info-grid {
          display: flex; flex-direction: column; gap: 10px;
          text-align: left;
        }

        .pa-info-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; background: #f8fafc;
          border-radius: 8px; border: 1px solid #f1f5f9;
        }

        .pa-info-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; min-width: 90px; text-transform: uppercase; letter-spacing: 0.05em; }
        .pa-info-value { font-size: 0.8rem; color: #1e293b; font-weight: 500; }

        .pa-rejection-box {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 10px; padding: 16px; margin-top: 16px;
          text-align: left;
        }

        .pa-rejection-title {
          font-size: 0.78rem; font-weight: 700; color: #dc2626;
          margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
        }

        .pa-rejection-text { font-size: 0.8rem; color: #7f1d1d; line-height: 1.6; }

        .pa-steps {
          display: flex; flex-direction: column; gap: 10px;
          text-align: left; margin-top: 4px;
        }

        .pa-step {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 14px; border-radius: 8px;
          background: #f8fafc; border: 1px solid #f1f5f9;
        }

        .pa-step-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: #dbeafe; color: #1d4ed8;
          font-size: 0.65rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }

        .pa-step-text { font-size: 0.78rem; color: #334155; line-height: 1.5; }
        .pa-step-text strong { color: #1e293b; display: block; margin-bottom: 1px; }

        .pa-contact {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 0.78rem; color: #64748b; margin-top: 20px;
        }

        .pa-contact a { color: #3b82f6; text-decoration: none; font-weight: 500; }
        .pa-contact a:hover { text-decoration: underline; }

        .pa-resubmit-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 22px; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          border: none; background: #1d4ed8; color: white;
          text-decoration: none; margin-top: 20px;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }

        .pa-resubmit-btn:hover { background: #1e40af; }
      `}</style>

      <div className="pa-root">
        <div className="pa-card">

          {/* Logo */}
          <div className="pa-logo">
            <div className="pa-logo-icon">
              <Stethoscope size={17} color="white" />
            </div>
            <span className="pa-logo-name">Vet<span>alist</span></span>
          </div>

          {/* Icon */}
          <div className={`pa-icon-wrap ${isRejected ? "rejected" : "pending"}`}>
            {isRejected
              ? <XCircle size={34} />
              : <Clock size={34} />}
          </div>

          {/* Title */}
          <div className="pa-title">
            {isRejected ? "Application Not Approved" : "Application Under Review"}
          </div>
          <div className="pa-subtitle">
            {isRejected
              ? "Unfortunately your application was not approved this time. Please review the reason below and resubmit."
              : "Thank you for completing your profile. Our team is reviewing your credentials — this usually takes 1–2 business days."}
          </div>

          <div className="pa-divider" />

          {/* Profile summary */}
          {vet.clinicName && (
            <div className="pa-info-grid">
              <div className="pa-info-row">
                <span className="pa-info-label">Clinic</span>
                <span className="pa-info-value">{vet.clinicName}</span>
              </div>
              <div className="pa-info-row">
                <span className="pa-info-label">License</span>
                <span className="pa-info-value" style={{ fontFamily: "monospace" }}>{vet.licenseNumber}</span>
              </div>
              <div className="pa-info-row">
                <span className="pa-info-label">Status</span>
                <span className="pa-info-value" style={{ color: isRejected ? "#dc2626" : "#d97706", fontWeight: 600 }}>
                  {isRejected ? "❌ Rejected" : "⏳ Pending review"}
                </span>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {isRejected && vet.rejectionReason && (
            <div className="pa-rejection-box">
              <div className="pa-rejection-title">
                <XCircle size={13} /> Reason for rejection
              </div>
              <div className="pa-rejection-text">{vet.rejectionReason}</div>
            </div>
          )}

          {/* What happens next (pending only) */}
          {!isRejected && (
            <>
              <div className="pa-divider" />
              <div style={{ textAlign: "left", marginBottom: 10 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  What happens next
                </div>
                <div className="pa-steps">
                  <div className="pa-step">
                    <div className="pa-step-num">1</div>
                    <div className="pa-step-text">
                      <strong>License verification</strong>
                      Our team checks your license number against official registries.
                    </div>
                  </div>
                  <div className="pa-step">
                    <div className="pa-step-num">2</div>
                    <div className="pa-step-text">
                      <strong>Profile review</strong>
                      We review your clinic details and practice information.
                    </div>
                  </div>
                  <div className="pa-step">
                    <div className="pa-step-num">3</div>
                    <div className="pa-step-text">
                      <strong>You go live</strong>
                      Once approved, you'll receive an email and can start accepting bookings.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Resubmit button for rejected */}
          {isRejected && (
            <div style={{ textAlign: "center" }}>
              <a href="/onboarding" className="pa-resubmit-btn">
                Update & resubmit
              </a>
            </div>
          )}

          {/* Contact */}
          <div className="pa-contact">
            <Mail size={13} />
            Questions? <a href="mailto:support@vetalist.com">support@vetalist.com</a>
          </div>

        </div>
      </div>
    </>
  )
}