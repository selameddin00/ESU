import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ESUcodes — Yazılım Evrenini Keşfet",
    template: "%s | ESUcodes",
  },
  description:
    "Yazılım öğrencilerinin kurduğu Türkçe açık bilgi ve proje platformu. Siber güvenlik, yapay zeka, frontend ve gömülü sistemler hakkında blog yazıları, projeler ve topluluk.",
  keywords: [
    "yazılım", "programming", "türkçe yazılım blogu", "siber güvenlik", "yapay zeka",
    "frontend", "embedded systems", "öğrenci topluluğu", "ESU", "esucodes",
  ],
  authors: [{ name: "ESUcodes", url: BASE_URL }],
  creator: "ESUcodes",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "ESUcodes",
    title: "ESUcodes — Yazılım Evrenini Keşfet",
    description: "Yazılım öğrencilerinin kurduğu Türkçe açık bilgi ve proje platformu.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ESUcodes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESUcodes — Yazılım Evrenini Keşfet",
    description: "Yazılım öğrencilerinin kurduğu Türkçe açık bilgi ve proje platformu.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ESUcodes",
  url: BASE_URL,
  description: "Yazılım öğrencilerinin kurduğu Türkçe açık bilgi ve proje platformu.",
  inLanguage: "tr",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/blog?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="application/rss+xml" title="ESUcodes Blog" href="/feed.xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
