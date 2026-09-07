import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import {
  SITE_HEADLINE,
  SITE_NAME,
  SITE_SHARE_DESCRIPTION,
  SITE_TAGLINE,
} from "@/lib/site-brand";
import { getSiteUrl } from "@/lib/site-url";
import { MuxPreconnect } from "@/components/MuxPreconnect";
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
    default: SITE_HEADLINE,
    template: `%s · ${SITE_NAME}`,
  },
  description: `${SITE_TAGLINE} — ${SITE_SHARE_DESCRIPTION}`,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "512x512" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_HEADLINE,
    description: SITE_SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_HEADLINE,
    description: SITE_SHARE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        <MuxPreconnect />
        {children}
      </body>
    </html>
  );
}
