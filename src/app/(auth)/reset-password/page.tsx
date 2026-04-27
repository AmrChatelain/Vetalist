"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  // Wait for Supabase to exchange the token from the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Token from email was valid — user can now set a new password
        setSessionReady(true);
      }
    });

    // If after 5 seconds no PASSWORD_RECOVERY event fired, the link is invalid/expired
    const timeout = setTimeout(() => {
      setInvalidLink((prev) => {
        if (!prev && !sessionReady) return true;
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords don't match — even the cats noticed 🐱");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Failed to reset password. Your link may have expired.");
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push("/login"), 3000);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .rp-root {
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

        .rp-card {
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

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rp-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeUp 0.5s 0.1s both;
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
          background: linear-gradient(135deg, #fbbf24, #fda4af);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(251,191,36,0.3);
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e1a2e;
        }
        .logo-text span { color: #a78bfa; }

        .rp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #1e1a2e;
          margin-bottom: 0.4rem;
        }

        .rp-subtitle {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 300;
          line-height: 1.6;
        }

        /* waiting state */
        .waiting-scene {
          text-align: center;
          padding: 1rem 0 1.5rem;
          animation: fadeUp 0.4s ease both;
        }

        .waiting-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 1rem;
        }

        .waiting-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #c4b5fd;
          animation: dotBounce 1s ease-in-out infinite;
        }
        .waiting-dot:nth-child(2) { animation-delay: 0.15s; }
        .waiting-dot:nth-child(3) { animation-delay: 0.3s; }

        /* invalid link state */
        .invalid-scene {
          text-align: center;
          padding: 1rem 0 1.5rem;
          animation: fadeUp 0.4s ease both;
        }

        .invalid-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          display: block;
        }

        .invalid-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e1a2e;
          margin-bottom: 0.4rem;
        }

        .invalid-text {
          font-size: 0.875rem;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .retry-btn {
          display: inline-block;
          padding: 0.65rem 1.5rem;
          background: linear-gradient(135deg, #a78bfa, #c084fc);
          color: white;
          border-radius: 0.875rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(167,139,250,0.3);
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(167,139,250,0.4);
        }

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
          box-sizing: border-box;
        }

        .field-input:focus {
          border-color: rgba(167,139,250,0.6);
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
        }

        .field-input::placeholder { color: #d1d5db; }
        .field-input.error {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }

        .strength-bar {
          margin-top: 0.5rem;
          height: 4px;
          border-radius: 2px;
          background: rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-label {
          font-size: 0.7rem;
          margin-top: 0.3rem;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

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

        .particle {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          font-size: 14px;
        }

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
          position: absolute;
          top: -44px;
          left: 24px;
          width: 56px;
          height: 56px;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
          z-index: 0;
        }

        .cat-cream {
          position: absolute;
          top: -40px;
          right: 32px;
          width: 48px;
          height: 48px;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
          z-index: 0;
        }

        .kitty-btn:hover .cat-orange { transform: translateY(-12px) rotate(-8deg); }
        .kitty-btn:hover .cat-cream  { transform: translateY(-16px) rotate(8deg); }

        .btn-body {
          position: relative;
          z-index: 10;
          width: 260px;
          height: 80px;
          border-radius: 2rem;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          transition: all 0.5s ease;
          overflow: hidden;
        }

        .btn-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(167,139,250,0.1), rgba(249,168,212,0.1), rgba(147,197,253,0.1));
          opacity: 0;
          transition: opacity 0.7s ease;
        }

        .kitty-btn:hover .btn-body { box-shadow: 0 20px 40px rgba(167,139,250,0.2); transform: scale(1.05); }
        .kitty-btn:hover .btn-shine { opacity: 1; }

        .btn-text {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-left: 8px;
        }

        .btn-label {
          font-size: 10px;
          color: #a78bfa;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 3px;
          transition: color 0.3s;
        }

        .btn-main {
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          letter-spacing: -0.01em;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.3s;
        }

        .kitty-btn:hover .btn-label { color: #7c3aed; }
        .kitty-btn:hover .btn-main  { color: #1e1a2e; }

        .btn-paw {
          margin-left: auto;
          position: relative;
          z-index: 2;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s ease;
        }

        .kitty-btn:hover .btn-paw { transform: rotate(12deg); }

        .btn-glow {
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          background: rgba(167,139,250,0.15);
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.7s ease;
          z-index: -1;
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
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a78bfa;
          margin: 0 2px;
          animation: dotBounce 1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }

        .success-scene {
          text-align: center;
          animation: fadeUp 0.5s ease both;
          padding: 0.5rem 0 1rem;
        }

        .success-icon-wrap {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(249,168,212,0.15));
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          animation: popIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #1e1a2e;
          margin-bottom: 0.5rem;
        }

        .success-text {
          font-size: 0.875rem;
          color: #9ca3af;
          line-height: 1.6;
        }

        .redirect-note {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #a78bfa;
          background: rgba(167,139,250,0.08);
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
        }

        .back-link {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .back-link a {
          color: #a78bfa;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link a:hover { color: #7c3aed; }
      `}</style>

      <div className="rp-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="paw-bg paw-1">🐾</div>
        <div className="paw-bg paw-2">🐾</div>
        <div className="paw-bg paw-3">🐾</div>

        <div className="rp-card">
          <div className="rp-header">
            <div className="logo-area">
              <div className="logo-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M4.5 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-3 14c0-3.3 2.7-6 6-6s6 2.7 6 6H7z"/>
                </svg>
              </div>
              <div className="logo-text">Veta<span>List</span></div>
            </div>
            <h1 className="rp-title">Set new password 🔐</h1>
            <p className="rp-subtitle">Almost there — choose a strong password<br/>and you're back in the den.</p>
          </div>

          {/* 3 possible states: waiting for token, invalid link, or form ready */}
          {done ? (
            <div className="success-scene">
              <div className="success-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="success-title">Password updated! 🎉</p>
              <p className="success-text">
                You're all set. The cats approve.<br/>Welcome back to Vetalist.
              </p>
              <p className="redirect-note">Redirecting you to login in a moment...</p>
            </div>

          ) : invalidLink ? (
            <div className="invalid-scene">
              <span className="invalid-icon">🔗</span>
              <p className="invalid-title">Link expired or invalid</p>
              <p className="invalid-text">
                Reset links expire after 1 hour.<br/>Request a new one and try again.
              </p>
              <a href="/forgot-password" className="retry-btn">Request new link</a>
            </div>

          ) : !sessionReady ? (
            <div className="waiting-scene">
              <div className="waiting-dots">
                <div className="waiting-dot" />
                <div className="waiting-dot" />
                <div className="waiting-dot" />
              </div>
              <p className="rp-subtitle">Verifying your reset link...</p>
            </div>

          ) : (
            <form onSubmit={handleReset}>
              <div className="form-field">
                <label className="field-label" htmlFor="password">New Password</label>
                <input
                  className={`field-input ${message && password !== confirm ? "error" : ""}`}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {password.length > 0 && (() => {
                  const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)
                    ? { w: "100%", color: "#22c55e", label: "Strong 💪" }
                    : password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))
                    ? { w: "60%", color: "#f59e0b", label: "Fair" }
                    : { w: "25%", color: "#ef4444", label: "Too weak" };
                  return (
                    <>
                      <div className="strength-bar">
                        <div className="strength-fill" style={{ width: strength.w, background: strength.color }} />
                      </div>
                      <p className="strength-label" style={{ color: strength.color }}>{strength.label}</p>
                    </>
                  );
                })()}
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="confirm">Confirm Password</label>
                <input
                  className={`field-input ${confirm.length > 0 && password !== confirm ? "error" : ""}`}
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {message && <p className="error-msg">{message}</p>}

              <div className="submit-wrapper">
                <button type="submit" className="kitty-btn" disabled={loading}>
                  <div className="particle p1">✦</div>
                  <div className="particle p2">🌸</div>
                  <div className="particle p3">✨</div>

                  <svg className="cat-orange" viewBox="0 0 50 50">
                    <path className="tail" d="M8 42C2 35 2 20 8 15" stroke="#fcd34d" strokeWidth={4} strokeLinecap="round" fill="none"/>
                    <path d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45" fill="#fbbf24"/>
                    <path d="M15 18L8 5L22 15Z" fill="#fbbf24"/>
                    <path d="M15 18L11 9L19 15Z" fill="#fda4af"/>
                    <path d="M35 18L42 5L28 15Z" fill="#fbbf24"/>
                    <path d="M35 18L39 9L31 15Z" fill="#fda4af"/>
                    <circle cx={20} cy={28} r={3} fill="white"/>
                    <circle cx={20} cy={28} r="1.5" fill="#334155"/>
                    <circle cx={30} cy={28} r={3} fill="white"/>
                    <circle cx={30} cy={28} r="1.5" fill="#334155"/>
                    <circle cx={16} cy={34} r={2} fill="#fda4af" opacity="0.6"/>
                    <circle cx={34} cy={34} r={2} fill="#fda4af" opacity="0.6"/>
                    <circle cx={21} cy={27} r="0.7" fill="white" opacity="0.8"/>
                    <circle cx={31} cy={27} r="0.7" fill="white" opacity="0.8"/>
                  </svg>

                  <svg className="cat-cream" viewBox="0 0 50 50">
                    <path d="M10 45C10 30 15 15 25 15C35 15 40 30 40 45" fill="#fef3c7"/>
                    <path d="M15 18L8 8L22 15Z" fill="#fef3c7"/>
                    <path d="M35 18L42 8L28 15Z" fill="#fef3c7"/>
                    <g className="cream-eyes">
                      <circle cx={20} cy={28} r="1.8" fill="#92400e"/>
                      <circle cx={30} cy={28} r="1.8" fill="#92400e"/>
                    </g>
                    <circle cx={15} cy={33} r="2.5" fill="#fecaca" opacity="0.5"/>
                    <circle cx={35} cy={33} r="2.5" fill="#fecaca" opacity="0.5"/>
                  </svg>

                  <div className="btn-body">
                    <div className="btn-shine" />
                    <div className="btn-text">
                      <span className="btn-label">Confirm</span>
                      <span className="btn-main">
                        {loading
                          ? (<><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></>)
                          : "Save password"
                        }
                      </span>
                    </div>
                    <div className="btn-paw">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#c4b5fd">
                        <circle cx={12} cy={16} r="3.5"/>
                        <circle cx={8} cy={11} r={2}/>
                        <circle cx={12} cy={8} r={2}/>
                        <circle cx={16} cy={11} r={2}/>
                      </svg>
                    </div>
                    <div className="btn-glow" />
                  </div>
                </button>
              </div>
            </form>
          )}

          {!done && !invalidLink && sessionReady && (
            <p className="back-link">
              <a href="/forgot-password">Request a new link instead</a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}