// Centralized logging utility
// In production, these can be connected to Sentry or other logging services

const isDev = process.env.NODE_ENV === 'development';

interface LogContext {
  [key: string]: unknown;
}

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Logger configuration
const config = {
  enableConsole: isDev,
  enableSentry: !isDev && typeof window !== 'undefined',
};

// Format error for logging
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
};

// Send to Sentry (if configured)
const sendToSentry = (level: LogLevel, message: string, context?: LogContext) => {
  if (!config.enableSentry) return;
  
  // Sentry integration would go here
  // Example:
  // if (window.Sentry) {
  //   window.Sentry.captureMessage(message, { level, extra: context });
  // }
};

// Main logger object
export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (config.enableConsole && isDev) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },

  info: (message: string, context?: LogContext) => {
    if (config.enableConsole) {
      console.info(`[INFO] ${message}`, context || '');
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (config.enableConsole) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    sendToSentry('warn', message, context);
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorStr = error ? formatError(error) : '';
    const fullMessage = errorStr ? `${message}: ${errorStr}` : message;
    
    if (config.enableConsole) {
      console.error(`[ERROR] ${fullMessage}`, context || '');
    }
    sendToSentry('error', fullMessage, { ...context, error: errorStr });
  },

  // Track specific events (useful for analytics)
  track: (event: string, properties?: LogContext) => {
    if (isDev && config.enableConsole) {
      console.log(`[TRACK] ${event}`, properties || '');
    }
    // Analytics tracking would go here
  },
};

// Export convenience functions
export const logDebug = logger.debug;
export const logInfo = logger.info;
export const logWarn = logger.warn;
export const logError = logger.error;
export const trackEvent = logger.track;

// Export as 'log' for convenience (alias)
export const log = logger;

export default logger;

