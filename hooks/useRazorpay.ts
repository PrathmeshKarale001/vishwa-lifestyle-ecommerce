"use client";

import { useEffect, useState } from "react";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay");
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initiatePayment = async ({
    orderId,
    razorpayOrderId,
    razorpayKeyId,
    amount,
    currency,
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onFailure,
    onDismiss,
  }: {
    orderId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    onSuccess: (response: RazorpayResponse) => void;
    onFailure: (error: any) => void;
    onDismiss?: () => void;
  }) => {
    if (!isLoaded || !window.Razorpay) {
      onFailure(new Error("Razorpay not loaded"));
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: amount, // Amount in paise from server
      currency: currency,
      name: "Vishwa Lifestyle",
      description: `Order #${orderId}`,
      order_id: razorpayOrderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: {
        color: "#D4AF37", // Gold accent color
      },
      handler: onSuccess,
      modal: {
        ondismiss: onDismiss,
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onFailure(error);
    }
  };

  return { isLoaded, initiatePayment };
}

