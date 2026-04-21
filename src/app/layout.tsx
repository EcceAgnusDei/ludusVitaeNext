import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getSiteOrigin,
  siteDefaultDescription,
  siteMainTitle,
  siteName,
} from "@/lib/site-metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: siteMainTitle,
    template: `${siteMainTitle} | %s`,
  },
  description: siteDefaultDescription,
  applicationName: siteMainTitle,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName,
    title: siteMainTitle,
    description: siteDefaultDescription,
  },
  twitter: {
    card: "summary",
    title: siteMainTitle,
    description: siteDefaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <SiteHeader />
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
