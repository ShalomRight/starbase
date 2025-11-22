import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ULP Star Photo - Unity Labour Party",
  description: "Join the Unity Labour Party movement by creating and sharing your campaign photo",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["ULP", "Unity Labour Party", "campaign", "photo", "politics"],
  authors: [{ name: "Unity Labour Party" }],
  icons: {
    icon: "/icon-192x192.jpg",
    apple: "/icon-512x512.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ULP Stars",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ULP Star Photo",
    title: "Join the ULP Movement",
    description: "Create your campaign photo and become a star",
  },
}

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
