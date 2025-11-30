"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Google Analytics component
function GoogleAnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    // Send page view
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  );
}

// E-commerce tracking events
export const trackEvent = {
  // View product
  viewProduct: (product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }) => {
    window.gtag?.("event", "view_item", {
      currency: "INR",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
        },
      ],
    });
  },

  // Add to cart
  addToCart: (product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    window.gtag?.("event", "add_to_cart", {
      currency: "INR",
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    });
  },

  // Remove from cart
  removeFromCart: (product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    window.gtag?.("event", "remove_from_cart", {
      currency: "INR",
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    });
  },

  // Begin checkout
  beginCheckout: (cart: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
  }) => {
    window.gtag?.("event", "begin_checkout", {
      currency: "INR",
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  },

  // Purchase complete
  purchase: (order: {
    orderId: string;
    total: number;
    tax: number;
    shipping: number;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) => {
    window.gtag?.("event", "purchase", {
      transaction_id: order.orderId,
      value: order.total,
      tax: order.tax,
      shipping: order.shipping,
      currency: "INR",
      items: order.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  },

  // Sign up
  signUp: (method: string) => {
    window.gtag?.("event", "sign_up", { method });
  },

  // Login
  login: (method: string) => {
    window.gtag?.("event", "login", { method });
  },

  // Search
  search: (term: string) => {
    window.gtag?.("event", "search", { search_term: term });
  },

  // Newsletter signup
  newsletterSignup: () => {
    window.gtag?.("event", "newsletter_signup");
  },

  // Share
  share: (contentType: string, itemId: string) => {
    window.gtag?.("event", "share", {
      content_type: contentType,
      item_id: itemId,
    });
  },
};

// Note: Window.gtag is defined in lib/analytics.ts

