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
import ConditionalWrapper from "@/components/ConditionalWrapper";
import { getCategories, getSiteSettings } from "@/lib/sanity";
import { Analytics } from "@vercel/analytics/react";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings?.title || "Vishwa Lifestyle | Modern Vedic Living";
  const description = settings?.description || "A Modern Vedic Lifestyle Brand. Agnihotra essentials, sacred home decor, and mindful living products.";

  return {
    title: {
      default: title,
      template: "%s | Vishwa Lifestyle",
    },
    description: description,
    keywords: ["Agnihotra", "Vedic", "Lifestyle", "Sacred", "Rituals", "India", "Spiritual", "Home Decor"],
    authors: [{ name: "Vishwa Lifestyle" }],
    creator: "Vishwa Lifestyle",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vishwalifestyle.com"),
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "/",
      siteName: "Vishwa Lifestyle",
      title: title,
      description: description,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const settings = await getSiteSettings();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${playfair.variable} ${lato.variable} font-sans`}>
        <Providers>
          <ConditionalWrapper categories={categories} settings={settings}>
            {children}
          </ConditionalWrapper>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
