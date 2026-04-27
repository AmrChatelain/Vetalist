"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PawPrint, Menu, X, Search } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileMenuOpen(false);
      }
    },
    [searchQuery, router],
  );

  const navLinks = [
    { href: "/search", label: "Find a Veterinarian" },
    { href: "#how-it-works", label: "How it works" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "py-3 bg-white/90 backdrop-blur-lg border-b border-slate-200/50 shadow-sm"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-rose-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <PawPrint className="text-white w-5 h-5" />
            </div>
            <span className="font-['Playfair_Display'] text-2xl font-semibold text-[#1e1a2e] hidden sm:block">
              Veta<span className="text-[#a78bfa]">list</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto relative group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a78bfa] transition-colors pointer-events-none"
            />
            <input
              type="text"
              placeholder="Specialty, city, or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              aria-label="Search for veterinarians"
              className="w-full pl-11 pr-16 py-2.5 bg-white/60 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/30 focus:border-[#a78bfa] transition-all shadow-inner placeholder:text-slate-400"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
              Enter
            </kbd>
          </div>

          {/* Desktop Nav & Auth */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-6 mr-2 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-[#a78bfa] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Button variant="ghost" asChild className="text-slate-600 hover:text-[#a78bfa] font-medium">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white hover:opacity-90 shadow-md transition-all font-medium px-6 rounded-full"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl">
          <div className="flex flex-col p-6 gap-5 max-w-7xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Search specialty, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                aria-label="Search for veterinarians"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/20 focus:border-[#a78bfa] transition-all"
              />
            </div>
            <div className="h-px bg-slate-100 w-full" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-slate-600 hover:text-[#a78bfa] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full justify-center border-slate-200 text-slate-600">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              </Button>
              <Button asChild className="w-full justify-center bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white rounded-full">
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}