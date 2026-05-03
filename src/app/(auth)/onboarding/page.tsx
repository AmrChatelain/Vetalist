"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { updateVetOnboarding } from "@/actions/onboarding.actions";
import { CheckCircle2, ArrowRight, ArrowLeft, Stethoscope } from "lucide-react";

const STEPS = [
  { id: 1, title: "Professional Profile", desc: "Your background & expertise"       },
  { id: 2, title: "Clinic Details",       desc: "Location & contact info"           },
  { id: 3, title: "Practice Settings",    desc: "Services & payment options"        },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      specialties:     [] as any,
      languagesSpoken: [] as any,
      careTypes:       [] as any,
      paymentMethods:  [] as any,
      bio: "",
    },
  });

  const nextStep = async () => {
    const fieldsMap: Record<number, (keyof OnboardingInput)[]> = {
      1: ["bio", "specialties", "languagesSpoken"],
      2: ["clinicName", "clinicPhone", "city", "street", "zipCode"],
      3: ["careTypes", "paymentMethods"],
    };
    const isValid = await trigger(fieldsMap[currentStep] as any);
    if (isValid) setCurrentStep((s) => s + 1);
  };

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true);

    const parse = (v: any) =>
      typeof v === "string"
        ? v.split(",").map((s: string) => s.trim()).filter(Boolean)
        : v;

    const processed: OnboardingInput = {
      ...data,
      specialties:     parse(data.specialties),
      languagesSpoken: parse(data.languagesSpoken),
      careTypes:       parse(data.careTypes),
      paymentMethods:  parse(data.paymentMethods),
    };

    const result = await updateVetOnboarding(processed);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/dashboard/vet");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100vh;
          background: #f0f4f8;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .ob-inner {
          width: 100%;
          max-width: 620px;
        }

        /* Header */
        .ob-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .ob-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.25rem;
          text-decoration: none;
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
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ob-logo-name span { color: #3b82f6; }

        .ob-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .ob-subtitle {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Step indicator */
        .ob-steps {
          display: flex;
          align-items: center;
          margin-bottom: 1.75rem;
        }

        .ob-step {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .ob-step:last-child { flex: 0; }

        .step-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700;
          flex-shrink: 0;
          border: 2px solid #e2e8f0;
          background: white;
          color: #94a3b8;
          transition: all 0.3s;
          font-family: 'Sora', sans-serif;
        }

        .step-dot.done    { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
        .step-dot.current { background: #1d4ed8; border-color: #1d4ed8; color: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }

        .step-info { }
        .step-name { font-size: 0.72rem; font-weight: 600; color: #94a3b8; line-height: 1.2; }
        .step-name.active { color: #1e293b; }
        .step-desc { font-size: 0.65rem; color: #cbd5e1; }

        .step-line {
          flex: 1;
          height: 2px;
          background: #e2e8f0;
          margin: 0 10px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        .step-line.done { background: #3b82f6; }

        /* Card */
        .ob-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .ob-card-head {
          padding: 22px 28px 18px;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(to right, #fafafa, white);
        }

        .ob-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .ob-card-desc {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 3px;
        }

        .ob-card-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Fields */
        .ob-field { display: flex; flex-direction: column; gap: 5px; }

        .ob-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .ob-input, .ob-textarea {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #1e293b;
          font-family: 'DM Sans', sans-serif;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          width: 100%;
        }

        .ob-input:focus, .ob-textarea:focus {
          border-color: #93c5fd;
          background: white;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.2);
        }

        .ob-input.err, .ob-textarea.err { border-color: #fca5a5; }
        .ob-textarea { min-height: 110px; resize: vertical; }
        .ob-hint { font-size: 0.68rem; color: #94a3b8; }
        .ob-error { font-size: 0.7rem; color: #dc2626; }

        .ob-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ob-grid-32 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }

        /* Footer */
        .ob-footer {
          padding: 16px 28px;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ob-step-count {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .ob-footer-btns { display: flex; gap: 8px; }

        .ob-btn-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 16px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: 1px solid #e2e8f0;
          background: white; color: #64748b;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .ob-btn-ghost:hover { background: #f8fafc; color: #1e293b; }

        .ob-btn-primary {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 20px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: none;
          background: #1d4ed8; color: white;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }

        .ob-btn-primary:hover:not(:disabled) { background: #1e40af; }
        .ob-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Progress bar */
        .ob-progress {
          height: 3px;
          background: #f1f5f9;
          border-radius: 0;
          margin-bottom: 0;
        }

        .ob-progress-bar {
          height: 100%;
          background: linear-gradient(to right, #3b82f6, #6366f1);
          border-radius: 0;
          transition: width 0.4s ease;
        }
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
            <p className="ob-subtitle">Help clients find and trust you by completing your professional details.</p>
          </div>

          {/* Step indicator */}
          <div className="ob-steps">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="ob-step">
                  <div className={`step-dot ${currentStep > step.id ? "done" : currentStep === step.id ? "current" : ""}`}>
                    {currentStep > step.id ? <CheckCircle2 size={14} /> : step.id}
                  </div>
                  <div className="step-info">
                    <div className={`step-name ${currentStep >= step.id ? "active" : ""}`}>{step.title}</div>
                    <div className="step-desc">{step.desc}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-line ${currentStep > step.id ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div className="ob-card">
            {/* Progress bar */}
            <div className="ob-progress">
              <div
                className="ob-progress-bar"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="ob-card-head">
                <div className="ob-card-title">{STEPS[currentStep - 1].title}</div>
                <div className="ob-card-desc">
                  {currentStep === 1 && "Tell us about your professional background and expertise."}
                  {currentStep === 2 && "Provide your clinic's address and contact details."}
                  {currentStep === 3 && "Configure the services you offer and how you accept payment."}
                </div>
              </div>

              <div className="ob-card-body">

                {/* STEP 1 */}
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
                        : <span className="ob-hint">Minimum 20 characters. Clients will read this on your public profile.</span>}
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

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-label">Clinic Name</label>
                        <input
                          className={`ob-input ${errors.clinicName ? "err" : ""}`}
                          {...register("clinicName")}
                          placeholder="Lilas Veterinary Clinic"
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

                    <div className="ob-grid-32">
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

                    <div className="ob-field" style={{ maxWidth: 280 }}>
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

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <>
                    <div className="ob-field">
                      <label className="ob-label">Care Types Offered</label>
                      <input
                        className={`ob-input ${errors.careTypes ? "err" : ""}`}
                        {...register("careTypes")}
                        placeholder="General consultation, Urgent care, Surgery, Vaccination"
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
                        placeholder="Cash, Visa, Mastercard, Bank transfer"
                      />
                      {errors.paymentMethods
                        ? <span className="ob-error">{errors.paymentMethods.message as string}</span>
                        : <span className="ob-hint">Separate each method with a comma.</span>}
                    </div>
                  </>
                )}

              </div>

              {/* Footer */}
              <div className="ob-footer">
                <span className="ob-step-count">Step {currentStep} of {STEPS.length}</span>
                <div className="ob-footer-btns">
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
                      {isSubmitting ? "Submitting..." : "Complete onboarding"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}