import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/app/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://price-pulse-taj.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PricePulse - Amazon Price Tracker & Smart Comparator",
    template: "%s | PricePulse",
  },
  description: "Track Amazon product prices, set alerts, and compare prices across platforms. Get notified when prices drop below your target. Free price tracking with email alerts.",
  keywords: [
    "price tracker",
    "Amazon price tracker",
    "price drop alerts",
    "product price monitoring",
    "price history",
    "deal alerts",
    "shopping assistant",
    "price comparison",
  ],
  authors: [{ name: "PricePulse Team" }],
  creator: "PricePulse",
  publisher: "PricePulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PricePulse",
    title: "PricePulse - Amazon Price Tracker & Smart Comparator",
    description: "Track Amazon product prices, set alerts, and get notified when prices drop. Free price tracking with email alerts.",
    images: [
      {
        url: `${siteUrl}/pricepulse4.png`,
        width: 1200,
        height: 630,
        alt: "PricePulse - Amazon Price Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  title: "PricePulse - Amazon Price Tracker & Smart Comparator",
    description: "Track Amazon product prices, set alerts, and get notified when prices drop. Free price tracking with email alerts.",
    images: [`${siteUrl}/pricepulse4.png`],
    creator: "@PricePulse",
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
    icon: "/favicon3.ico",
    shortcut: "/favicon3.ico",
    apple: "/favicon3.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#1E40AF" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PricePulse",
              description: "Track Amazon product prices, set alerts, and get notified when prices drop below your target.",
              url: siteUrl,
              applicationCategory: "ShoppingApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <SessionProviderWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#111827",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                padding: "1rem",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
