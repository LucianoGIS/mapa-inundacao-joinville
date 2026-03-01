import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mapa-inundacao-joinville.vercel.app"),
  title: {
    default: "Joinville GeoInunda | Mapa de Risco de Inundações",
    template: "%s | Joinville GeoInunda",
  },
  description: "Mapa interativo de suscetibilidade a inundações em Joinville, Santa Catarina. Consulte riscos de alagamentos, enchentes e cotas de enchente por rua.",
  keywords: [
    "Joinville",
    "enchente",
    "alagamento",
    "inundação",
    "mapa de risco",
    "defesa civil",
    "cota de enchente",
    "chuva",
    "Santa Catarina",
    "previsão de enchente",
    "bacia hidrográfica",
    "suscetibilidade"
  ],
  authors: [{ name: "GeoInunda" }],
  creator: "GeoInunda",
  publisher: "GeoInunda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Joinville GeoInunda - Consulta de Risco de Inundações",
    description: "Consulte o mapa interativo de suscetibilidade a inundações para a cidade de Joinville (SC). Veja os riscos de alagamento da sua rua e região.",
    url: "/",
    siteName: "Joinville GeoInunda",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Logo do GeoInunda Joinville",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joinville GeoInunda - Risco de Inundações",
    description: "Consulte o mapa interativo de suscetibilidade a inundações para a cidade de Joinville (SC).",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
