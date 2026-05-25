import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/features/Features";
import { HowItWorks } from "@/components/landing/how-it-works/HowItWorks";
import { JoinAsVet } from "@/components/landing/join-as-vet/JoinAsVet";
import { Footer } from "@/components/landing/footer/Footer";

export const metadata: Metadata = {
  title: "Vetalist — Trouvez un vétérinaire de confiance en France",
  description:
    "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
  alternates: { canonical: "https://vetalist.fr" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vetalist.fr/#organization",
      name: "Vetalist",
      url: "https://vetalist.fr",
      logo: {
        "@type": "ImageObject",
        url: "https://vetalist.fr/Vitalist-logo.png",
        width: 512,
        height: 512,
      },
      description:
        "Plateforme française de prise de rendez-vous vétérinaires en ligne. Trouvez un vétérinaire disponible près de chez vous et réservez en quelques secondes.",
      areaServed: "FR",
      inLanguage: "fr-FR",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://vetalist.fr/#website",
      url: "https://vetalist.fr",
      name: "Vetalist",
      publisher: { "@id": "https://vetalist.fr/#organization" },
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://vetalist.fr/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <JoinAsVet />
      <Footer />
    </main>
  );
}
