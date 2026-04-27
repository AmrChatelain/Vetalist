"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Calendar, Star, ArrowRight } from "lucide-react";

const benefits = [
  {
    Icon: TrendingUp,
    title: "Grow Your Client Base",
    description: "Reach thousands of pet owners actively looking for care.",
  },
  {
    Icon: Calendar,
    title: "Effortless Scheduling",
    description: "Manage your availability and bookings in one place.",
  },
  {
    Icon: Star,
    title: "Build Your Reputation",
    description: "Collect verified reviews that set you apart.",
  },
  {
    Icon: Briefcase,
    title: "Professional Verified",
    description: "Your credentials are showcased to build instant trust.",
  },
];

export function JoinAsVet() {
  return (
    <section className="py-28 bg-[#1e1a2e] relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-[#a78bfa]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[25rem] h-[25rem] bg-[#fda4af]/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left: Content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#a78bfa] text-sm font-medium">
              <Briefcase size={15} />
              <span>For Veterinary Professionals</span>
            </div>

            <div>
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                Grow your practice with{" "}
                <span className="text-[#a78bfa]">Vetalist</span>
              </h2>
              <p className="mt-5 text-lg text-slate-300 max-w-lg leading-relaxed font-['DM_Sans'] font-light">
                Join France's most trusted veterinary marketplace. Whether you're an established clinic or just starting out — we help you reach the right clients and manage your time better.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-[#a78bfa]/15 text-[#a78bfa] shrink-0">
                    <benefit.Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{benefit.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mt-0.5">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base bg-[#a78bfa] hover:bg-[#c4b5fd] text-white rounded-full shadow-xl shadow-[#a78bfa]/20 transition-all group font-semibold"
              >
                <Link href="/register">
                  Register as a Veterinarian
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-slate-500">
                Free to join · Verification takes 24–48 hours
              </p>
            </div>
          </div>

          {/* Right: Image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 aspect-square max-w-[480px] mx-auto">
              <Image
                src="https://res.cloudinary.com/dhvha4h1o/image/upload/v1777287923/vet.join-Vetalist_d8yeof.jpg"
                alt="Professional veterinarian at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1a2e]/70 via-transparent to-transparent" />
            </div>

            {/* Floating stats card — fixed overflow on small screens */}
            <div className="absolute bottom-4 right-4 lg:-bottom-6 lg:-right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-2xl max-w-[220px]">
              <p className="text-[#a78bfa] font-bold text-3xl font-['Playfair_Display']">98%</p>
              <p className="text-white text-sm font-medium leading-snug mt-1">
                Client satisfaction among our vet partners.
              </p>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#a78bfa]/5 rounded-full blur-[100px] -z-10" aria-hidden="true" />
          </div>

        </div>
      </div>
    </section>
  );
}