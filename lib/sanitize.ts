// Input sanitization utilities

// Basic sanitization without external dependencies
// For production, consider using DOMPurify or similar

/**
 * Sanitize HTML content
 * Removes all HTML tags for safety
 */
export function sanitizeHtml(html: string): string {
  // Remove all HTML tags
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize plain text (remove HTML, trim, etc.)
 */
export function sanitizeText(text: string): string {
  // Remove HTML tags
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  const decoded = withoutHtml
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Trim whitespace
  return decoded.trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitize phone number (remove non-digits, keep + for international)
 */
export function sanitizePhone(phone: string): string {
  // Keep + and digits only
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize search query
 */
export function sanitizeSearch(query: string): string {
  return sanitizeText(query).slice(0, 100); // Limit length
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize object with string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as T[Extract<keyof T, string>];
    }
  }
  return sanitized;
}

