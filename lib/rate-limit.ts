// Rate limiting utility for API routes
// Simple in-memory rate limiter (for production, use Redis)

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }
  
  // Initialize or get existing entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + options.windowMs,
    };
  }
  
  const entry = store[key];
  
  // Check if limit exceeded
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Get client IP from request
export function getClientIP(request: Request): string {
  // Try various headers (for proxies, load balancers, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback (won't work in serverless, but good for development)
  return 'unknown';
}

// Rate limit middleware for Next.js API routes
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  options?: RateLimitOptions
) {
  return async (req: Request): Promise<Response> => {
    const ip = getClientIP(req);
    const limit = rateLimit(ip, options);
    
    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
          resetTime: limit.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(options?.maxRequests || 10),
            'X-RateLimit-Remaining': String(limit.remaining),
            'X-RateLimit-Reset': String(limit.resetTime),
            'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }
    
    // Add rate limit headers to response
    const response = await handler(req);
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', String(options?.maxRequests || 10));
    headers.set('X-RateLimit-Remaining', String(limit.remaining));
    headers.set('X-RateLimit-Reset', String(limit.resetTime));
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

