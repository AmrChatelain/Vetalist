"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addPet, updatePet, archivePet } from "@/actions/client.actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Plus, Pencil, Archive, PawPrint, X } from "lucide-react"

type Pet = {
  id:        string
  name:      string
  species:   string
  breed:     string | null
  birthDate: Date | null
  gender:    "MALE" | "FEMALE" | null
  notes:     string | null
}

const SPECIES    = ["Chien", "Chat", "Lapin", "Oiseau", "Reptile", "Rongeur", "Autre"]
const SPECIES_EMOJI: Record<string, string> = {
  Chien: "🐕", Chat: "🐱", Lapin: "🐰", Oiseau: "🦜",
  Reptile: "🦎", Rongeur: "🐹", Autre: "🐾",
}
const GENDER_LABELS = { MALE: "Mâle", FEMALE: "Femelle" }

type FormState = {
  name:      string
  species:   string
  breed:     string
  birthDate: string
  gender:    "" | "MALE" | "FEMALE"
  notes:     string
}

const EMPTY_FORM: FormState = {
  name: "", species: "Chien", breed: "", birthDate: "", gender: "", notes: "",
}

function PetModal({
  mode,
  initial,
  onClose,
  onSubmit,
  isPending,
}: {
  mode:      "add" | "edit"
  initial:   FormState
  onClose:   () => void
  onSubmit:  (data: FormState) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<FormState>(initial)

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#1e1a2e]">
            {mode === "add" ? "Ajouter un animal" : "Modifier l'animal"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Nom *
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex : Luna"
            className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {/* Species */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
            Espèce *
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("species", s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.species === s
                    ? "bg-violet-500 text-white border-violet-500"
                    : "border-slate-200 text-slate-600 hover:border-violet-300"
                }`}
              >
                {SPECIES_EMOJI[s]} {s}
              </button>
            ))}
          </div>
        </div>

        {/* Breed + Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Race
            </label>
            <input
              value={form.breed}
              onChange={(e) => set("breed", e.target.value)}
              placeholder="Ex : Labrador"
              className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Genre
            </label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value as FormState["gender"])}
              className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            >
              <option value="">Non précisé</option>
              <option value="MALE">Mâle</option>
              <option value="FEMALE">Femelle</option>
            </select>
          </div>
        </div>

        {/* Birth date */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Date de naissance
          </label>
          <input
            type="date"
            value={form.birthDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => set("birthDate", e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Notes vétérinaires (optionnel)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Allergies, traitements en cours, particularités..."
            rows={3}
            maxLength={500}
            className="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isPending} className="flex-1 rounded-full">
            Annuler
          </Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={isPending || !form.name.trim()}
            className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
          >
            {isPending
              ? "Enregistrement..."
              : mode === "add" ? "Ajouter" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PetsClient({ initialPets }: { initialPets: Pet[] }) {
  const router                       = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modal, setModal]            = useState<{ mode: "add" | "edit"; pet?: Pet } | null>(null)
  const [archiving, setArchiving]    = useState<Pet | null>(null)

  function openAdd()          { setModal({ mode: "add"                 }) }
  function openEdit(pet: Pet) { setModal({ mode: "edit", pet           }) }
  function closeModal()       { setModal(null)                            }

  function handleSubmit(data: FormState) {
    startTransition(async () => {
      const payload = {
        name:      data.name,
        species:   data.species,
        breed:     data.breed     || null,
        birthDate: data.birthDate || null,
        gender:    (data.gender   || null) as "MALE" | "FEMALE" | null,
        notes:     data.notes     || null,
      }

      const result =
        modal?.mode === "edit" && modal.pet
          ? await updatePet(modal.pet.id, payload)
          : await addPet(payload)

      if (result.success) {
        toast.success(modal?.mode === "edit" ? "Animal mis à jour" : "Animal ajouté")
        closeModal()
        router.refresh()
      } else {
        toast.error("Une erreur s'est produite")
      }
    })
  }

  function handleArchive() {
    if (!archiving) return
    startTransition(async () => {
      const result = await archivePet(archiving.id)
      if (result.success) {
        toast.success(`${archiving.name} a été archivé`)
        setArchiving(null)
        router.refresh()
      } else {
        toast.error("Une erreur s'est produite")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Add button */}
      <Button
        onClick={openAdd}
        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full px-5 gap-2 shadow-md"
      >
        <Plus size={16} /> Ajouter un animal
      </Button>

      {/* Pets grid */}
      {initialPets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16">
          <PawPrint size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 text-sm">Aucun animal enregistré</p>
          <p className="text-xs text-slate-300 mt-1">
            Ajoutez vos animaux pour les associer à vos rendez-vous.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initialPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  {SPECIES_EMOJI[pet.species] ?? "🐾"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{pet.name}</p>
                  <p className="text-sm text-slate-400">
                    {pet.species}
                    {pet.breed   ? ` · ${pet.breed}`                                              : ""}
                    {pet.gender  ? ` · ${GENDER_LABELS[pet.gender]}`                             : ""}
                    {pet.birthDate
                      ? ` · né(e) le ${new Date(pet.birthDate).toLocaleDateString("fr-FR")}`
                      : ""}
                  </p>
                  {pet.notes && (
                    <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-2">{pet.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(pet)}
                  className="rounded-full text-xs gap-1 flex-1"
                >
                  <Pencil size={12} /> Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setArchiving(pet)}
                  className="rounded-full text-xs gap-1 text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200"
                >
                  <Archive size={12} /> Archiver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <PetModal
          mode={modal.mode}
          initial={
            modal.pet
              ? {
                  name:      modal.pet.name,
                  species:   modal.pet.species,
                  breed:     modal.pet.breed     ?? "",
                  birthDate: modal.pet.birthDate
                    ? new Date(modal.pet.birthDate).toISOString().split("T")[0]
                    : "",
                  gender:    modal.pet.gender ?? "",
                  notes:     modal.pet.notes  ?? "",
                }
              : EMPTY_FORM
          }
          onClose={closeModal}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}

      {/* Archive confirmation */}
      {archiving && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => e.target === e.currentTarget && setArchiving(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Archive size={20} className="text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Archiver {archiving.name} ?</h3>
              <p className="text-sm text-slate-400 mt-1">
                L'animal sera retiré de votre liste. Cette action est réversible depuis votre
                historique de rendez-vous.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setArchiving(null)} className="flex-1 rounded-full">
                Annuler
              </Button>
              <Button
                onClick={handleArchive}
                disabled={isPending}
                className="flex-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isPending ? "..." : "Archiver"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}