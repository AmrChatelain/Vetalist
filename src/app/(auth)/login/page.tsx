"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    // Do NOT fetch /api/auth/session here — it returns stale data immediately
    // after signIn because the JWT cookie hasn't propagated to the client yet.
    // Instead, do a hard navigation to /dashboard. This forces a full page
    // request so the middleware can read the fresh JWT from the cookie and
    // redirect the user to the correct role-specific dashboard.
    window.location.href = "/dashboard";
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #fdf6f0 0%, #fef0fa 40%, #f0f4ff 100%);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          pointer-events: none;
        }
        .blob-1 { width: 380px; height: 380px; background: #fcd34d; top: -80px; right: -80px; }
        .blob-2 { width: 280px; height: 280px; background: #c4b5fd; bottom: -60px; left: -60px; }
        .blob-3 { width: 200px; height: 200px; background: #fda4af; top: 40%; left: 10%; }

        .paw-bg {
          position: absolute;
          opacity: 0.05;
          pointer-events: none;
          font-size: 80px;
          transform: rotate(-20deg);
        }
        .paw-1 { top: 8%; left: 5%; }
        .paw-2 { bottom: 12%; right: 6%; transform: rotate(15deg); font-size: 60px; }
        .paw-3 { top: 55%; left: 2%; transform: rotate(-5deg); font-size: 40px; }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 2.5rem;
          padding: 2.5rem 2.5rem 2rem;
          box-shadow: 0 8px 40px rgba(167,139,250,0.12), 0 2px 8px rgba(0,0,0,0.04);
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeUp 0.5s 0.1s both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-area {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 1.25rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #60a5fa, #8b5cf6);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
         box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e1a2e;
        }

        .logo-text span { color: #a78bfa; }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #1e1a2e;
          margin-bottom: 0.4rem;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 300;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.5s 0.2s both;
        }

        .google-btn:hover {
          background: rgba(255,255,255,0.95);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .google-btn:active { transform: scale(0.98); }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
        .divider-text { font-size: 0.75rem; color: #d1d5db; letter-spacing: 0.05em; }

        .form-field { margin-bottom: 1rem; }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.45rem;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 0.875rem;
          padding: 0.8rem 1rem;
          font-size: 0.9375rem;
          font-family: 'DM Sans', sans-serif;
          color: #1e1a2e;
          transition: all 0.2s ease;
          outline: none;
        }

        .field-input:focus {
          border-color: rgba(167,139,250,0.6);
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
        }

        .field-input::placeholder { color: #d1d5db; }

        .forgot-link { text-align: right; margin-top: 0.4rem; }
        .forgot-link a { font-size: 0.75rem; color: #a78bfa; text-decoration: none; transition: color 0.2s; }
        .forgot-link a:hover { color: #7c3aed; }

        .error-msg {
          font-size: 0.8125rem;
          color: #ef4444;
          margin: 0.5rem 0;
          padding: 0.5rem 0.75rem;
          background: rgba(239,68,68,0.06);
          border-radius: 0.625rem;
        }

        .submit-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .kitty-btn {
          position: relative;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          outline: none;
          transition: transform 0.5s ease;
        }

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

        .cat-orange {
          position: absolute; top: -44px; left: 24px; width: 56px; height: 56px;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); z-index: 0;
        }

        .cat-cream {
          position: absolute; top: -40px; right: 32px; width: 48px; height: 48px;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); z-index: 0;
        }

        .kitty-btn:hover .cat-orange { transform: translateY(-12px) rotate(-8deg); }
        .kitty-btn:hover .cat-cream  { transform: translateY(-16px) rotate(8deg); }

        .btn-body {
          position: relative; z-index: 10; width: 260px; height: 80px;
          border-radius: 2rem; background: rgba(255,255,255,0.45);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          display: flex; align-items: center; padding: 0 1.25rem;
          transition: all 0.5s ease; overflow: hidden;
        }

        .btn-shine {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(167,139,250,0.1), rgba(249,168,212,0.1), rgba(147,197,253,0.1));
          opacity: 0; transition: opacity 0.7s ease;
        }

        .kitty-btn:hover .btn-body { box-shadow: 0 20px 40px rgba(167,139,250,0.2); transform: scale(1.05); }
        .kitty-btn:hover .btn-shine { opacity: 1; }

        .btn-text {
          position: relative; z-index: 2; display: flex;
          flex-direction: column; align-items: flex-start; margin-left: 8px;
        }

        .btn-label {
          font-size: 10px; color: #a78bfa; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 3px; transition: color 0.3s;
        }

        .btn-main {
          font-size: 1.125rem; font-weight: 600; color: #334155;
          letter-spacing: -0.01em; font-family: 'DM Sans', sans-serif; transition: color 0.3s;
        }

        .kitty-btn:hover .btn-label { color: #7c3aed; }
        .kitty-btn:hover .btn-main  { color: #1e1a2e; }

        .btn-paw {
          margin-left: auto; position: relative; z-index: 2; width: 40px; height: 40px;
          border-radius: 50%; background: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center; transition: transform 0.5s ease;
        }

        .kitty-btn:hover .btn-paw { transform: rotate(12deg); }

        .btn-glow {
          position: absolute; inset: 0; border-radius: 2rem;
          background: rgba(167,139,250,0.15); transform: scale(0.9);
          opacity: 0; transition: all 0.7s ease; z-index: -1;
        }

        .kitty-btn:hover .btn-glow { transform: scale(1.1); opacity: 1; }

        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(15deg); }
          75%       { transform: rotate(-10deg); }
        }

        @keyframes blinkEyes {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%           { transform: scale(1.1); opacity: 1; }
        }

        .tail { transform-origin: bottom left; animation: tailWag 1.5s ease-in-out infinite; }
        .cream-eyes { transform-origin: center; animation: blinkEyes 3s ease-in-out infinite; }

        .loading-dot {
          display: inline-block; width: 5px; height: 5px; border-radius: 50%;
          background: #a78bfa; margin: 0 2px; animation: dotBounce 1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }

        .register-link {
          text-align: center; margin-top: 1.75rem;
          font-size: 0.8125rem; color: #9ca3af;
        }

        .register-link a {
          color: #a78bfa; font-weight: 500; text-decoration: none; transition: color 0.2s;
        }

        .register-link a:hover { color: #7c3aed; }
      `}</style>

      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="paw-bg paw-1">🐾</div>
        <div className="paw-bg paw-2">🐾</div>
        <div className="paw-bg paw-3">🐾</div>

        <div className="login-card">
          <div className="login-header">
            <div className="logo-area">
              <div className="logo-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M4.5 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-3 14c0-3.3 2.7-6 6-6s6 2.7 6 6H7z" />
                </svg>
              </div>
              <div className="logo-text">
                Veta<span>list</span>
              </div>
            </div>
            <h1 className="login-title">Bon retour 🐾</h1>
            <p className="login-subtitle">
              Connectez-vous à votre espace Vetalist
            </p>
          </div>

          {/* Google login — sends to /dashboard so middleware routes by role */}
          <button
            type="button"
            className="google-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">ou</span>
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                className="field-input"
                id="email"
                name="email"
                type="email"
                required
                placeholder="vous@exemple.fr"
                autoComplete="email"
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                className="field-input"
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <div className="forgot-link">
                <a href="/forgot-password">Mot de passe oublié ?</a>
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div className="submit-wrapper">
              <button type="submit" className="kitty-btn" disabled={loading}>
                <div className="particle p1">✦</div>
                <div className="particle p2">🌸</div>
                <div className="particle p3">✨</div>

                <svg className="cat-orange" viewBox="0 0 50 50">
                  <path
                    className="tail"
                    d="M8 42C2 35 2 20 8 15"
                    stroke="#fcd34d"
                    strokeWidth={4}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45"
                    fill="#fbbf24"
                  />
                  <path d="M15 18L8 5L22 15Z" fill="#fbbf24" />
                  <path d="M15 18L11 9L19 15Z" fill="#fda4af" />
                  <path d="M35 18L42 5L28 15Z" fill="#fbbf24" />
                  <path d="M35 18L39 9L31 15Z" fill="#fda4af" />
                  <circle cx={20} cy={28} r={3} fill="white" />
                  <circle cx={20} cy={28} r="1.5" fill="#334155" />
                  <circle cx={30} cy={28} r={3} fill="white" />
                  <circle cx={30} cy={28} r="1.5" fill="#334155" />
                  <circle cx={16} cy={34} r={2} fill="#fda4af" opacity="0.6" />
                  <circle cx={34} cy={34} r={2} fill="#fda4af" opacity="0.6" />
                  <circle cx={21} cy={27} r="0.7" fill="white" opacity="0.8" />
                  <circle cx={31} cy={27} r="0.7" fill="white" opacity="0.8" />
                </svg>

                <svg className="cat-cream" viewBox="0 0 50 50">
                  <path
                    d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45"
                    fill="#fef3c7"
                  />
                  <path d="M15 18L8 8L22 15Z" fill="#fef3c7" />
                  <path d="M35 18L42 8L28 15Z" fill="#fef3c7" />
                  <g className="cream-eyes">
                    <circle cx={20} cy={28} r="1.8" fill="#92400e" />
                    <circle cx={30} cy={28} r="1.8" fill="#92400e" />
                  </g>
                  <circle
                    cx={15}
                    cy={33}
                    r="2.5"
                    fill="#fecaca"
                    opacity="0.5"
                  />
                  <circle
                    cx={35}
                    cy={33}
                    r="2.5"
                    fill="#fecaca"
                    opacity="0.5"
                  />
                </svg>

                <div className="btn-body">
                  <div className="btn-shine" />
                  <div className="btn-text">
                    <span className="btn-label">Connexion</span>
                    <span className="btn-main">
                      {loading ? (
                        <>
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                        </>
                      ) : (
                        "Vetalist"
                      )}
                    </span>
                  </div>
                  <div className="btn-paw">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="#c4b5fd"
                    >
                      <circle cx={12} cy={16} r="3.5" />
                      <circle cx={8} cy={11} r={2} />
                      <circle cx={12} cy={8} r={2} />
                      <circle cx={16} cy={11} r={2} />
                    </svg>
                  </div>
                  <div className="btn-glow" />
                </div>
              </button>
            </div>
          </form>

          <p className="register-link">
            Nouveau sur notre site ? <a href="/register">Créer un compte</a>
          </p>
        </div>
      </div>
    </>
  );
}
