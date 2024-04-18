import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react';
import { siteConfig } from "@/config/site"

import "./globals.css";

const IBMPlex = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-ibm-plex'
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "React",
    "AI Powered Image",
    "AI Generative Image",
    "AI Image",
  ],
  authors: [
    {
      name: siteConfig.name,
      url: new URL(siteConfig.url),
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@qloog",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: '#624cf5'}
    }}>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
