import { z } from "zod"

const commaStringToArray = z
  .union([
    z.array(z.string().min(1)),
    z.string().min(1, "This field is required"),
  ])
  .transform((val) => {
    if (Array.isArray(val)) return val
    return val.split(",").map((s) => s.trim()).filter(Boolean)
  })
  .pipe(z.array(z.string().min(1)).min(1, "At least one value required"))

export const onboardingSchema = z.object({
  bio:             z.string().min(20, "Bio must be at least 20 characters"),
  specialties:     commaStringToArray,
  languagesSpoken: commaStringToArray,
  licenseNumber:   z.string().min(4, "License number is required"),
  clinicName:      z.string().min(2, "Clinic name is required"),
  clinicPhone:     z.string().min(6, "Valid phone number required"),
  city:            z.string().min(2, "City is required"),
  street:          z.string().min(5, "Street address is required"),
  zipCode:         z.string().min(3, "Zip code is required"),
  careTypes:       commaStringToArray,
  paymentMethods:  commaStringToArray,
})

export type OnboardingInput = z.infer<typeof onboardingSchema>