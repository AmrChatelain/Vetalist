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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STEPS = [
  { id: 1, title: "Professional Profile" },
  { id: 2, title: "Clinic Details" },
  { id: 3, title: "Practice Settings" },
];

export default function ProfileEditor() {
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
      bio: "",
      specialties: [],
      languagesSpoken: [],
      clinicName: "",
      clinicPhone: "",
      city: "",
      street: "",
      zipCode: "",
      careTypes: [],
      paymentMethods: [],
    },
  });

  const nextStep = async () => {
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
    
    // Convert comma-separated strings from inputs into arrays for the Zod schema/Server Action
    const processedData: OnboardingInput = {
      ...data,
      specialties: typeof data.specialties === 'string' ? (data.specialties as any).split(",").map((s: string) => s.trim()).filter(Boolean) : data.specialties,
      languagesSpoken: typeof data.languagesSpoken === 'string' ? (data.languagesSpoken as any).split(",").map((s: string) => s.trim()).filter(Boolean) : data.languagesSpoken,
      careTypes: typeof data.careTypes === 'string' ? (data.careTypes as any).split(",").map((s: string) => s.trim()).filter(Boolean) : data.careTypes,
      paymentMethods: typeof data.paymentMethods === 'string' ? (data.paymentMethods as any).split(",").map((s: string) => s.trim()).filter(Boolean) : data.paymentMethods,
    };

    const result = await updateVetOnboarding(processedData);
    setIsSubmitting(false);

    if (result.success) {
      alert("Profile updated successfully!");
      router.refresh();
      router.push("/dashboard/vet");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">Update your professional and clinic information.</p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
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
                  <Textarea 
                    id="bio" 
                    {...register("bio")} 
                    placeholder="Describe your expertise and approach..." 
                    className="min-h-[120px]"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" {...register("street")} placeholder="123 Rue de Rivoli" />
                    {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...register("zipCode")} placeholder="75011" />
                    {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} placeholder="Paris" />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: PRACTICE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="careTypes">Care Types Offered (comma separated)</Label>
                  <Input id="careTypes" {...register("careTypes")} placeholder="General, Urgent, Surgery" />
                  {errors.careTypes && <p className="text-xs text-destructive">{errors.careTypes.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethods">Payment Methods (comma separated)</Label>
                  <Input id="paymentMethods" {...register("paymentMethods")} placeholder="Cash, Visa, Check" />
                  {errors.paymentMethods && <p className="text-xs text-destructive">{errors.paymentMethods.message}</p>}
                </div>
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : <div />}
            
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save All Changes"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
