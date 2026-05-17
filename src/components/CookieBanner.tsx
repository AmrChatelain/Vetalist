"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem("vetalist-cookie-consent")
      if (!consent) setVisible(true)
    } catch {}
  }, [])

  function acceptAll() {
    try {
      localStorage.setItem("vetalist-cookie-consent", "all")
    } catch {}
    setVisible(false)
  }

  function acceptEssential() {
    try {
      localStorage.setItem("vetalist-cookie-consent", "essential")
    } catch {}
    setVisible(false)
  }

  function dismiss() {
    try {
      localStorage.setItem("vetalist-cookie-consent", "dismissed")
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={18} className="text-violet-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm mb-1">
              Nous utilisons des cookies
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vetalist utilise des cookies essentiels pour le fonctionnement du site
              (gestion de votre session de connexion) et des cookies optionnels pour
              améliorer votre expérience. Vous pouvez choisir d'accepter tous les cookies
              ou uniquement les cookies strictement nécessaires.{" "}
              <Link
                href="/legal/confidentialite"
                className="text-violet-600 hover:underline font-medium"
              >
                En savoir plus
              </Link>
            </p>
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cookie types explanation */}
        <div className="ml-14 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <p className="text-xs font-semibold text-emerald-700 mb-0.5">
              🔒 Cookies essentiels
            </p>
            <p className="text-xs text-emerald-600">
              Session de connexion, sécurité. Toujours actifs.
            </p>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
            <p className="text-xs font-semibold text-violet-700 mb-0.5">
              📊 Cookies optionnels
            </p>
            <p className="text-xs text-violet-600">
              Amélioration de l'expérience, statistiques anonymes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 ml-14">
          <button
            onClick={acceptAll}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Tout accepter
          </button>
          <button
            onClick={acceptEssential}
            className="w-full sm:w-auto bg-white text-slate-600 text-sm font-semibold px-5 py-2 rounded-full border border-slate-200 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            Essentiels uniquement
          </button>
          <button
            onClick={dismiss}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors sm:ml-2"
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>
  )
}