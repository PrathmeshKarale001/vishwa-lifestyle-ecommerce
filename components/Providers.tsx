"use client";

import { ReactNode, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "./Analytics";
import CookieConsent from "./CookieConsent";
import { ErrorBoundary } from "./ErrorBoundary";

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
