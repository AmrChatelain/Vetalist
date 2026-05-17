"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

type WorkingHour = {
  dayOfWeek: number
  startTime: string
  endTime:   string
}

type VetData = {
  id:          string
  clinicName:  string | null
  city:        string
  street:      string
  zipCode:     string
  clinicPhone: string | null
  specialties: string[]
  workingHours: WorkingHour[]
  user:        { firstName: string; lastName: string }
}

export function PrintFlyer({
  vet,
  profileUrl,
}: {
  vet:        VetData
  profileUrl: string
}) {
  
  const name = `Dr. ${vet.user.firstName} ${vet.user.lastName}`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }

        /* Hide everything except the flyer when printing */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .no-print { display: none !important; }
          .flyer {
            box-shadow: none !important;
            border: none !important;
            width: 148mm !important;
            height: 210mm !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          style={{
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}
        >
          🖨️ Imprimer
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            background: "white",
            color: "#64748b",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "10px 20px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Retour
        </button>
      </div>

      {/* The flyer — A5 size (148mm × 210mm) */}
      <div
        className="flyer"
        style={{
          width: 540,
          minHeight: 760,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top gradient header */}
        <div style={{
          background: "linear-gradient(135deg, #1e1a2e 0%, #3b1f6e 100%)",
          padding: "32px 32px 28px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.15)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: 60,
            width: 80, height: 80,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.1)",
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 4px 12px rgba(167,139,250,0.4)",
            }}>
              🐾
            </div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
            }}>
              Veta<span style={{ color: "#a78bfa" }}>list</span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            marginBottom: 8,
          }}>
            Réservez votre<br />rendez-vous en ligne
          </h1>
          <p style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.5,
          }}>
            24h/24 · 7j/7 · Sans attente téléphonique
          </p>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Vet info */}
          <div style={{
            background: "#f5f0fa",
            borderRadius: 14,
            padding: "18px 20px",
            border: "1px solid #ede9f5",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Votre vétérinaire
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#1e1a2e", fontFamily: "'Playfair Display', serif" }}>
              {name}
            </p>
            {vet.clinicName && (
              <p style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600, marginTop: 2 }}>
                {vet.clinicName}
              </p>
            )}
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
              📍 {vet.street}, {vet.zipCode} {vet.city}
            </p>
            {vet.clinicPhone && (
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                📞 {vet.clinicPhone}
              </p>
            )}
          </div>

          {/* QR + instructions side by side */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {/* QR code */}
            <div style={{
              background: "white",
              border: "3px solid #ede9f5",
              borderRadius: 16,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}>
              <QRCodeSVG
                value={profileUrl}
                size={130}
                bgColor="white"
                fgColor="#1e1a2e"
                level="M"
                includeMargin={false}
              />
              <p style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", maxWidth: 130 }}>
                Scannez avec votre téléphone
              </p>
            </div>

            {/* Steps */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1e1a2e", marginBottom: 12 }}>
                Comment ça marche ?
              </p>
              {[
                { n: "1", text: "Scannez le QR code ou visitez vetalist.fr" },
                { n: "2", text: "Créez votre compte gratuitement" },
                { n: "3", text: "Choisissez un créneau disponible" },
                { n: "4", text: "Le vétérinaire confirme votre RDV" },
              ].map((step) => (
                <div key={step.n} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22,
                    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "white",
                    flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.4, paddingTop: 3 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Working hours */}
          {vet.workingHours.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Horaires d'ouverture
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                  const hours = vet.workingHours.find((h) => h.dayOfWeek === dayIdx)
                  return (
                    <div key={dayIdx} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                        {DAY_NAMES[dayIdx]}
                      </span>
                      <span style={{ fontSize: 11, color: hours ? "#1e1a2e" : "#cbd5e1", fontWeight: hours ? 600 : 400 }}>
                        {hours ? `${hours.startTime}–${hours.endTime}` : "Fermé"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Specialties */}
          {vet.specialties.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {vet.specialties.slice(0, 5).map((s) => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600,
                  color: "#7c3aed",
                  background: "#f5f0fa",
                  border: "1px solid #ede9f5",
                  borderRadius: 6,
                  padding: "3px 8px",
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: "#fafafa",
          borderTop: "1px solid #f1f5f9",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <p style={{ fontSize: 10, color: "#94a3b8" }}>
            🐾 Vetalist — La prise de RDV vétérinaire en ligne
          </p>
          <p style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 600 }}>
            vetalist.fr
          </p>
        </div>
      </div>
    </>
  )
}