import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/CookieBanner"

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
  title: {
    default:  "Vetalist — Trouvez un vétérinaire de confiance en France",
    template: "%s | Vetalist",
  },
  description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
  keywords: ["vétérinaire", "rendez-vous vétérinaire", "consultation animaux", "vétérinaire France", "booking vétérinaire"],
  authors: [{ name: "Vetalist" }],
  creator: "Vetalist",
  metadataBase: new URL("https://vetalist.fr"),
  icons: {
    icon:  "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", url: "/Vetalist-logo.png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title:       "Vetalist — Trouvez un vétérinaire de confiance en France",
    description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes. Sans attente, sans stress — juste des animaux heureux et en bonne santé.",
    locale:      "fr_FR",
    type:        "website",
    url:         "https://vetalist.fr",
    siteName:    "Vetalist",
    images: [{
      url:    "/Vetalist-logo.png",
      width:  1200,
      height: 630,
      alt:    "Vetalist — Plateforme de rendez-vous vétérinaires",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Vetalist — Trouvez un vétérinaire de confiance en France",
    description: "Prenez rendez-vous avec un vétérinaire de confiance en quelques secondes.",
    images:      ["/Vetalist-logo.png"],
  },
  alternates: {
    canonical: "https://vetalist.fr",
  },
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
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
         <CookieBanner />
      </body>
    </html>
  );
}