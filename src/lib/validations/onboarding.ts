import { z } from "zod"

// These fields come from the MultiSelect component as arrays directly
// No more comma-string conversion needed
const stringArray = z
  .array(z.string().min(1))
  .min(1, "Veuillez sélectionner au moins une option")

export const onboardingSchema = z.object({
  bio:             z.string().min(20, "La biographie doit contenir au moins 20 caractères"),
  specialties:     stringArray,
  languagesSpoken: stringArray,
  licenseNumber:   z.string().min(4, "Le numéro de licence est requis"),
  clinicName:      z.string().min(2, "Le nom de la clinique est requis"),
  clinicPhone:     z.string().min(6, "Numéro de téléphone invalide"),
  city:            z.string().min(2, "La ville est requise"),
  street:          z.string().min(5, "L'adresse est requise"),
  zipCode:         z.string().min(3, "Le code postal est requis"),
  careTypes:       stringArray,
  paymentMethods:  stringArray,
})

export type OnboardingInput = z.infer<typeof onboardingSchema>