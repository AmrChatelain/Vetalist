import { z } from "zod"

const stringArray = z
  .array(z.string().min(1))
  .min(1, "Veuillez sélectionner au moins une option")

// French (+33/0X) and international phone formats
const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$|^\+[1-9]\d{7,14}$/

export const onboardingSchema = z.object({
  bio:               z.string().min(20, "La biographie doit contenir au moins 20 caractères"),
  specialties:       stringArray,
  languagesSpoken:   stringArray,
  licenseNumber:     z.string().min(4, "Le numéro de licence est requis"),
  clinicName:        z.string().min(2, "Le nom de la clinique est requis"),
  clinicPhone:       z
    .string()
    .min(1, "Le téléphone est requis")
    .refine(
      (val) => phoneRegex.test(val.replace(/\s/g, "")),
      "Numéro invalide. Exemple : +33 1 23 45 67 89 ou 01 23 45 67 89"
    ),
  city:              z.string().min(2, "La ville est requise"),
  street:            z.string().min(5, "L'adresse est requise"),
  zipCode:           z.string().min(3, "Le code postal est requis"),
  addressComplement: z.string().max(100).optional(), // étage, bâtiment, code porte...
  careTypes:         stringArray,
  paymentMethods:    stringArray,
})

export type OnboardingInput = z.infer<typeof onboardingSchema>