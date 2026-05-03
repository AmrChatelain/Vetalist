"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { updateVetOnboarding } from "@/actions/onboarding.actions"
import { toast } from "sonner"
import { Save, ArrowRight, ArrowLeft, CheckCircle2, Stethoscope } from "lucide-react"

const STEPS = [
  { id: 1, title: "Professional Profile", desc: "Your background & expertise"    },
  { id: 2, title: "Clinic Details",       desc: "Location & contact info"        },
  { id: 3, title: "Practice Settings",    desc: "Services & payment options"     },
]

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
    const result = await updateVetOnboarding(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Profile saved successfully!")
      router.refresh()
      router.push("/dashboard/vet")
    } else {
      toast.error(`Error: ${result.error}`)
    }
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .pe-root {
          min-height: 100vh;
          background: #f0f4f8;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 50%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .pe-inner {
          width: 100%;
          max-width: 680px;
        }

        /* Page header */
        .pe-page-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 2rem;
        }

        .pe-page-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(59,130,246,0.3);
          flex-shrink: 0;
        }

        .pe-page-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .pe-page-sub {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 2px;
        }

        /* Steps */
        .pe-steps {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 20px;
        }

        .pe-step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .pe-step-item:last-child { flex: 0; }

        .pe-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
          background: white;
          color: #94a3b8;
          transition: all 0.3s;
          font-family: 'Sora', sans-serif;
        }

        .pe-dot.done    { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .pe-dot.current { background: #1d4ed8; border-color: #1d4ed8; color: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }

        .pe-step-text { }
        .pe-step-name { font-size: 0.75rem; font-weight: 600; color: #94a3b8; line-height: 1.2; }
        .pe-step-name.active { color: #1e293b; }
        .pe-step-desc { font-size: 0.65rem; color: #cbd5e1; }

        .pe-connector {
          flex: 1;
          height: 2px;
          background: #f1f5f9;
          margin: 0 10px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        .pe-connector.done { background: #3b82f6; }

        /* Card */
        .pe-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* Progress bar */
        .pe-progress { height: 3px; background: #f1f5f9; }
        .pe-progress-fill {
          height: 100%;
          background: linear-gradient(to right, #3b82f6, #6366f1);
          transition: width 0.4s ease;
        }

        .pe-card-head {
          padding: 22px 28px 18px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pe-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .pe-card-desc { font-size: 0.78rem; color: #94a3b8; margin-top: 3px; }

        .pe-step-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #3b82f6;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 20px;
          padding: 3px 10px;
          flex-shrink: 0;
        }

        .pe-card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }

        /* Fields */
        .pe-field { display: flex; flex-direction: column; gap: 5px; }

        .pe-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.08em;
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
          transition: all 0.2s;
          width: 100%;
        }

        .pe-input:focus, .pe-textarea:focus {
          border-color: #93c5fd;
          background: white;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.18);
        }

        .pe-input.err, .pe-textarea.err { border-color: #fca5a5; background: #fff5f5; }
        .pe-textarea { min-height: 110px; resize: vertical; }
        .pe-hint { font-size: 0.68rem; color: #94a3b8; }
        .pe-error { font-size: 0.7rem; color: #dc2626; }

        .pe-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pe-grid32 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }

        /* Footer */
        .pe-footer {
          padding: 16px 28px;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pe-step-count { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

        .pe-btns { display: flex; gap: 8px; }

        .pe-btn-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 16px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: 1px solid #e2e8f0;
          background: white; color: #64748b;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .pe-btn-ghost:hover { background: #f8fafc; color: #1e293b; }

        .pe-btn-primary {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 20px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: none;
          background: #1d4ed8; color: white;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .pe-btn-primary:hover:not(:disabled) { background: #1e40af; }
        .pe-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="pe-root">
        <div className="pe-inner">

          {/* Page header */}
          <div className="pe-page-header">
            <div className="pe-page-icon">
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <div className="pe-page-title">Professional Profile</div>
              <div className="pe-page-sub">Keep your profile up to date so clients can find and trust you.</div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="pe-steps">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="pe-step-item">
                  <div className={`pe-dot ${currentStep > step.id ? "done" : currentStep === step.id ? "current" : ""}`}>
                    {currentStep > step.id ? <CheckCircle2 size={13} /> : step.id}
                  </div>
                  <div className="pe-step-text">
                    <div className={`pe-step-name ${currentStep >= step.id ? "active" : ""}`}>{step.title}</div>
                    <div className="pe-step-desc">{step.desc}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`pe-connector ${currentStep > step.id ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form card */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="pe-card">

              {/* Progress bar */}
              <div className="pe-progress">
                <div className="pe-progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* Card header */}
              <div className="pe-card-head">
                <div>
                  <div className="pe-card-title">{STEPS[currentStep - 1].title}</div>
                  <div className="pe-card-desc">{STEPS[currentStep - 1].desc}</div>
                </div>
                <span className="pe-step-badge">Step {currentStep} / {STEPS.length}</span>
              </div>

              {/* Card body */}
              <div className="pe-card-body">

                {/* STEP 1 */}
                {currentStep === 1 && (
                  <>
                    <div className="pe-field">
                      <label className="pe-label">Professional Bio</label>
                      <textarea
                        className={`pe-textarea ${errors.bio ? "err" : ""}`}
                        {...register("bio")}
                        placeholder="Describe your expertise, years of experience, and approach to animal care..."
                      />
                      {errors.bio
                        ? <span className="pe-error">{errors.bio.message}</span>
                        : <span className="pe-hint">Min. 20 characters — clients see this on your public profile.</span>}
                    </div>

                    <div className="pe-field">
                      <label className="pe-label">Specialties</label>
                      <input
                        className={`pe-input ${errors.specialties ? "err" : ""}`}
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
                        className={`pe-input ${errors.languagesSpoken ? "err" : ""}`}
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

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <>
                    <div className="pe-grid2">
                      <div className="pe-field">
                        <label className="pe-label">Clinic Name</label>
                        <input
                          className={`pe-input ${errors.clinicName ? "err" : ""}`}
                          {...register("clinicName")}
                          placeholder="Lilas Veterinary Clinic"
                        />
                        {errors.clinicName && <span className="pe-error">{errors.clinicName.message}</span>}
                      </div>
                      <div className="pe-field">
                        <label className="pe-label">Clinic Phone</label>
                        <input
                          className={`pe-input ${errors.clinicPhone ? "err" : ""}`}
                          {...register("clinicPhone")}
                          placeholder="+33 1 23 45 67 89"
                        />
                        {errors.clinicPhone && <span className="pe-error">{errors.clinicPhone.message}</span>}
                      </div>
                    </div>

                    <div className="pe-grid32">
                      <div className="pe-field">
                        <label className="pe-label">Street Address</label>
                        <input
                          className={`pe-input ${errors.street ? "err" : ""}`}
                          {...register("street")}
                          placeholder="123 Rue de Rivoli"
                        />
                        {errors.street && <span className="pe-error">{errors.street.message}</span>}
                      </div>
                      <div className="pe-field">
                        <label className="pe-label">Zip Code</label>
                        <input
                          className={`pe-input ${errors.zipCode ? "err" : ""}`}
                          {...register("zipCode")}
                          placeholder="75011"
                        />
                        {errors.zipCode && <span className="pe-error">{errors.zipCode.message}</span>}
                      </div>
                    </div>

                    <div className="pe-field" style={{ maxWidth: 280 }}>
                      <label className="pe-label">City</label>
                      <input
                        className={`pe-input ${errors.city ? "err" : ""}`}
                        {...register("city")}
                        placeholder="Paris"
                      />
                      {errors.city && <span className="pe-error">{errors.city.message}</span>}
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <>
                    <div className="pe-field">
                      <label className="pe-label">Care Types Offered</label>
                      <input
                        className={`pe-input ${errors.careTypes ? "err" : ""}`}
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
                        className={`pe-input ${errors.paymentMethods ? "err" : ""}`}
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

              {/* Footer */}
              <div className="pe-footer">
                <span className="pe-step-count">Step {currentStep} of {STEPS.length}</span>
                <div className="pe-btns">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="pe-btn-ghost"
                      onClick={() => setCurrentStep((s) => s - 1)}
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                  )}
                  {currentStep < STEPS.length ? (
                    <button type="button" className="pe-btn-primary" onClick={nextStep}>
                      Next <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button type="submit" className="pe-btn-primary" disabled={isSubmitting}>
                      <Save size={13} />
                      {isSubmitting ? "Saving..." : "Save profile"}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </form>

        </div>
      </div>
    </>
  )
}