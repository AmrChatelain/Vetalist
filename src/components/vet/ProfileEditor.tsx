"use client"

import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { updateVetOnboarding, updateVetProfile } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { Save, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/vet/Multiselect"
import {
  VETERINARY_SPECIALTIES,
  CARE_TYPES,
  LANGUAGES,
  PAYMENT_METHODS,
} from "@/lib/veterinary-specialties"

const STEPS = [
  { id: 1, title: "Profil professionnel",  desc: "Votre parcours & expertise"       },
  { id: 2, title: "Licence & Accréditation", desc: "Vérification de votre licence"  },
  { id: 3, title: "Informations clinique",  desc: "Localisation & contact"          },
  { id: 4, title: "Paramètres de pratique", desc: "Services & modes de paiement"    },
]

interface ProfileEditorProps {
  defaultValues?: Partial<OnboardingInput>
  isUpdate?: boolean
}

export default function ProfileEditor({ defaultValues, isUpdate = false }: ProfileEditorProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      bio:             defaultValues?.bio             ?? "",
      specialties:     defaultValues?.specialties     ?? [],
      languagesSpoken: defaultValues?.languagesSpoken ?? [],
      licenseNumber:   defaultValues?.licenseNumber   ?? "",
      clinicName:      defaultValues?.clinicName      ?? "",
      clinicPhone:     defaultValues?.clinicPhone     ?? "",
      city:            defaultValues?.city            ?? "",
      street:          defaultValues?.street          ?? "",
      zipCode:         defaultValues?.zipCode         ?? "",
      careTypes:       defaultValues?.careTypes       ?? [],
      paymentMethods:  defaultValues?.paymentMethods  ?? [],
    },
  })

  const nextStep = async () => {
    const fieldsMap: Record<number, (keyof OnboardingInput)[]> = {
      1: ["bio", "specialties", "languagesSpoken"],
      2: ["licenseNumber"],
      3: ["clinicName", "clinicPhone", "city", "street", "zipCode"],
      4: ["careTypes", "paymentMethods"],
    }
    const isValid = await trigger(fieldsMap[currentStep] as any)
    if (isValid) setCurrentStep((s) => s + 1)
    else toast.error("Veuillez remplir tous les champs obligatoires.")
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true)
    const action = isUpdate ? updateVetProfile : updateVetOnboarding
    const result = await action(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(isUpdate ? "Profil mis à jour avec succès !" : "Profil soumis pour examen !")
      router.refresh()
      if (!isUpdate) router.push("/pending-approval")
    } else {
      toast.error(`Erreur : ${result.error}`)
    }
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0
                ${currentStep > step.id
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : currentStep === step.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white border-slate-200 text-slate-400"}`}
              >
                {currentStep > step.id ? <CheckCircle2 size={13} /> : step.id}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${
                currentStep >= step.id ? "text-slate-800" : "text-slate-400"
              }`}>
                {step.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded transition-all ${
                currentStep > step.id ? "bg-blue-500" : "bg-slate-200"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription className="mt-0.5">{STEPS[currentStep - 1].desc}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                Étape {currentStep} / {STEPS.length}
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">

            {/* ÉTAPE 1 — Profil professionnel */}
            {currentStep === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Biographie professionnelle
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Décrivez votre expertise, vos années d'expérience et votre approche des soins vétérinaires..."
                    className={`min-h-[110px] ${errors.bio ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                  />
                  {errors.bio
                    ? <p className="text-xs text-red-500">{errors.bio.message}</p>
                    : <p className="text-xs text-slate-400">Min. 20 caractères — visible sur votre profil public.</p>}
                </div>

                {/* Specialties — MultiSelect */}
                <div className="relative">
                  <Controller
                    name="specialties"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        label="Spécialités"
                        options={VETERINARY_SPECIALTIES}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Sélectionnez vos spécialités..."
                        error={errors.specialties?.message as string}
                        hint="Sélectionnez toutes les spécialités qui correspondent à votre pratique."
                      />
                    )}
                  />
                </div>

                {/* Languages — MultiSelect */}
                <div className="relative">
                  <Controller
                    name="languagesSpoken"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        label="Langues parlées"
                        options={LANGUAGES}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Sélectionnez les langues..."
                        error={errors.languagesSpoken?.message as string}
                        hint="Les langues dans lesquelles vous pouvez consulter."
                      />
                    )}
                  />
                </div>
              </>
            )}

            {/* ÉTAPE 2 — Licence */}
            {currentStep === 2 && (
              <>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck size={15} className="text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong className="block mb-1">Pourquoi nous demandons cela</strong>
                    Votre numéro de licence est examiné par notre équipe et ne sera jamais affiché publiquement.
                    Nous le vérifions auprès des registres officiels avant d'approuver votre profil.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="licenseNumber" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Numéro de licence vétérinaire
                  </Label>
                  <Input
                    id="licenseNumber"
                    {...register("licenseNumber")}
                    placeholder="ex. VET-FR-123456"
                    className={`font-mono ${errors.licenseNumber ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                  />
                  {errors.licenseNumber
                    ? <p className="text-xs text-red-500">{errors.licenseNumber.message}</p>
                    : <p className="text-xs text-slate-400">
                        Délivré par l'Ordre National des Vétérinaires ou votre autorité nationale compétente.
                      </p>}
                </div>
              </>
            )}

            {/* ÉTAPE 3 — Clinique */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="clinicName" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Nom de la clinique
                    </Label>
                    <Input
                      id="clinicName"
                      {...register("clinicName")}
                      placeholder="Clinique Vétérinaire des Lilas"
                      className={errors.clinicName ? "border-red-300" : ""}
                    />
                    {errors.clinicName && <p className="text-xs text-red-500">{errors.clinicName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clinicPhone" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Téléphone de la clinique
                    </Label>
                    <Input
                      id="clinicPhone"
                      {...register("clinicPhone")}
                      placeholder="+33 1 23 45 67 89"
                      className={errors.clinicPhone ? "border-red-300" : ""}
                    />
                    {errors.clinicPhone && <p className="text-xs text-red-500">{errors.clinicPhone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="street" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Adresse
                    </Label>
                    <Input
                      id="street"
                      {...register("street")}
                      placeholder="123 Rue de Rivoli"
                      className={errors.street ? "border-red-300" : ""}
                    />
                    {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zipCode" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Code postal
                    </Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      placeholder="75011"
                      className={errors.zipCode ? "border-red-300" : ""}
                    />
                    {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
                  </div>
                </div>

                <div className="max-w-[200px] space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Paris"
                    className={errors.city ? "border-red-300" : ""}
                  />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
              </>
            )}

            {/* ÉTAPE 4 — Pratique */}
            {currentStep === 4 && (
              <>
                {/* Care types — MultiSelect */}
                <div className="relative">
                  <Controller
                    name="careTypes"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        label="Types de soins proposés"
                        options={CARE_TYPES}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Sélectionnez les types de soins..."
                        error={errors.careTypes?.message as string}
                        hint="Sélectionnez tous les types de consultations que vous proposez."
                      />
                    )}
                  />
                </div>

                {/* Payment methods — MultiSelect */}
                <div className="relative">
                  <Controller
                    name="paymentMethods"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        label="Modes de paiement acceptés"
                        options={PAYMENT_METHODS}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Sélectionnez les modes de paiement..."
                        error={errors.paymentMethods?.message as string}
                        hint="Les modes de paiement que vous acceptez à la clinique."
                      />
                    )}
                  />
                </div>
              </>
            )}

          </CardContent>

          <Separator />

          <CardFooter className="flex items-center justify-between bg-slate-50 py-4">
            <span className="text-xs text-slate-400">Étape {currentStep} sur {STEPS.length}</span>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="gap-1.5"
                >
                  <ArrowLeft size={13} /> Retour
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button type="button" size="sm" onClick={nextStep} className="gap-1.5">
                  Suivant <ArrowRight size={13} />
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                  <Save size={13} />
                  {isSubmitting
                    ? "Enregistrement..."
                    : isUpdate ? "Sauvegarder" : "Soumettre pour examen"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}