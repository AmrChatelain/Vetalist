"use client";

import React from "react";
import Link from "next/link";
import { Search, CalendarCheck, BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Rechercher & Découvrir",
    description: "Trouvez des vétérinaires spécialisés près de chez vous par spécialité, ville ou code postal — instantanément.",
    Icon: Search,
  },
  {
    number: "02",
    title: "Choisir & Réserver",
    description: "Parcourez les profils vérifiés, lisez de vrais avis et réservez un rendez-vous en quelques clics.",
    Icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Recevoir des rappels",
    description: "Recevez des rappels intelligents par e-mail et SMS pour ne jamais manquer un rendez-vous important.",
    Icon: BellRing,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-[#fdf6f0] relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#a78bfa]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-[#fda4af]/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-bold text-[#a78bfa] uppercase tracking-[0.2em] mb-4">
            Simple & Intuitif
          </p>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#1e1a2e] leading-tight tracking-tight">
            Trois étapes pour un animal heureux et en bonne santé.
          </h2>
          <div className="mt-6 w-16 h-1 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] mx-auto rounded-full" />
        </div>

        {/* Steps */}
        <div className="relative">
          <div
            className="hidden lg:block absolute top-10 h-[2px] bg-gradient-to-r from-[#a78bfa]/20 via-[#a78bfa]/40 to-[#a78bfa]/20 z-0"
            style={{ left: "calc(16.666% + 2.5rem)", right: "calc(16.666% + 2.5rem)" }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center group">

                {/* Icon circle */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-white border-2 border-slate-100 shadow-lg flex items-center justify-center group-hover:border-[#a78bfa]/40 group-hover:shadow-[#a78bfa]/10 group-hover:scale-110 transition-all duration-500 relative z-10">
                    <step.Icon className="w-7 h-7 text-[#a78bfa]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1e1a2e] text-white rounded-full flex items-center justify-center text-[11px] font-bold border-[3px] border-[#fdf6f0] z-20">
                    {step.number}
                  </div>
                </div>

                {/* Text */}
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1a2e] mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm max-w-[260px] font-['DM_Sans']">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Prêt à commencer ? Moins de 2 minutes suffisent.</span>
          </div>
          <Button
            asChild
            size="lg"
            className="h-13 px-8 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white hover:opacity-90 shadow-lg shadow-[#a78bfa]/20 rounded-full font-semibold"
          >
            <Link href="/search">Trouver un vétérinaire</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}