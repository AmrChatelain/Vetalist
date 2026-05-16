import type { Metadata } from "next"
import { Navbar }     from "@/components/landing/Navbar"
import { Hero }       from "@/components/landing/Hero"
import { Features }   from "@/components/landing/features/Features"
import { HowItWorks } from "@/components/landing/how-it-works/HowItWorks"
import { JoinAsVet }  from "@/components/landing/join-as-vet/JoinAsVet"
import { Footer }     from "@/components/landing/footer/Footer"

export const metadata: Metadata = {
  title:       "Vetalist — Trouvez un vétérinaire de confiance en France",
  description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
  alternates:  { canonical: "https://vetalist.fr" },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f0]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <JoinAsVet />
      <Footer />
    </main>
  )
}