"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    // Enable analytics
    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
    });
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
    // Disable analytics
    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
    });
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-lg"
          data-testid="cookie-banner"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Cookie size={24} className="text-accent-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm">
                    We use cookies to enhance your experience. By continuing to visit this site,
                    you agree to our use of cookies.{" "}
                    <Link href="/privacy" className="text-accent-gold hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 bg-foreground text-white text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
                  data-testid="accept-cookies"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

