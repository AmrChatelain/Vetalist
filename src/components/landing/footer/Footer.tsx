"use client";

import React from "react";
import Link from "next/link";
import { PawPrint, Mail } from "lucide-react";

const footerLinks = {
  petOwners: [
    { label: "Find a Veterinarian", href: "/search" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pet Health Tips", href: "#" },
    { label: "Help Center", href: "#" },
  ],
  professionals: [
    { label: "Join as a Veterinarian", href: "/register" },
    { label: "Partner Program", href: "#" },
    { label: "Manage Schedule", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};



export function Footer() {
  return (
    <footer className="bg-[#1e1a2e] text-slate-400 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-rose-400 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <PawPrint className="text-white w-4 h-4" />
              </div>
              <span className="font-['Playfair_Display'] text-xl font-semibold text-white">
                Veta<span className="text-[#a78bfa]">list</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Connecting pet owners with trusted veterinarians across France — faster, simpler, and stress-free.
            </p>
            <a
              href="mailto:contact@vetalist.com"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#a78bfa] transition-colors"
            >
              <Mail size={16} />
              <span>contact@vetalist.com</span>
            </a>
          </div>

          {/* For Pet Owners */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              For Pet Owners
            </h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.petOwners.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#a78bfa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              For Professionals
            </h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.professionals.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#a78bfa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              Legal & Info
            </h4>
            <ul className="space-y-3.5 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#a78bfa] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}

            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-600">
          <p>© {new Date().getFullYear()} Vetalist. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered by</span>
            <Link
              href="https://achatelain.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 font-semibold hover:text-[#a78bfa] transition-colors underline decoration-[#a78bfa]/30 underline-offset-4 ml-1"
            >
              Amr Chatelain
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}