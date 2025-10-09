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
import { SupabaseProvider } from "@/providers/SupabaseProvider"; // ✅ Import the provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://meet.krishnaconsciousnesssociety.com"),
  title: "KCS Meet - Divine Connections Beyond Boundaries",
  description: "Experience spiritual connection through technology with KCS Meet...",
};

export const viewport = { /* ... */ };
export const themeColor = "#2196F3";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-9082594150892887" />
      </head>
      <body className={`${inter.className} bg-background`}>
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
          <SupabaseProvider>
            <Toaster />
            {children}
            <SpeedInsights />
            <Analytics />
          </SupabaseProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
