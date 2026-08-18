import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "sweetiepie",
    template: "%s · sweetiepie",
  },
  description: "sweetiepie — Director. Music videos, commercials & documentary.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "sweetiepie",
    title: "sweetiepie",
    description: "Director — Music videos, commercials & documentary.",
  },
  twitter: {
    card: "summary_large_image",
    title: "sweetiepie",
    description: "Director — Music videos, commercials & documentary.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
