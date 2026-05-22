"use client"

import { useState, useTransition } from "react"
import { updateClientProfile, changePassword } from "@/actions/client.actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, Lock, CheckCircle2 } from "lucide-react"

type UserData = {
  firstName:   string
  lastName:    string
  phone:       string | null
  email:       string
  hasPassword: boolean
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validatePhone(phone: string): string | null {
  if (!phone) return null // phone is optional
  const cleaned = phone.replace(/\s/g, "")
  // Accepts: +33XXXXXXXXX, 0XXXXXXXXX (French), or international +XX...
  const french      = /^(\+33|0)[1-9]\d{8}$/
  const international = /^\+[1-9]\d{7,14}$/
  if (!french.test(cleaned) && !international.test(cleaned)) {
    return "Numéro invalide. Exemple : +33 6 12 34 56 78 ou 06 12 34 56 78"
  }
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < 8)
    return "Le mot de passe doit contenir au moins 8 caractères."
  if (password.length > 72)
    return "Le mot de passe ne peut pas dépasser 72 caractères."
  if (!/[a-zA-Z]/.test(password))
    return "Le mot de passe doit contenir au moins une lettre."
  if (!/[0-9]/.test(password))
    return "Le mot de passe doit contenir au moins un chiffre."
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsClient({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition()

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName:  user.lastName,
    phone:     user.phone ?? "",
  })
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Password form
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  })
  const [pwdError, setPwdError] = useState<string | null>(null)

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleProfileSave() {
    // Validate phone before submitting
    const phoneErr = validatePhone(profile.phone)
    setPhoneError(phoneErr)
    if (phoneErr) return

    startTransition(async () => {
      const result = await updateClientProfile({
        firstName: profile.firstName,
        lastName:  profile.lastName,
        phone:     profile.phone || undefined,
      })
      if (result.success) {
        toast.success("Profil mis à jour")
      } else {
        toast.error("Une erreur s'est produite")
      }
    })
  }

  function handlePasswordChange() {
    setPwdError(null)

    // Check new password rules first
    const pwdValidErr = validatePassword(pwd.newPassword)
    if (pwdValidErr) {
      setPwdError(pwdValidErr)
      return
    }

    // Then check confirmation match
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdError("Les mots de passe ne correspondent pas.")
      return
    }

    startTransition(async () => {
      const result = await changePassword({
        currentPassword: pwd.currentPassword,
        newPassword:     pwd.newPassword,
      })
      if (result.success) {
        toast.success("Mot de passe modifié")
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setPwdError(result.error ?? "Une erreur s'est produite")
      }
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-[#1e1a2e] flex items-center gap-2">
          <User size={16} className="text-violet-500" />
          Informations personnelles
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Prénom
            </label>
            <input
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Nom
            </label>
            <input
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Adresse e-mail
          </label>
          <input
            value={user.email}
            disabled
            className="w-full text-sm rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">L'adresse e-mail ne peut pas être modifiée.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Téléphone <span className="text-slate-300 font-normal normal-case">(optionnel)</span>
          </label>
          <input
            value={profile.phone}
            onChange={(e) => {
              setProfile((p) => ({ ...p, phone: e.target.value }))
              if (phoneError) setPhoneError(null) // clear error on edit
            }}
            placeholder="+33 6 12 34 56 78"
            className={`w-full text-sm rounded-xl border px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 ${
              phoneError ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1.5 flex items-start gap-1.5">
              <span>⚠️</span> {phoneError}
            </p>
          )}
        </div>

        <Button
          onClick={handleProfileSave}
          disabled={isPending || !profile.firstName.trim() || !profile.lastName.trim()}
          className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full px-6 gap-2"
        >
          <CheckCircle2 size={15} />
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>

      {/* Password section */}
      {user.hasPassword ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[#1e1a2e] flex items-center gap-2">
            <Lock size={16} className="text-violet-500" />
            Changer de mot de passe
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
              className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={pwd.newPassword}
                onChange={(e) => {
                  setPwd((p) => ({ ...p, newPassword: e.target.value }))
                  if (pwdError) setPwdError(null) // clear error on edit
                }}
                placeholder="8 car. min, 1 lettre, 1 chiffre"
                className={`w-full text-sm rounded-xl border px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                  pwdError ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Confirmer
              </label>
              <input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) => {
                  setPwd((p) => ({ ...p, confirmPassword: e.target.value }))
                  if (pwdError) setPwdError(null)
                }}
                className={`w-full text-sm rounded-xl border px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                  pwdError ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Password rules hint */}
          <p className="text-xs text-slate-400">
            Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.
          </p>

          {pwdError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-start gap-1.5">
              <span>⚠️</span> {pwdError}
            </p>
          )}

          <Button
            onClick={handlePasswordChange}
            disabled={isPending || !pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full px-6 gap-2"
          >
            <Lock size={15} />
            {isPending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-400">
          🔐 Vous êtes connecté via Google — aucun mot de passe à gérer.
        </div>
      )}
    </div>
  )
}