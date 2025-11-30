// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from event
    if (event.request) {
      if (event.request.data) {
        const data = event.request.data as Record<string, any>;
        delete data.password;
        delete data.token;
        delete data.csrf_token;
      }
      if (event.request.headers) {
        const headers = event.request.headers as Record<string, any>;
        delete headers.Authorization;
        delete headers["x-csrf-token"];
      }
    }
    return event;
  },

  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    // Network errors
    "NetworkError",
    "Failed to fetch",
    "Network request failed",
    // ResizeObserver
    "ResizeObserver loop limit exceeded",
  ],
});

