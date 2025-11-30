// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

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
    // Network errors
    "NetworkError",
    "ECONNREFUSED",
    "ETIMEDOUT",
  ],
});

