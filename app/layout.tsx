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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://meet.krishnaconsciousnesssociety.com"),
  title: "KCS Meet - Divine Connections Beyond Boundaries",
  description: "Experience spiritual connection through technology with KCS Meet...",
  keywords: [
    "spiritual video conferencing",
    "divine connections",
    "Krishna consciousness",
    "online spiritual gatherings",
    "secure spiritual meetings",
    "virtual sangha",
    "transcendental communication",
    "spiritual technology"
  ].join(", "),
  authors: [{ name: "Mayank Sharma", url: "https://github.com/Sharmamayankkkk" }],
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
    url: "https://meet.krishnaconsciousnesssociety.com",
    title: "KCS Meet - Divine Connections Beyond Boundaries",
    description: "Connect spiritually through technology...",
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
    description: "Connect spiritually through technology...",
    images: ["/icons/KCS-Logo.png"],
    creator: "@KCSMeet",
  },
  category: "Technology",
  classification: "Video Conferencing Platform",
};

// NEW EXPORTS
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const themeColor = "#2196F3";


{/* export const metadata: Metadata = {
  title: "KCS Meet - Divine Connections Beyond Boundaries",
  description: "Experience spiritual connection through technology with KCS Meet - a video calling platform inspired by Krishna's universal vision. Connect with fellow seekers, share wisdom, and transcend boundaries.",
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
    url: "https://meet.krishnaconsciousnesssociety.com",
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
}; */}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-9082594150892887" />
      </head>
      <body className="bg-white dark:bg-gray-900 font-sans">
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
          <Toaster />
          {children}
          <SpeedInsights />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
