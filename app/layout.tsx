import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import '../public/styles.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://meet.krishnaconsciousnesssociety.com'),
  title: {
    default: 'KCS Meet - Divine Connections Beyond Boundaries',
    template: '%s | KCS Meet',
  },
  description:
    "India's first spiritually inspired video conferencing platform. Connect with your spiritual community through HD video calls, Super Chat donations, interactive polls, and virtual backgrounds. Experience divine connections with KCS Meet.",
  keywords: [
    'video conferencing',
    'spiritual meetings',
    'online satsang',
    'Krishna Consciousness',
    'virtual prayer',
    'yoga classes online',
    'religious meetings',
    'spiritual community',
    'video call India',
    'meeting app',
    'Super Chat',
    'meditation online',
  ],
  authors: [{ name: 'Krishna Consciousness Society' }],
  creator: 'Krishna Consciousness Society',
  publisher: 'Krishna Consciousness Society',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://meet.krishnaconsciousnesssociety.com',
    title: 'KCS Meet - Divine Connections Beyond Boundaries',
    description:
      "India's first spiritually inspired video conferencing platform for spiritual communities, yoga instructors, and religious organizations.",
    siteName: 'KCS Meet',
    images: [
      {
        url: '/icons/KCS-Logo.png',
        width: 1200,
        height: 630,
        alt: 'KCS Meet - Spiritual Video Conferencing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KCS Meet - Divine Connections Beyond Boundaries',
    description:
      "India's first spiritually inspired video conferencing platform for spiritual communities.",
    images: ['/icons/KCS-Logo.png'],
    creator: '@KCSMeet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/icons/KCS-Logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/KCS-Logo.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-code', // Add your Google Search Console verification code
  },
  alternates: {
    canonical: 'https://meet.krishnaconsciousnesssociety.com',
  },
  category: 'Communication',
};

export const viewport = {
  themeColor: '#B91C1C',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 2,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              layout: {
                socialButtonsVariant: 'iconButton',
                logoImageUrl: '/icons/KCS-Logo.png',
              },
              variables: {
                colorPrimary: '#B91C1C',
                colorBackground: '#F8FAFC',
                colorText: '#0F172A',
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
        </ThemeProvider>
      </body>
    </html>
  );
}
