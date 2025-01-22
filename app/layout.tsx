import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KCS",
  description: "Video calling App",
  icons: {
    icon: "/icons/KCS.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            logoImageUrl: "/icons/KCS-Logo.png",
          },
          variables: {
            colorText: "#1A1C23", // Updated to dark text for better contrast
            colorPrimary: "#2196F3", // Bright blue as the primary color
            colorBackground: "#E8EAF2", // Light background color
            colorInputBackground: "#D8DCE9", // Medium-light input background
            colorInputText: "#1A1C23", // Dark input text color for contrast
          },
        }}
      >
        <body className={`${inter.className} bg-light`}>
          <Toaster />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
