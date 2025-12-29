import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio | Vishwa Lifestyle",
  description: "Sanity Studio for content management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return just the children without any wrapper
  // This will use the root layout but we'll override the content
  return <>{children}</>;
}