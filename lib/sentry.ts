// Sentry Error Monitoring Setup

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured. Error monitoring disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Adjust sample rate in production
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

    // Capture unhandled promise rejections
    // captureUnhandledRejections: true,

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "atomicFindClose",
      "fb_xd_fragment",
      "bmi_SafeAddOnload",
      "EBCallBackMessageReceived",
      "conduitPage",
      // Network errors
      "NetworkError",
      "Failed to fetch",
      "Network request failed",
      // ResizeObserver errors
      "ResizeObserver loop limit exceeded",
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from event
      if (event.request) {
        // Remove passwords, tokens, etc.
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

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,

    // Performance monitoring
    integrations: [
      // BrowserTracing removed due to type error
    ],
  });
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) return;

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb(breadcrumb);
}

