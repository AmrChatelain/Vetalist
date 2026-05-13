// Predefined list of veterinary specialties in French
// Used in onboarding and profile editor — prevents free-text inconsistency

export const VETERINARY_SPECIALTIES = [
  // General
  "Médecine générale",
  "Médecine préventive",
  "Vaccination",
  "Consultations de routine",

  // Surgery
  "Chirurgie générale",
  "Chirurgie orthopédique",
  "Chirurgie des tissus mous",
  "Chirurgie dentaire",

  // Internal medicine
  "Médecine interne",
  "Cardiologie",
  "Dermatologie",
  "Gastro-entérologie",
  "Neurologie",
  "Oncologie",
  "Ophtalmologie",
  "Pneumologie",
  "Endocrinologie",
  "Urologie / Néphrologie",

  // Reproduction
  "Reproduction / Obstétrique",
  "Néonatologie",

  // Emergency
  "Urgences et soins intensifs",
  "Médecine d'urgence",

  // Species
  "Animaux de compagnie (chiens & chats)",
  "Nouveaux animaux de compagnie (NAC)",
  "Oiseaux / Aviaire",
  "Reptiles",
  "Lapins & rongeurs",
  "Chevaux / Équine",
  "Bovins / Ruminants",
  "Animaux de ferme",
  "Animaux exotiques",
  "Animaux marins",

  // Other
  "Acupuncture vétérinaire",
  "Homéopathie vétérinaire",
  "Physiothérapie / Rééducation",
  "Comportement animal",
  "Nutrition vétérinaire",
  "Radiologie / Imagerie",
  "Anesthésiologie",
  "Parasitologie",
] as const

export type VeterinarySpecialty = (typeof VETERINARY_SPECIALTIES)[number]

export const CARE_TYPES = [
  "Consultation générale",
  "Consultation d'urgence",
  "Vaccination",
  "Bilan de santé",
  "Chirurgie",
  "Détartrage / Soins dentaires",
  "Radiographie / Échographie",
  "Bilan sanguin",
  "Stérilisation",
  "Consultation comportementale",
  "Consultation nutritionnelle",
  "Suivi post-opératoire",
  "Euthanasie",
  "Prise en charge NAC",
  "Téléconsultation",
] as const

export const LANGUAGES = [
  "Français",
  "Anglais",
  "Arabe",
  "Espagnol",
  "Portugais",
  "Allemand",
  "Italien",
  "Chinois",
  "Russe",
  "Turc",
] as const

export const PAYMENT_METHODS = [
  "Espèces",
  "Carte bancaire (Visa / Mastercard)",
  "Chèque",
  "Virement bancaire",
  "Mutuelle animale",
  "Paiement en plusieurs fois",
] as const