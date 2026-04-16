import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "RedIntelli — Reddit Audience Intelligence for Founders",
    template: "%s | RedIntelli",
  },
  description:
    "Discover relevant subreddits, generate AI-powered audience briefs, and find high-intent customers on Reddit. The GummySearch alternative built for indie hackers and startup founders.",
  keywords: [
    "reddit audience research",
    "reddit marketing tool",
    "subreddit discovery",
    "audience intelligence",
    "reddit analytics",
    "gummysearch alternative",
    "indie hacker tools",
    "reddit lead generation",
    "subreddit analysis",
    "reddit audience brief",
  ],
  authors: [{ name: "RedIntelli" }],
  creator: "RedIntelli",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://redintelli.com",
    siteName: "RedIntelli",
    title: "RedIntelli — Understand Any Reddit Audience in 60 Seconds",
    description:
      "AI-powered Reddit audience briefs for founders. Discover subreddits, understand pain points, speak the community's language, and find customers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedIntelli — Reddit Audience Intelligence",
    description:
      "AI-powered audience briefs for any subreddit. The GummySearch alternative for indie hackers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
