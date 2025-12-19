"use client";

import { ReactNode, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "./ErrorBoundary";

const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });
const GoogleAnalytics = dynamic(() => import("./Analytics").then(mod => mod.GoogleAnalytics), { ssr: false });

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1A1A1A",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 20px",
          },
          success: {
            iconTheme: {
              primary: "#D4AF37",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <CookieConsent />
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <Analytics />
    </ErrorBoundary>
  );
}
