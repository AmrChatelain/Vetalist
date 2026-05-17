"use client"

import { useState } from "react"
import { requestPasswordReset } from "@/actions/password-reset"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Always shows success — never reveals if email exists (security best practice)
    await requestPasswordReset(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .fp-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #fdf6f0 0%, #fef0fa 40%, #f0f4ff 100%);
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1rem; position: relative; overflow: hidden;
        }

        .blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; pointer-events: none; }
        .blob-1 { width: 380px; height: 380px; background: #fcd34d; top: -80px; right: -80px; }
        .blob-2 { width: 280px; height: 280px; background: #c4b5fd; bottom: -60px; left: -60px; }
        .blob-3 { width: 200px; height: 200px; background: #fda4af; top: 40%; left: 10%; }

        .paw-bg { position: absolute; opacity: 0.05; pointer-events: none; font-size: 80px; transform: rotate(-20deg); }
        .paw-1 { top: 8%; left: 5%; }
        .paw-2 { bottom: 12%; right: 6%; transform: rotate(15deg); font-size: 60px; }
        .paw-3 { top: 55%; left: 2%; transform: rotate(-5deg); font-size: 40px; }

        .fp-card {
          position: relative; width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.65); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8); border-radius: 2.5rem;
          padding: 2.5rem 2.5rem 2rem;
          box-shadow: 0 8px 40px rgba(167,139,250,0.12), 0 2px 8px rgba(0,0,0,0.04);
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fp-header { text-align: center; margin-bottom: 2rem; animation: fadeUp 0.5s 0.1s both; }

        .logo-area { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 1.25rem; }

        .logo-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #60a5fa, #8b5cf6);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
        }

        .logo-text { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; color: #1e1a2e; }
        .logo-text span { color: #a78bfa; }

        .fp-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 600; color: #1e1a2e; margin-bottom: 0.4rem; }
        .fp-subtitle { font-size: 0.875rem; color: #9ca3af; font-weight: 300; line-height: 1.5; }

        .cat-scene { display: flex; justify-content: center; margin: 1rem 0 1.5rem; position: relative; height: 80px; }
        .confused-cat { position: relative; width: 80px; height: 80px; }

        .question-mark { position: absolute; top: -8px; right: -12px; font-size: 22px; animation: floatQ 2s ease-in-out infinite; }
        .question-mark-2 { position: absolute; top: -4px; left: -14px; font-size: 16px; animation: floatQ 2s ease-in-out infinite; animation-delay: 0.5s; opacity: 0.6; }

        @keyframes floatQ {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-8px) rotate(5deg); }
        }

        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(15deg); }
          75%       { transform: rotate(-10deg); }
        }

        @keyframes blinkEyes {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }

        .cat-tail { transform-origin: bottom left; animation: tailWag 1.5s ease-in-out infinite; }
        .cat-eyes { transform-origin: center; animation: blinkEyes 3s ease-in-out infinite; }

        .success-scene { text-align: center; animation: fadeUp 0.5s ease both; padding: 1rem 0; }
        .success-icon { font-size: 3.5rem; margin-bottom: 1rem; display: block; animation: popIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .success-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 600; color: #1e1a2e; margin-bottom: 0.5rem; }
        .success-text { font-size: 0.875rem; color: #9ca3af; line-height: 1.6; }
        .success-note { margin-top: 1rem; font-size: 0.8rem; color: #c4b5fd; background: rgba(167,139,250,0.08); border-radius: 0.75rem; padding: 0.6rem 1rem; }

        .form-field { margin-bottom: 1rem; }

        .field-label { display: block; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.45rem; }

        .field-input {
          width: 100%; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.1);
          border-radius: 0.875rem; padding: 0.8rem 1rem; font-size: 0.9375rem;
          font-family: 'DM Sans', sans-serif; color: #1e1a2e;
          transition: all 0.2s ease; outline: none; box-sizing: border-box;
        }

        .field-input:focus { border-color: rgba(167,139,250,0.6); background: rgba(255,255,255,0.9); box-shadow: 0 0 0 3px rgba(167,139,250,0.1); }
        .field-input::placeholder { color: #d1d5db; }

        .submit-wrapper { display: flex; justify-content: center; margin-top: 1.5rem; }

        .kitty-btn { position: relative; padding: 0; background: transparent; border: none; cursor: pointer; outline: none; transition: transform 0.5s ease; }
        .kitty-btn:active { transform: scale(0.9); }
        .kitty-btn:disabled { opacity: 0.7; pointer-events: none; }

        .particle { position: absolute; opacity: 0; pointer-events: none; font-size: 14px; }
        .kitty-btn:hover .particle { animation: floatUp 2s ease-out infinite; }
        .p1 { left: 48px; top: 0; color: #f9a8d4; }
        .p2 { right: 64px; top: 8px; color: #c4b5fd; animation-delay: 0.7s; }
        .p3 { left: 50%; top: 16px; color: #93c5fd; animation-delay: 1.2s; }

        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) scale(0.8); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-40px) scale(1.2); }
        }

        .cat-orange { position: absolute; top: -44px; left: 24px; width: 56px; height: 56px; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); z-index: 0; }
        .cat-cream  { position: absolute; top: -40px; right: 32px; width: 48px; height: 48px; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); z-index: 0; }
        .kitty-btn:hover .cat-orange { transform: translateY(-12px) rotate(-8deg); }
        .kitty-btn:hover .cat-cream  { transform: translateY(-16px) rotate(8deg); }

        .btn-body {
          position: relative; z-index: 10; width: 260px; height: 80px; border-radius: 2rem;
          background: rgba(255,255,255,0.45); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          display: flex; align-items: center; padding: 0 1.25rem; transition: all 0.5s ease; overflow: hidden;
        }

        .btn-shine { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(167,139,250,0.1), rgba(249,168,212,0.1), rgba(147,197,253,0.1)); opacity: 0; transition: opacity 0.7s ease; }
        .kitty-btn:hover .btn-body { box-shadow: 0 20px 40px rgba(167,139,250,0.2); transform: scale(1.05); }
        .kitty-btn:hover .btn-shine { opacity: 1; }

        .btn-text { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; margin-left: 8px; }
        .btn-label { font-size: 10px; color: #a78bfa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 3px; transition: color 0.3s; }
        .btn-main { font-size: 1.125rem; font-weight: 600; color: #334155; letter-spacing: -0.01em; font-family: 'DM Sans', sans-serif; transition: color 0.3s; }
        .kitty-btn:hover .btn-label { color: #7c3aed; }
        .kitty-btn:hover .btn-main  { color: #1e1a2e; }

        .btn-paw { margin-left: auto; position: relative; z-index: 2; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; transition: transform 0.5s ease; }
        .kitty-btn:hover .btn-paw { transform: rotate(12deg); }

        .btn-glow { position: absolute; inset: 0; border-radius: 2rem; background: rgba(167,139,250,0.15); transform: scale(0.9); opacity: 0; transition: all 0.7s ease; z-index: -1; }
        .kitty-btn:hover .btn-glow { transform: scale(1.1); opacity: 1; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%           { transform: scale(1.1); opacity: 1; }
        }

        .loading-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #a78bfa; margin: 0 2px; animation: dotBounce 1s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }

        .back-link { text-align: center; margin-top: 1.75rem; font-size: 0.8125rem; color: #9ca3af; }
        .back-link a { color: #a78bfa; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .back-link a:hover { color: #7c3aed; }
      `}</style>

      <div className="fp-root">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <div className="paw-bg paw-1">🐾</div>
        <div className="paw-bg paw-2">🐾</div>
        <div className="paw-bg paw-3">🐾</div>

        <div className="fp-card">
          <div className="fp-header">
            <div className="logo-area">
              <div className="logo-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M4.5 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-3 14c0-3.3 2.7-6 6-6s6 2.7 6 6H7z"/>
                </svg>
              </div>
              <div className="logo-text">Veta<span>List</span></div>
            </div>
            <h1 className="fp-title">Mot de passe oublié ?</h1>
            <p className="fp-subtitle">
              Pas de panique, même les chats oublient parfois.<br/>
              Nous vous enverrons un lien de réinitialisation.
            </p>
          </div>

          {!sent && (
            <div className="cat-scene">
              <div className="confused-cat">
                <span className="question-mark">❓</span>
                <span className="question-mark-2">❓</span>
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <path className="cat-tail" d="M12 68C4 55 4 35 12 25" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <path d="M16 72C16 48 24 24 40 24C56 24 64 48 64 72" fill="#fbbf24"/>
                  <path d="M24 28L14 8L36 24Z" fill="#fbbf24"/>
                  <path d="M24 28L18 14L30 24Z" fill="#fda4af"/>
                  <path d="M56 28L66 8L44 24Z" fill="#fbbf24"/>
                  <path d="M56 28L62 14L50 24Z" fill="#fda4af"/>
                  <g className="cat-eyes">
                    <text x="26" y="46" fontSize="12" fill="#334155" textAnchor="middle">×</text>
                    <text x="54" y="46" fontSize="12" fill="#334155" textAnchor="middle">×</text>
                  </g>
                  <circle cx="24" cy="52" r="5" fill="#fda4af" opacity="0.5"/>
                  <circle cx="56" cy="52" r="5" fill="#fda4af" opacity="0.5"/>
                  <path d="M34 58 Q37 55 40 58 Q43 61 46 58" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="field-label" htmlFor="email">Votre adresse e-mail</label>
                <input
                  className="field-input"
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="submit-wrapper">
                <button type="submit" className="kitty-btn" disabled={loading}>
                  <div className="particle p1">✦</div>
                  <div className="particle p2">🌸</div>
                  <div className="particle p3">✨</div>

                  <svg className="cat-orange" viewBox="0 0 50 50">
                    <path className="cat-tail" d="M8 42C2 35 2 20 8 15" stroke="#fcd34d" strokeWidth={4} strokeLinecap="round" fill="none"/>
                    <path d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45" fill="#fbbf24"/>
                    <path d="M15 18L8 5L22 15Z" fill="#fbbf24"/><path d="M15 18L11 9L19 15Z" fill="#fda4af"/>
                    <path d="M35 18L42 5L28 15Z" fill="#fbbf24"/><path d="M35 18L39 9L31 15Z" fill="#fda4af"/>
                    <circle cx={20} cy={28} r={3} fill="white"/><circle cx={20} cy={28} r="1.5" fill="#334155"/>
                    <circle cx={30} cy={28} r={3} fill="white"/><circle cx={30} cy={28} r="1.5" fill="#334155"/>
                    <circle cx={16} cy={34} r={2} fill="#fda4af" opacity="0.6"/>
                    <circle cx={34} cy={34} r={2} fill="#fda4af" opacity="0.6"/>
                    <circle cx={21} cy={27} r="0.7" fill="white" opacity="0.8"/>
                    <circle cx={31} cy={27} r="0.7" fill="white" opacity="0.8"/>
                  </svg>

                  <svg className="cat-cream" viewBox="0 0 50 50">
                    <path d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45" fill="#fef3c7"/>
                    <path d="M15 18L8 8L22 15Z" fill="#fef3c7"/><path d="M35 18L42 8L28 15Z" fill="#fef3c7"/>
                    <g className="cat-eyes">
                      <circle cx={20} cy={28} r="1.8" fill="#92400e"/>
                      <circle cx={30} cy={28} r="1.8" fill="#92400e"/>
                    </g>
                    <circle cx={15} cy={33} r="2.5" fill="#fecaca" opacity="0.5"/>
                    <circle cx={35} cy={33} r="2.5" fill="#fecaca" opacity="0.5"/>
                  </svg>

                  <div className="btn-body">
                    <div className="btn-shine"/>
                    <div className="btn-text">
                      <span className="btn-label">Envoyer</span>
                      <span className="btn-main">
                        {loading
                          ? (<><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></>)
                          : "Trouver 🐾"}
                      </span>
                    </div>
                    <div className="btn-paw">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#c4b5fd">
                        <circle cx={12} cy={16} r="3.5"/><circle cx={8} cy={11} r={2}/>
                        <circle cx={12} cy={8} r={2}/><circle cx={16} cy={11} r={2}/>
                      </svg>
                    </div>
                    <div className="btn-glow"/>
                  </div>
                </button>
              </div>
            </form>
          ) : (
            <div className="success-scene">
              <span className="success-icon">📬</span>
              <p className="success-title">E-mail en route !</p>
              <p className="success-text">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.<br/>
                Notre chat coursier est très rapide 🐱💨
              </p>
              <p className="success-note">
                Vous ne le recevez pas ? Vérifiez vos courriers indésirables — les chats font parfois tomber des choses 🙃
              </p>
            </div>
          )}

          <p className="back-link">
            Vous vous en souvenez ? <a href="/login">Retour à la connexion</a>
          </p>
        </div>
      </div>
    </>
  )
}