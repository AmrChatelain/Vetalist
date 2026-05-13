import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vetalist — Trouvez un vétérinaire de confiance en France",
  description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Vetalist — Trouvez un vétérinaire de confiance en France",
    description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
    locale: "fr_FR",
    type: "website",
    url: "https://vetalist.fr",
    siteName: "Vetalist",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vetalist — Trouvez un vétérinaire de confiance en France",
    description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes.",
  },
  alternates: {
    canonical: "https://vetalist.fr",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
         <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}