"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { onboardingSchema, type OnboardingInput, updateVetOnboarding } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { Save, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"

const STEPS = [
  { id: 1, title: "Professional Profile",  desc: "Your background and expertise"         },
  { id: 2, title: "Clinic Details",        desc: "Location and contact information"       },
  { id: 3, title: "Practice Settings",     desc: "Services and payment options"           },
]

// Helper: convert array to comma string for display, and back for submission
function arrToStr(arr: string[] | string): string {
  if (Array.isArray(arr)) return arr.join(", ")
  return arr
}

interface ProfileEditorProps {
  defaultValues?: Partial<OnboardingInput>
}

export default function ProfileEditor({ defaultValues }: ProfileEditorProps) {
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
      2: ["clinicName", "clinicPhone", "city", "street", "zipCode"],
      3: ["careTypes", "paymentMethods"],
    }
    const isValid = await trigger(fieldsMap[currentStep] as any)
    if (isValid) setCurrentStep((s) => s + 1)
    else toast.error("Please fill in all required fields.")
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true)

    // Convert comma-separated strings → arrays (react-hook-form returns strings for text inputs)
    const parse = (v: any) =>
      typeof v === "string"
        ? v.split(",").map((s: string) => s.trim()).filter(Boolean)
        : v

    const processed: OnboardingInput = {
      ...data,
      specialties:     parse(data.specialties),
      languagesSpoken: parse(data.languagesSpoken),
      careTypes:       parse(data.careTypes),
      paymentMethods:  parse(data.paymentMethods),
    }

    const result = await updateVetOnboarding(processed)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Profile saved successfully!")
      router.refresh()
      router.push("/dashboard/vet")
    } else {
      toast.error(`Error: ${result.error}`)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

        .pe-wrap { max-width: 720px; }

        /* Step indicator */
        .pe-steps {
          display: flex;
          align-items: center;
          margin-bottom: 28px;
        }

        .pe-step {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .pe-step:last-child { flex: 0; }

        .step-circle {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
          background: white;
          color: #94a3b8;
          transition: all 0.25s;
          font-family: 'Sora', sans-serif;
        }

        .step-circle.done    { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .step-circle.current { background: #1d4ed8; border-color: #1d4ed8; color: white; }

        .step-label-wrap { }
        .step-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
        .step-label.done, .step-label.current { color: #1e293b; }

        .step-connector {
          flex: 1;
          height: 2px;
          background: #e2e8f0;
          margin: 0 12px;
          transition: background 0.25s;
        }

        .step-connector.done { background: #3b82f6; }

        /* Card */
        .pe-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .pe-card-head {
          padding: 22px 28px 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pe-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
        }

        .pe-card-desc {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 3px;
        }

        .pe-card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }

        /* Field */
        .pe-field { display: flex; flex-direction: column; gap: 6px; }

        .pe-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .pe-input, .pe-textarea {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
          font-family: 'DM Sans', sans-serif;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }

        .pe-input:focus, .pe-textarea:focus {
          border-color: #93c5fd;
          background: white;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.15);
        }

        .pe-input.error, .pe-textarea.error { border-color: #fca5a5; }

        .pe-textarea { min-height: 110px; resize: vertical; }

        .pe-hint {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .pe-error { font-size: 0.72rem; color: #dc2626; }

        .pe-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pe-grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }

        /* Footer */
        .pe-footer {
          padding: 18px 28px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
        }

        .pe-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: 1px solid #e2e8f0;
          background: white; color: #64748b;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .pe-btn-ghost:hover { background: #f8fafc; color: #1e293b; }

        .pe-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: none;
          background: #1d4ed8; color: white;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .pe-btn-primary:hover:not(:disabled) { background: #1e40af; }
        .pe-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="pe-wrap">
        {/* Step indicator */}
        <div className="pe-steps">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="pe-step">
                <div className={`step-circle ${currentStep > step.id ? "done" : currentStep === step.id ? "current" : ""}`}>
                  {currentStep > step.id ? <CheckCircle2 size={14} /> : step.id}
                </div>
                <div className="step-label-wrap">
                  <div className={`step-label ${currentStep >= step.id ? "current" : ""}`}>{step.title}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${currentStep > step.id ? "done" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* IMPORTANT FIX: form wraps the entire card including the footer,
            so the submit button inside CardFooter actually submits the form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pe-card">
            <div className="pe-card-head">
              <div className="pe-card-title">{STEPS[currentStep - 1].title}</div>
              <div className="pe-card-desc">{STEPS[currentStep - 1].desc}</div>
            </div>

            <div className="pe-card-body">
              {/* STEP 1: Professional */}
              {currentStep === 1 && (
                <>
                  <div className="pe-field">
                    <label className="pe-label">Professional Bio</label>
                    <textarea
                      className={`pe-textarea ${errors.bio ? "error" : ""}`}
                      {...register("bio")}
                      placeholder="Describe your expertise, years of experience, and approach to animal care..."
                    />
                    {errors.bio
                      ? <span className="pe-error">{errors.bio.message}</span>
                      : <span className="pe-hint">Minimum 20 characters. This is what clients see on your profile.</span>}
                  </div>

                  <div className="pe-field">
                    <label className="pe-label">Specialties</label>
                    <input
                      className={`pe-input ${errors.specialties ? "error" : ""}`}
                      {...register("specialties")}
                      placeholder="Surgery, Dental, Cardiology, Oncology"
                      defaultValue={defaultValues?.specialties ? arrToStr(defaultValues.specialties) : ""}
                    />
                    {errors.specialties
                      ? <span className="pe-error">{errors.specialties.message as string}</span>
                      : <span className="pe-hint">Separate each specialty with a comma.</span>}
                  </div>

                  <div className="pe-field">
                    <label className="pe-label">Languages Spoken</label>
                    <input
                      className={`pe-input ${errors.languagesSpoken ? "error" : ""}`}
                      {...register("languagesSpoken")}
                      placeholder="English, French, Arabic"
                      defaultValue={defaultValues?.languagesSpoken ? arrToStr(defaultValues.languagesSpoken) : ""}
                    />
                    {errors.languagesSpoken
                      ? <span className="pe-error">{errors.languagesSpoken.message as string}</span>
                      : <span className="pe-hint">Separate each language with a comma.</span>}
                  </div>
                </>
              )}

              {/* STEP 2: Clinic */}
              {currentStep === 2 && (
                <>
                  <div className="pe-grid-2">
                    <div className="pe-field">
                      <label className="pe-label">Clinic Name</label>
                      <input
                        className={`pe-input ${errors.clinicName ? "error" : ""}`}
                        {...register("clinicName")}
                        placeholder="Lilas Veterinary Clinic"
                      />
                      {errors.clinicName && <span className="pe-error">{errors.clinicName.message}</span>}
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Clinic Phone</label>
                      <input
                        className={`pe-input ${errors.clinicPhone ? "error" : ""}`}
                        {...register("clinicPhone")}
                        placeholder="+33 1 23 45 67 89"
                      />
                      {errors.clinicPhone && <span className="pe-error">{errors.clinicPhone.message}</span>}
                    </div>
                  </div>

                  <div className="pe-grid-3">
                    <div className="pe-field">
                      <label className="pe-label">Street Address</label>
                      <input
                        className={`pe-input ${errors.street ? "error" : ""}`}
                        {...register("street")}
                        placeholder="123 Rue de Rivoli"
                      />
                      {errors.street && <span className="pe-error">{errors.street.message}</span>}
                    </div>
                    <div className="pe-field">
                      <label className="pe-label">Zip Code</label>
                      <input
                        className={`pe-input ${errors.zipCode ? "error" : ""}`}
                        {...register("zipCode")}
                        placeholder="75011"
                      />
                      {errors.zipCode && <span className="pe-error">{errors.zipCode.message}</span>}
                    </div>
                  </div>

                  <div className="pe-field" style={{ maxWidth: 300 }}>
                    <label className="pe-label">City</label>
                    <input
                      className={`pe-input ${errors.city ? "error" : ""}`}
                      {...register("city")}
                      placeholder="Paris"
                    />
                    {errors.city && <span className="pe-error">{errors.city.message}</span>}
                  </div>
                </>
              )}

              {/* STEP 3: Practice */}
              {currentStep === 3 && (
                <>
                  <div className="pe-field">
                    <label className="pe-label">Care Types Offered</label>
                    <input
                      className={`pe-input ${errors.careTypes ? "error" : ""}`}
                      {...register("careTypes")}
                      placeholder="General consultation, Urgent care, Surgery, Vaccination"
                      defaultValue={defaultValues?.careTypes ? arrToStr(defaultValues.careTypes) : ""}
                    />
                    {errors.careTypes
                      ? <span className="pe-error">{errors.careTypes.message as string}</span>
                      : <span className="pe-hint">Separate each type with a comma.</span>}
                  </div>

                  <div className="pe-field">
                    <label className="pe-label">Payment Methods</label>
                    <input
                      className={`pe-input ${errors.paymentMethods ? "error" : ""}`}
                      {...register("paymentMethods")}
                      placeholder="Cash, Visa, Mastercard, Bank transfer"
                      defaultValue={defaultValues?.paymentMethods ? arrToStr(defaultValues.paymentMethods) : ""}
                    />
                    {errors.paymentMethods
                      ? <span className="pe-error">{errors.paymentMethods.message as string}</span>
                      : <span className="pe-hint">Separate each method with a comma.</span>}
                  </div>
                </>
              )}
            </div>

            <div className="pe-footer">
              {currentStep > 1
                ? <button type="button" className="pe-btn-ghost" onClick={() => setCurrentStep((s) => s - 1)}>
                    <ArrowLeft size={14} /> Back
                  </button>
                : <div />}

              {currentStep < STEPS.length
                ? <button type="button" className="pe-btn-primary" onClick={nextStep}>
                    Next <ArrowRight size={14} />
                  </button>
                : <button type="submit" className="pe-btn-primary" disabled={isSubmitting}>
                    <Save size={14} />
                    {isSubmitting ? "Saving..." : "Save profile"}
                  </button>}
            </div>
          </div>
        </form>
      </div>
    </>
  )
}