"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { updateVetOnboarding } from "@/actions/onboarding.actions"
import { CheckCircle2, ArrowRight, ArrowLeft, Stethoscope, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { id: 1, title: "Professional Profile", desc: "Your background & expertise"    },
  { id: 2, title: "License & Credentials", desc: "Verify your medical license"  },
  { id: 3, title: "Clinic Details",        desc: "Location & contact info"      },
  { id: 4, title: "Practice Settings",     desc: "Services & payment options"   },
]

export default function OnboardingPage() {
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
      bio:             "",
      specialties:     [] as any,
      languagesSpoken: [] as any,
      licenseNumber:   "",
      clinicName:      "",
      clinicPhone:     "",
      city:            "",
      street:          "",
      zipCode:         "",
      careTypes:       [] as any,
      paymentMethods:  [] as any,
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
    else toast.error("Please fill in all required fields correctly.")
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true)
    const result = await updateVetOnboarding(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Profile submitted! Awaiting admin approval.")
      router.push("/pending-approval")
    } else {
      toast.error(`Error: ${result.error}`)
    }
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .ob-root {
          min-height: 100vh;
          background: #f0f4f8;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 3rem 1rem 4rem;
          font-family: 'DM Sans', sans-serif;
        }

        .ob-inner { width: 100%; max-width: 640px; }

        .ob-header { text-align: center; margin-bottom: 2rem; }

        .ob-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 1.25rem;
        }

        .ob-logo-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }

        .ob-logo-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.2rem; font-weight: 700; color: #0f172a;
        }

        .ob-logo-name span { color: #3b82f6; }

        .ob-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem; font-weight: 700; color: #0f172a;
          letter-spacing: -0.03em; margin-bottom: 6px;
        }

        .ob-subtitle { font-size: 0.875rem; color: #64748b; }

        /* Steps */
        .ob-steps {
          display: flex; align-items: flex-start;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          gap: 0;
        }

        .ob-step-wrap {
          display: flex; align-items: center; flex: 1;
        }

        .ob-step-wrap:last-child { flex: 0; }

        .ob-step-inner {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          min-width: 60px;
        }

        .ob-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
          border: 2px solid #e2e8f0; background: white; color: #94a3b8;
          transition: all 0.3s; font-family: 'Sora', sans-serif;
        }

        .ob-dot.done    { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .ob-dot.current { background: #1d4ed8; border-color: #1d4ed8; color: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }

        .ob-step-label {
          font-size: 0.62rem; font-weight: 600; color: #94a3b8;
          text-align: center; white-space: nowrap;
        }

        .ob-step-label.active { color: #1e293b; }

        .ob-line {
          flex: 1; height: 2px; background: #e2e8f0;
          margin: 0 6px; margin-bottom: 22px;
          border-radius: 2px; transition: background 0.3s;
        }

        .ob-line.done { background: #3b82f6; }

        /* Card */
        .ob-card {
          background: white; border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden;
        }

        .ob-progress { height: 3px; background: #f1f5f9; }
        .ob-progress-fill {
          height: 100%;
          background: linear-gradient(to right, #3b82f6, #6366f1);
          transition: width 0.4s ease;
        }

        .ob-card-head {
          padding: 22px 28px 18px; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }

        .ob-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem; font-weight: 600; color: #0f172a;
        }

        .ob-card-desc { font-size: 0.78rem; color: #94a3b8; margin-top: 3px; }

        .ob-step-badge {
          font-size: 0.68rem; font-weight: 700; color: #3b82f6;
          background: #eff6ff; border: 1px solid #dbeafe;
          border-radius: 20px; padding: 3px 10px; flex-shrink: 0;
        }

        .ob-card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }

        /* License step special box */
        .license-info {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; border-radius: 10px;
          background: #eff6ff; border: 1px solid #dbeafe;
        }

        .license-info-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #dbeafe; color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .license-info-text { font-size: 0.78rem; color: #1e40af; line-height: 1.5; }
        .license-info-text strong { display: block; margin-bottom: 2px; font-size: 0.8rem; }

        /* Fields */
        .ob-field { display: flex; flex-direction: column; gap: 5px; }

        .ob-label {
          font-size: 0.7rem; font-weight: 700; color: #374151;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        .ob-input, .ob-textarea {
          padding: 10px 14px; border-radius: 8px;
          border: 1px solid #e2e8f0; font-size: 0.875rem;
          color: #1e293b; font-family: 'DM Sans', sans-serif;
          background: #fafafa; outline: none;
          transition: all 0.2s; width: 100%;
        }

        .ob-input:focus, .ob-textarea:focus {
          border-color: #93c5fd; background: white;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.2);
        }

        .ob-input.err, .ob-textarea.err { border-color: #fca5a5; background: #fff5f5; }
        .ob-textarea { min-height: 110px; resize: vertical; }
        .ob-hint { font-size: 0.68rem; color: #94a3b8; }
        .ob-error { font-size: 0.7rem; color: #dc2626; }

        .ob-grid2  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ob-grid32 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }

        /* Footer */
        .ob-footer {
          padding: 16px 28px; border-top: 1px solid #f1f5f9;
          background: #fafafa;
          display: flex; justify-content: space-between; align-items: center;
        }

        .ob-step-count { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
        .ob-btns { display: flex; gap: 8px; }

        .ob-btn-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 16px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          border: 1px solid #e2e8f0; background: white; color: #64748b;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .ob-btn-ghost:hover { background: #f8fafc; color: #1e293b; }

        .ob-btn-primary {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 20px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          border: none; background: #1d4ed8; color: white;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .ob-btn-primary:hover:not(:disabled) { background: #1e40af; }
        .ob-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="ob-root">
        <div className="ob-inner">

          {/* Header */}
          <div className="ob-header">
            <div className="ob-logo">
              <div className="ob-logo-icon">
                <Stethoscope size={18} color="white" />
              </div>
              <span className="ob-logo-name">Vet<span>alist</span></span>
            </div>
            <h1 className="ob-title">Complete Your Profile</h1>
            <p className="ob-subtitle">
              Fill in your professional details to join Vetalist. Your profile will be reviewed before going live.
            </p>
          </div>

          {/* Step indicator */}
          <div className="ob-steps">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="ob-step-wrap">
                  <div className="ob-step-inner">
                    <div className={`ob-dot ${currentStep > step.id ? "done" : currentStep === step.id ? "current" : ""}`}>
                      {currentStep > step.id ? <CheckCircle2 size={13} /> : step.id}
                    </div>
                    <div className={`ob-step-label ${currentStep >= step.id ? "active" : ""}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`ob-line ${currentStep > step.id ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div className="ob-card">
            <div className="ob-progress">
              <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="ob-card-head">
                <div>
                  <div className="ob-card-title">{STEPS[currentStep - 1].title}</div>
                  <div className="ob-card-desc">{STEPS[currentStep - 1].desc}</div>
                </div>
                <span className="ob-step-badge">Step {currentStep} / {STEPS.length}</span>
              </div>

              <div className="ob-card-body">

                {/* STEP 1: Professional */}
                {currentStep === 1 && (
                  <>
                    <div className="ob-field">
                      <label className="ob-label">Professional Bio</label>
                      <textarea
                        className={`ob-textarea ${errors.bio ? "err" : ""}`}
                        {...register("bio")}
                        placeholder="Describe your expertise, years of experience, and approach to animal care..."
                      />
                      {errors.bio
                        ? <span className="ob-error">{errors.bio.message}</span>
                        : <span className="ob-hint">Min. 20 characters — clients see this on your public profile.</span>}
                    </div>

                    <div className="ob-field">
                      <label className="ob-label">Specialties</label>
                      <input
                        className={`ob-input ${errors.specialties ? "err" : ""}`}
                        {...register("specialties")}
                        placeholder="Surgery, Dental, Cardiology, Oncology"
                      />
                      {errors.specialties
                        ? <span className="ob-error">{errors.specialties.message as string}</span>
                        : <span className="ob-hint">Separate each specialty with a comma.</span>}
                    </div>

                    <div className="ob-field">
                      <label className="ob-label">Languages Spoken</label>
                      <input
                        className={`ob-input ${errors.languagesSpoken ? "err" : ""}`}
                        {...register("languagesSpoken")}
                        placeholder="English, French, Arabic"
                      />
                      {errors.languagesSpoken
                        ? <span className="ob-error">{errors.languagesSpoken.message as string}</span>
                        : <span className="ob-hint">Separate each language with a comma.</span>}
                    </div>
                  </>
                )}

                {/* STEP 2: License */}
                {currentStep === 2 && (
                  <>
                    <div className="license-info">
                      <div className="license-info-icon">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="license-info-text">
                        <strong>Why we need this</strong>
                        Vetalist verifies every veterinarian before they go live on the platform.
                        Your license number will be reviewed by our admin team and never shown publicly.
                      </div>
                    </div>

                    <div className="ob-field">
                      <label className="ob-label">Veterinary License Number</label>
                      <input
                        className={`ob-input ${errors.licenseNumber ? "err" : ""}`}
                        {...register("licenseNumber")}
                        placeholder="e.g. VET-FR-123456"
                        style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                      />
                      {errors.licenseNumber
                        ? <span className="ob-error">{errors.licenseNumber.message}</span>
                        : <span className="ob-hint">
                            Enter your official veterinary license number issued by your national authority
                            (e.g. Ordre National des Vétérinaires in France).
                          </span>}
                    </div>
                  </>
                )}

                {/* STEP 3: Clinic */}
                {currentStep === 3 && (
                  <>
                    <div className="ob-grid2">
                      <div className="ob-field">
                        <label className="ob-label">Clinic Name</label>
                        <input
                          className={`ob-input ${errors.clinicName ? "err" : ""}`}
                          {...register("clinicName")}
                          placeholder="Clinique Vétérinaire Lilas"
                        />
                        {errors.clinicName && <span className="ob-error">{errors.clinicName.message}</span>}
                      </div>
                      <div className="ob-field">
                        <label className="ob-label">Clinic Phone</label>
                        <input
                          className={`ob-input ${errors.clinicPhone ? "err" : ""}`}
                          {...register("clinicPhone")}
                          placeholder="+33 1 23 45 67 89"
                        />
                        {errors.clinicPhone && <span className="ob-error">{errors.clinicPhone.message}</span>}
                      </div>
                    </div>

                    <div className="ob-grid32">
                      <div className="ob-field">
                        <label className="ob-label">Street Address</label>
                        <input
                          className={`ob-input ${errors.street ? "err" : ""}`}
                          {...register("street")}
                          placeholder="123 Rue de Rivoli"
                        />
                        {errors.street && <span className="ob-error">{errors.street.message}</span>}
                      </div>
                      <div className="ob-field">
                        <label className="ob-label">Zip Code</label>
                        <input
                          className={`ob-input ${errors.zipCode ? "err" : ""}`}
                          {...register("zipCode")}
                          placeholder="75011"
                        />
                        {errors.zipCode && <span className="ob-error">{errors.zipCode.message}</span>}
                      </div>
                    </div>

                    <div className="ob-field" style={{ maxWidth: 260 }}>
                      <label className="ob-label">City</label>
                      <input
                        className={`ob-input ${errors.city ? "err" : ""}`}
                        {...register("city")}
                        placeholder="Paris"
                      />
                      {errors.city && <span className="ob-error">{errors.city.message}</span>}
                    </div>
                  </>
                )}

                {/* STEP 4: Practice */}
                {currentStep === 4 && (
                  <>
                    <div className="ob-field">
                      <label className="ob-label">Care Types Offered</label>
                      <input
                        className={`ob-input ${errors.careTypes ? "err" : ""}`}
                        {...register("careTypes")}
                        placeholder="Consultation générale, Urgences, Chirurgie, Vaccination"
                      />
                      {errors.careTypes
                        ? <span className="ob-error">{errors.careTypes.message as string}</span>
                        : <span className="ob-hint">Separate each type with a comma.</span>}
                    </div>

                    <div className="ob-field">
                      <label className="ob-label">Payment Methods</label>
                      <input
                        className={`ob-input ${errors.paymentMethods ? "err" : ""}`}
                        {...register("paymentMethods")}
                        placeholder="Espèces, Visa, Mastercard, Virement"
                      />
                      {errors.paymentMethods
                        ? <span className="ob-error">{errors.paymentMethods.message as string}</span>
                        : <span className="ob-hint">Separate each method with a comma.</span>}
                    </div>
                  </>
                )}

              </div>

              <div className="ob-footer">
                <span className="ob-step-count">Step {currentStep} of {STEPS.length}</span>
                <div className="ob-btns">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="ob-btn-ghost"
                      onClick={() => setCurrentStep((s) => s - 1)}
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                  )}
                  {currentStep < STEPS.length ? (
                    <button type="button" className="ob-btn-primary" onClick={nextStep}>
                      Next <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button type="submit" className="ob-btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit for review"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}