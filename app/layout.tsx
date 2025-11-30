import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import SkipLink from "@/components/SkipLink";
import ScrollToTop from "@/components/ScrollToTop";
import MobileBottomNav from "@/components/MobileBottomNav";
import Providers from "@/components/Providers";
import { generateOrganizationSchema } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vishwa Lifestyle | Modern Vedic Living",
    template: "%s | Vishwa Lifestyle",
  },
  description: "A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.",
  keywords: ["Agnihotra", "Vedic", "Lifestyle", "Sacred", "Rituals", "India", "Spiritual", "Home Decor"],
  authors: [{ name: "Vishwa Lifestyle" }],
  creator: "Vishwa Lifestyle",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vishwalifestyle.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Vishwa Lifestyle",
    title: "Vishwa Lifestyle | Modern Vedic Living",
    description: "A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishwa Lifestyle | Modern Vedic Living",
    description: "A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

// Generate organization schema
const organizationSchema = generateOrganizationSchema();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${playfair.variable} ${lato.variable}`}>
        <Providers>
          <SkipLink />
          <Header />
          <CartDrawer />
          <ScrollToTop />
          <MobileBottomNav />
          <div id="main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
