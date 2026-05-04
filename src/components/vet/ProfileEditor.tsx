"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { updateVetOnboarding, updateVetProfile } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { Save, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const STEPS = [
  { id: 1, title: "Professional Profile", desc: "Your background & expertise"   },
  { id: 2, title: "License & Credentials", desc: "Verify your medical license"  },
  { id: 3, title: "Clinic Details",        desc: "Location & contact info"      },
  { id: 4, title: "Practice Settings",     desc: "Services & payment options"   },
]

function arrToStr(arr: string[] | string): string {
  if (Array.isArray(arr)) return arr.join(", ")
  return arr
}

interface ProfileEditorProps {
  defaultValues?: Partial<OnboardingInput>
  // isUpdate=true → uses updateVetProfile which never resets status
  // isUpdate=false (default) → uses updateVetOnboarding for first-time onboarding
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
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      bio:             defaultValues?.bio             ?? "",
      specialties:     defaultValues?.specialties     ?? ([] as any),
      languagesSpoken: defaultValues?.languagesSpoken ?? ([] as any),
      licenseNumber:   defaultValues?.licenseNumber   ?? "",
      clinicName:      defaultValues?.clinicName      ?? "",
      clinicPhone:     defaultValues?.clinicPhone     ?? "",
      city:            defaultValues?.city            ?? "",
      street:          defaultValues?.street          ?? "",
      zipCode:         defaultValues?.zipCode         ?? "",
      careTypes:       defaultValues?.careTypes       ?? ([] as any),
      paymentMethods:  defaultValues?.paymentMethods  ?? ([] as any),
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
    else toast.error("Please fill in all required fields.")
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true)

    // Use the correct action based on whether this is an update or first-time onboarding
    const action = isUpdate ? updateVetProfile : updateVetOnboarding
    const result = await action(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(isUpdate ? "Profile updated successfully!" : "Profile submitted for review!")
      router.refresh()
      if (!isUpdate) router.push("/pending-approval")
    } else {
      toast.error(`Error: ${result.error}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0
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

      {/* Form card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription className="mt-0.5">{STEPS[currentStep - 1].desc}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                Step {currentStep} / {STEPS.length}
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">

            {/* STEP 1: Professional */}
            {currentStep === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Describe your expertise, years of experience, and approach to animal care..."
                    className={`min-h-27.5 ${errors.bio ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                  />
                  {errors.bio
                    ? <p className="text-xs text-red-500">{errors.bio.message}</p>
                    : <p className="text-xs text-slate-400">Min. 20 characters — shown on your public profile.</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="specialties" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specialties
                  </Label>
                  <Input
                    id="specialties"
                    {...register("specialties")}
                    placeholder="Surgery, Dental, Cardiology, Oncology"
                    defaultValue={defaultValues?.specialties ? arrToStr(defaultValues.specialties) : ""}
                    className={errors.specialties ? "border-red-300 focus-visible:ring-red-200" : ""}
                  />
                  {errors.specialties
                    ? <p className="text-xs text-red-500">{errors.specialties.message as string}</p>
                    : <p className="text-xs text-slate-400">Separate each specialty with a comma.</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="languagesSpoken" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Languages Spoken
                  </Label>
                  <Input
                    id="languagesSpoken"
                    {...register("languagesSpoken")}
                    placeholder="English, French, Arabic"
                    defaultValue={defaultValues?.languagesSpoken ? arrToStr(defaultValues.languagesSpoken) : ""}
                    className={errors.languagesSpoken ? "border-red-300 focus-visible:ring-red-200" : ""}
                  />
                  {errors.languagesSpoken
                    ? <p className="text-xs text-red-500">{errors.languagesSpoken.message as string}</p>
                    : <p className="text-xs text-slate-400">Separate each language with a comma.</p>}
                </div>
              </>
            )}

            {/* STEP 2: License */}
            {currentStep === 2 && (
              <>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={15} className="text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong className="block mb-1">Why we need this</strong>
                    Your license number is reviewed by our admin team and never shown publicly.
                    We verify it against official registries before approving your profile.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="licenseNumber" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Veterinary License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    {...register("licenseNumber")}
                    placeholder="e.g. VET-FR-123456"
                    className={`font-mono ${errors.licenseNumber ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                  />
                  {errors.licenseNumber
                    ? <p className="text-xs text-red-500">{errors.licenseNumber.message}</p>
                    : <p className="text-xs text-slate-400">
                        Issued by your national authority (e.g. Ordre National des Vétérinaires in France).
                      </p>}
                </div>
              </>
            )}

            {/* STEP 3: Clinic */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="clinicName" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Clinic Name
                    </Label>
                    <Input
                      id="clinicName"
                      {...register("clinicName")}
                      placeholder="Clinique Vétérinaire Lilas"
                      className={errors.clinicName ? "border-red-300" : ""}
                    />
                    {errors.clinicName && <p className="text-xs text-red-500">{errors.clinicName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clinicPhone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Clinic Phone
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
                    <Label htmlFor="street" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Street Address
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
                    <Label htmlFor="zipCode" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Zip Code
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
                  <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    City
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

            {/* STEP 4: Practice */}
            {currentStep === 4 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="careTypes" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Care Types Offered
                  </Label>
                  <Input
                    id="careTypes"
                    {...register("careTypes")}
                    placeholder="Consultation générale, Urgences, Chirurgie, Vaccination"
                    defaultValue={defaultValues?.careTypes ? arrToStr(defaultValues.careTypes) : ""}
                    className={errors.careTypes ? "border-red-300" : ""}
                  />
                  {errors.careTypes
                    ? <p className="text-xs text-red-500">{errors.careTypes.message as string}</p>
                    : <p className="text-xs text-slate-400">Separate each type with a comma.</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethods" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment Methods
                  </Label>
                  <Input
                    id="paymentMethods"
                    {...register("paymentMethods")}
                    placeholder="Espèces, Visa, Mastercard, Virement"
                    defaultValue={defaultValues?.paymentMethods ? arrToStr(defaultValues.paymentMethods) : ""}
                    className={errors.paymentMethods ? "border-red-300" : ""}
                  />
                  {errors.paymentMethods
                    ? <p className="text-xs text-red-500">{errors.paymentMethods.message as string}</p>
                    : <p className="text-xs text-slate-400">Separate each method with a comma.</p>}
                </div>
              </>
            )}

          </CardContent>

          <Separator />

          <CardFooter className="flex items-center justify-between bg-slate-50 py-4">
            <span className="text-xs text-slate-400">Step {currentStep} of {STEPS.length}</span>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="gap-1.5"
                >
                  <ArrowLeft size={13} /> Back
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button type="button" size="sm" onClick={nextStep} className="gap-1.5">
                  Next <ArrowRight size={13} />
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                  <Save size={13} />
                  {isSubmitting
                    ? "Saving..."
                    : isUpdate
                      ? "Save changes"
                      : "Submit for review"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}