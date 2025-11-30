"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    log.error("Application error", error, {
      digest: error.digest,
      stack: error.stack,
    });
    
    // Send to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: true,
        },
        extra: {
          digest: error.digest,
        },
      });
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-500" />
          </div>

          <h1 className="text-3xl font-serif mb-4">Something Went Wrong</h1>
          <p className="text-foreground-muted mb-8">
            We apologize for the inconvenience. An unexpected error has occurred.
            Please try again or contact support if the problem persists.
          </p>

          {error.digest && (
            <p className="text-xs text-foreground-muted mb-6 font-mono bg-gray-100 p-2 rounded">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-foreground text-foreground px-6 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
            >
              <Home size={16} /> Go Home
            </Link>
          </div>

          <p className="mt-8 text-sm text-foreground-muted">
            Need help?{" "}
            <Link href="/contact" className="text-accent-gold hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

