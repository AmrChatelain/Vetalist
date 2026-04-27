"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, ShieldCheck } from "lucide-react";

const AVATAR_IDS = [
  {
    id: 12,
    src: "https://res.cloudinary.com/dhvha4h1o/image/upload/v1777289839/1670776925850_i0nhgt.jpg",
  },
  {
    id: 10,
    src: "https://res.cloudinary.com/dhvha4h1o/image/upload/v1777289510/2026_04_19_21_57_IMG_7620_xaaxmn.jpg",
  },
  { id: 11, src: null },
];

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export function Hero({
  title = "Expert care for your best friend, right in France.",
  subtitle = "Book trusted veterinarians in seconds. No waiting, no stress — just happy pets and healthy lives.",
}: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#fdf6f0]">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-[#fcd34d]/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-[#c4b5fd]/20 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-[#fda4af]/15 rounded-full blur-[80px] animate-float" />
        <span
          className="absolute top-[15%] left-[10%] text-6xl opacity-[0.04] select-none"
          aria-hidden="true"
        >
          🐾
        </span>
        <span
          className="absolute bottom-[20%] right-[15%] text-8xl opacity-[0.04] select-none"
          aria-hidden="true"
        >
          🐾
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text & CTA */}
          <div className="flex flex-col space-y-8 text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-amber-100 w-fit mx-auto lg:mx-0 shadow-sm">
              <div className="flex -space-x-2" aria-hidden="true">
                {AVATAR_IDS.map(({ id, src }) => (
                  <div
                    key={id}
                    className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative"
                  >
                    <Image
                      src={src ?? `https://i.pravatar.cc/150?u=${id}`}
                      alt="Pet owner"
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Trusted by Pet Owners
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-[#1e1a2e] leading-[1.1] tracking-tight">
              {title}
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-['DM_Sans'] font-light">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base bg-linear-to-r from-[#a78bfa] to-[#c4b5fd] hover:opacity-90 shadow-xl shadow-[#a78bfa]/25 transition-all group rounded-full font-semibold"
              >
                <Link href="/search">
                  Find a Vet
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto h-14 px-8 text-base border-slate-200 bg-white/60 hover:bg-white transition-all rounded-full font-semibold text-slate-700"
              >
                <Link href="/register">Join as a Vet</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-2">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">Verified Vets</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-sm font-medium">4.9 / 5 avg. rating</span>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="relative z-10 w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src="https://res.cloudinary.com/dhvha4h1o/image/upload/v1777314100/Vetalist-hero_ykocvc.png"
                alt="Veterinarian caring for a pet"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 0px, 50vw"
              />
              {/* Subtle overlay for text legibility on card */}
              <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-8 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/80 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Instant Booking
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Available 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div
              className="absolute -top-10 -right-10 w-64 h-64 bg-[#fda4af]/20 rounded-full blur-3xl -z-10"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -40px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-20px, 30px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
