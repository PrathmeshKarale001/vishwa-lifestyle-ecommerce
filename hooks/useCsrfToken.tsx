"use client";

import { useState, useEffect } from "react";

// CSRF Token Hook for form protection
export function useCsrfToken() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Generate a random CSRF token
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    };

    // Check if token exists in sessionStorage, otherwise generate new one
    const existingToken = sessionStorage.getItem("csrf_token");
    if (existingToken) {
      setToken(existingToken);
    } else {
      const newToken = generateToken();
      sessionStorage.setItem("csrf_token", newToken);
      setToken(newToken);
    }
  }, []);

  return token;
}

// Verify CSRF token
export function verifyCsrfToken(token: string): boolean {
  if (typeof window === "undefined") return false;
  const storedToken = sessionStorage.getItem("csrf_token");
  return storedToken === token && token.length > 0;
}

// CSRF Token Input Component
export function CsrfInput() {
  const token = useCsrfToken();
  return <input type="hidden" name="_csrf" value={token} />;
}

