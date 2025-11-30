"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import React from "react";
import { log } from "@/lib/logger";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!supabase) {
      toast.error("Supabase not configured");
      setStatus("error");
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }

    let subscription: any = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let hasShownToast = false; // Flag to prevent multiple toasts

    const showSuccessToast = () => {
      if (!hasShownToast) {
        hasShownToast = true;
        toast.success("Welcome! You're logged in.");
      }
    };

    const processCallback = async () => {
      // Check for errors in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorParam = hashParams.get("error") || searchParams.get("error");
      
      if (errorParam) {
        log.error("OAuth error", errorParam, { errorParam });
        toast.error("Authentication failed. Please try again.");
        setStatus("error");
        setTimeout(() => router.push(`/auth/login?error=${errorParam}`), 2000);
        return;
      }

      // Check if we have hash fragments (tokens from OAuth)
      const hasHash = window.location.hash && window.location.hash.length > 1;
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      
      log.debug("Processing OAuth callback", { 
        hasHash,
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
      });

      // Set up auth state listener FIRST (before processing)
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        log.debug("Auth state changed", { event, hasSession: !!session });

        if (event === "SIGNED_IN" && session) {
          log.info("User signed in via auth state change");
          showSuccessToast();
          setStatus("success");
          window.history.replaceState(null, "", "/auth/callback");
          
          if (timeoutId) clearTimeout(timeoutId);
          if (subscription) subscription.unsubscribe();
          
          setTimeout(() => {
            router.push("/account");
            router.refresh();
          }, 500);
        }
      });

      subscription = authSubscription;

      // If we have tokens, try to set the session
      if (accessToken && refreshToken) {
        try {
          log.debug("Setting session with tokens from hash");
          
          // Use setSession to establish the session
          const { data: { session }, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setError) {
            log.error("Set session error", setError);
            // Don't fail immediately - let the auth state listener handle it
            // Sometimes setSession fails but the session is still created
          }

          if (session) {
            log.info("Session set successfully");
            showSuccessToast();
            setStatus("success");
            window.history.replaceState(null, "", "/auth/callback");
            
            if (timeoutId) clearTimeout(timeoutId);
            if (subscription) subscription.unsubscribe();
            
            setTimeout(() => {
              router.push("/account");
              router.refresh();
            }, 500);
            return;
          }
        } catch (err: any) {
          log.error("Error in setSession", err);
          // Continue to check session below
        }
      }

      // Wait a moment for Supabase to process hash fragments automatically
      // (with detectSessionInUrl: true, it should process automatically)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for session (Supabase may have processed it automatically)
      let attempts = 0;
      const maxAttempts = 3;

      const checkSession = async (): Promise<void> => {
        attempts++;
        log.debug(`Checking session (attempt ${attempts}/${maxAttempts})`);

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            log.error("Get session error", error);
            if (attempts < maxAttempts) {
              timeoutId = setTimeout(checkSession, 1000);
            } else {
              toast.error("Failed to get session");
              setStatus("error");
              setTimeout(() => router.push("/auth/login?error=auth_callback_error"), 2000);
            }
            return;
          }

          if (session) {
            log.info("Session found");
            showSuccessToast();
            setStatus("success");
            window.history.replaceState(null, "", "/auth/callback");
            
            if (timeoutId) clearTimeout(timeoutId);
            if (subscription) subscription.unsubscribe();
            
            setTimeout(() => {
              router.push("/account");
              router.refresh();
            }, 500);
          } else if (attempts < maxAttempts) {
            // Retry if no session yet
            timeoutId = setTimeout(checkSession, 1000);
          } else {
            log.error("No session found after all attempts");
            toast.error("Authentication failed. Please try signing in again.");
            setStatus("error");
            setTimeout(() => router.push("/auth/login?error=auth_callback_error"), 2000);
          }
        } catch (err) {
          log.error("Session check error", err);
          if (attempts < maxAttempts) {
            timeoutId = setTimeout(checkSession, 1000);
          } else {
            toast.error("Authentication failed. Please check your connection and try again.");
            setStatus("error");
            setTimeout(() => router.push("/auth/login?error=auth_callback_error"), 2000);
          }
        }
      };

      // Start checking for session
      checkSession();
    };

    processCallback();

    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4"></div>
            <p className="text-foreground-muted">Completing sign in...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-foreground-muted">Sign in successful! Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-foreground-muted">Sign in failed. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}

