import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KCS Meet - Divine Connections Beyond Boundaries",
  description: "Experience spiritual connection through technology with KCS Meet - a video calling platform inspired by Krishna's universal vision. Connect with fellow seekers, share wisdom, and transcend physical distances through secure, real-time meetings.",
  keywords: [
    "spiritual video conferencing",
    "divine connections",
    "Krishna consciousness",
    "online spiritual gatherings",
    "secure spiritual meetings",
    "virtual sangha",
    "transcendental communication",
    "spiritual technology",
  ].join(", "),
  authors: [
    {
      name: "Mayank Sharma",
      url: "https://github.com/Sharmamayankkkk",
    },
  ],
  creator: "KCS Meet Team",
  publisher: "KCS Meet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icons/KCS-Logo.png",
    apple: "/icons/KCS-Logo.png",
    shortcut: "/icons/KCS-Logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kcs-app.vercel.app/",
    title: "KCS Meet - Divine Connections Beyond Boundaries",
    description: "Connect spiritually through technology with KCS Meet - inspired by Krishna's universal vision",
    siteName: "KCS Meet",
    images: [
      {
        url: "/icons/KCS-Logo.png",
        width: 250,
        height: 250,
        alt: "KCS Meet Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KCS Meet - Divine Connections Beyond Boundaries",
    description: "Connect spiritually through technology with KCS Meet - inspired by Krishna's universal vision",
    images: ["/icons/KCS-Logo.png"],
    creator: "@KCSMeet",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  category: "Technology",
  classification: "Video Conferencing Platform",
  themeColor: "#2196F3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const keywordsString = Array.isArray(metadata.keywords) 
    ? metadata.keywords.join(", ")
    : metadata.keywords || "Default keywords";

  // Convert metadata values to strings for meta tags
  const ogTitle = String(metadata.openGraph?.title || "");
  const ogDescription = String(metadata.openGraph?.description || "");
  const ogUrl = String(metadata.openGraph?.url || "");
  const ogType = String(metadata.openGraph?.type || "");
  const twitterCard = String(metadata.twitter?.card || "");
  const twitterTitle = String(metadata.twitter?.title || "");
  const twitterDescription = String(metadata.twitter?.description || "");

  return (
    <html lang="en">
      <Head>
        <meta
          name="description"
          content={String(metadata.description || "Default description")}
        />
        <meta
          name="keywords"
          content={keywordsString}
        />
        <meta property="og:title" content={ogTitle} />
        <meta
          property="og:description"
          content={ogDescription}
        />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content={ogType} />
        <meta
          property="og:image"
          content="https://kcs-app.vercel.app/icons/KCS-Logo.png"
        />
        <meta property="og:image:width" content="250" />
        <meta property="og:image:height" content="250" />
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={twitterTitle} />
        <meta
          name="twitter:description"
          content={twitterDescription}
        />
        <meta
          name="twitter:image"
          content="https://kcs-app.vercel.app/icons/KCS-Logo.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/KCS-Logo.png" />
        <link rel="apple-touch-icon" href="/icons/KCS-Logo.png" />
      </Head>
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            logoImageUrl: "/icons/KCS-Logo.png",
          },
          variables: {
            colorText: "#1A1C23",
            colorPrimary: "#2196F3",
            colorBackground: "#E8EAF2",
            colorInputBackground: "#D8DCE9",
            colorInputText: "#1A1C23",
          },
        }}
      >
        <body className={`${inter.className} bg-light`}>
          <Toaster />
          {children}
        </body>
      </ClerkProvider>
      <SpeedInsights />
      <Analytics />
    </html>
  );
}
