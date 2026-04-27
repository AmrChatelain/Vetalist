import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/features/Features";
import { HowItWorks } from "@/components/landing/how-it-works/HowItWorks";
import { JoinAsVet } from "@/components/landing/join-as-vet/JoinAsVet";
import { Footer } from "@/components/landing/footer/Footer";

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
  );
}
