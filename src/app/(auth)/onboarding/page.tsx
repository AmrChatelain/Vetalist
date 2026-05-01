"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { onboardingSchema, type OnboardingInput } from "@/actions/onboarding.actions";
import { updateVetOnboarding } from "@/actions/onboarding.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Constants for the wizard
const STEPS = [
  { id: 1, title: "Professional Profile" },
  { id: 2, title: "Clinic Details" },
  { id: 3, title: "Practice Settings" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We use one large form for the whole wizard to make final submission easy
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      specialties: [],
      languagesSpoken: [],
      careTypes: [],
      paymentMethods: [],
      bio: "",
    },
  });

  const nextStep = async () => {
    // Validate only the fields relevant to the current step before moving forward
    let fieldsToValidate: (keyof OnboardingInput)[] = [];
    if (currentStep === 1) fieldsToValidate = ["bio", "specialties", "languagesSpoken"];
    if (currentStep === 2) fieldsToValidate = ["clinicName", "clinicPhone", "city", "street", "zipCode"];
    if (currentStep === 3) fieldsToValidate = ["careTypes", "paymentMethods"];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert("Please fill in all required fields correctly.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true);
    const result = await updateVetOnboarding(data);
    setIsSubmitting(false);

    if (result.success) {
      alert("Onboarding submitted! Your profile is now awaiting approval.");
      router.push("/dashboard/vet");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
        <p className="text-muted-foreground">Help clients find you by providing your professional details.</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 flex justify-between items-center px-4">
        {STEPS.map((step) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= step.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <span className={`text-xs ${currentStep >= step.id ? "font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
            {step.id !== STEPS.length && (
              <div 
                className={`h-[2px] flex-1 mx-4 transition-colors ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`} 
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your professional background."}
              {currentStep === 2 && "Provide your clinic's location and contact information."}
              {currentStep === 3 && "Configure how you practice and accept payments."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* STEP 1: PROFESSIONAL */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <textarea
                    id="bio"
                    {...register("bio")}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your expertise and approach..."
                  />
                  {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties (comma separated)</Label>
                  <Input id="specialties" {...register("specialties")} placeholder="Surgery, Dental, Behavior" />
                  {errors.specialties && <p className="text-xs text-destructive">{errors.specialties.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languagesSpoken">Languages Spoken (comma separated)</Label>
                  <Input id="languagesSpoken" {...register("languagesSpoken")} placeholder="English, French" />
                  {errors.languagesSpoken && <p className="text-xs text-destructive">{errors.languagesSpoken.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 2: CLINIC */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input id="clinicName" {...register("clinicName")} placeholder="Lilas Veterinary Clinic" />
                  {errors.clinicName && <p className="text-xs text-destructive">{errors.clinicName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Clinic Phone</Label>
                  <Input id="clinicPhone" {...register("clinicPhone")} placeholder="+33 1 23 45 67 89" />
                  {errors.clinicPhone && <p className="text-xs text-destructive">{errors.clinicPhone.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} placeholder="Paris" />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...register("zipCode")} placeholder="75011" />
                    {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" {...register("street")} placeholder="123 Rue de Rivoli" />
                  {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: PRACTICE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Care Types Offered (comma separated)</Label>
                  <Input {...register("careTypes")} placeholder="General, Urgent, Surgery" />
                  {errors.careTypes && <p className="text-xs text-destructive">{errors.careTypes.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Payment Methods (comma separated)</label>
                  <Input {...register("paymentMethods")} placeholder="Cash, Visa, Check" />
                  {errors.paymentMethods && <p className="text-xs text-destructive">{errors.paymentMethods.message}</p>}
                </div>
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Onboarding"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
