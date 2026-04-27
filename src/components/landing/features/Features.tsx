"use client";

import React from "react";
import { ShieldCheck, CalendarCheck, BellRing, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  Icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
}

const features: Feature[] = [
  {
    title: "Verified Professionals",
    description: "Every veterinarian on our platform undergoes rigorous credential verification so you can book with complete confidence.",
    Icon: ShieldCheck,
    colorClass: "bg-emerald-50 border-emerald-100",
    iconColorClass: "text-emerald-600",
  },
  {
    title: "Instant Booking",
    description: "Skip the phone calls and long wait times. Book an appointment with your preferred vet in just a few taps.",
    Icon: CalendarCheck,
    colorClass: "bg-amber-50 border-amber-100",
    iconColorClass: "text-amber-600",
  },
  {
    title: "Smart Reminders",
    description: "Never miss an important check-up. Receive automated reminders via email and SMS before every appointment.",
    Icon: BellRing,
    colorClass: "bg-blue-50 border-blue-100",
    iconColorClass: "text-blue-600",
  },
  {
    title: "Trusted Profiles",
    description: "Browse detailed specialties, experience, and real verified reviews from other pet owners in your community.",
    Icon: UserCheck,
    colorClass: "bg-violet-50 border-violet-100",
    iconColorClass: "text-violet-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 bg-[#fdf6f0] relative overflow-hidden">

      {/* Background decoration — fixed opacity */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#a78bfa]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#fda4af]/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header — fixed semantic hierarchy */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-bold text-[#a78bfa] uppercase tracking-[0.2em] mb-4">
            Why Vetalist?
          </p>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#1e1a2e] leading-tight tracking-tight">
            Everything your pet deserves, all in one place.
          </h2>
          <div className="mt-6 w-16 h-1 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] mx-auto rounded-full" />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group p-8 rounded-3xl bg-white border ${feature.colorClass} shadow-sm hover:shadow-lg hover:shadow-[#a78bfa]/5 transition-all duration-300 flex flex-col items-start text-left`}
            >
              <div className={`p-3.5 rounded-2xl border ${feature.colorClass} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.Icon className={`w-6 h-6 ${feature.iconColorClass}`} />
              </div>
              <h3 className="text-lg font-bold text-[#1e1a2e] mb-3 leading-snug">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-['DM_Sans']">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}