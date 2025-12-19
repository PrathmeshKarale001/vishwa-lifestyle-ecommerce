# 🔴 Redis Setup for Production Rate Limiting

This guide explains how to set up Redis for distributed rate limiting in production.

## Why Redis?

The current in-memory rate limiter works for single-server deployments but has limitations:
- Resets on server restart
- Doesn't work with multiple server instances
- No persistence
- Limited scalability

Redis solves these issues by providing:
- ✅ Distributed rate limiting across multiple servers
- ✅ Persistence (survives restarts)
- ✅ Better performance
- ✅ Advanced features (sliding windows, etc.)

---

## Option 1: Upstash Redis (Recommended for Vercel)

**Best for:** Vercel deployments, serverless functions

### Step 1: Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up (free tier available)
3. Create a new Redis database
4. Choose region closest to your users (e.g., Mumbai, Singapore)

### Step 2: Get Connection Details

1. In Upstash dashboard, click on your database
2. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### Step 3: Install Package

```bash
npm install @upstash/redis @upstash/ratelimit
```

### Step 4: Update Middleware

Create `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter: 100 requests per minute
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: '@vishwa/ratelimit',
});

// Stricter limiter for API routes: 50 requests per minute
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
  prefix: '@vishwa/api/ratelimit',
});

// Very strict limiter for admin routes: 20 requests per minute
export const adminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: '@vishwa/admin/ratelimit',
});
```

Update `middleware.ts`:

```typescript
import { rateLimiter, apiRateLimiter, adminRateLimiter } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Admin routes - stricter rate limiting
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { success } = await adminRateLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }
  // API routes
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    const { success } = await apiRateLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }
  // All other routes
  else {
    const { success } = await rateLimiter.limit(ip);
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }

  // ... rest of middleware code
}
```

### Step 5: Add Environment Variables

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## Option 2: Redis Cloud (Self-Managed)

**Best for:** VPS deployments, Docker setups

### Step 1: Create Redis Cloud Account

1. Go to [redis.com/try-free](https://redis.com/try-free)
2. Sign up for free tier (30MB)
3. Create a database

### Step 2: Get Connection Details

1. Copy:
   - **REDIS_HOST**
   - **REDIS_PORT**
   - **REDIS_PASSWORD**

### Step 3: Install Package

```bash
npm install ioredis
```

### Step 4: Create Rate Limiter

Create `lib/rate-limit.ts`:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export async function rateLimit(ip: string, limit: number, window: number): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

### Step 5: Add Environment Variables

```bash
# .env.local
REDIS_HOST=xxx.redis.cloud
REDIS_PORT=6379
REDIS_PASSWORD=xxx
```

---

## Option 3: Vercel KV (Vercel Native)

**Best for:** Vercel deployments, simplest setup

### Step 1: Enable Vercel KV

1. In Vercel dashboard, go to your project
2. Go to **Storage** → **Create Database**
3. Choose **KV** (Key-Value)
4. Create database

### Step 2: Install Package

```bash
npm install @vercel/kv
```

### Step 3: Create Rate Limiter

```typescript
import { kv } from '@vercel/kv';

export async function rateLimit(ip: string, limit: number, window: number): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await kv.incr(key);
  
  if (current === 1) {
    await kv.expire(key, window);
  }
  
  return current <= limit;
}
```

---

## Testing Rate Limiting

### Test Script

Create `scripts/test-rate-limit.ts`:

```typescript
import { rateLimiter } from '../lib/rate-limit';

async function test() {
  const testIP = '127.0.0.1';
  
  for (let i = 0; i < 110; i++) {
    const { success, limit, remaining } = await rateLimiter.limit(testIP);
    console.log(`Request ${i + 1}: ${success ? '✅' : '❌'} (${remaining}/${limit} remaining)`);
    
    if (!success) {
      console.log('Rate limit hit!');
      break;
    }
  }
}

test();
```

---

## Monitoring

### Upstash Dashboard

- View rate limit analytics
- Monitor Redis usage
- Check error rates

### Custom Monitoring

Add to your monitoring:

```typescript
// Log rate limit hits
if (!success) {
  console.warn(`Rate limit exceeded for IP: ${ip}`);
  // Send to monitoring service (Sentry, etc.)
}
```

---

## Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Upstash** | 10,000 commands/day | $0.20 per 100K commands |
| **Redis Cloud** | 30MB storage | $0.50/hour for 100MB |
| **Vercel KV** | Included with Vercel Pro | $0.20 per 100K reads |

---

## Migration from In-Memory

1. Install Redis package
2. Update `middleware.ts` to use Redis rate limiter
3. Keep in-memory as fallback:

```typescript
let rateLimiter: RateLimiter;

if (process.env.UPSTASH_REDIS_REST_URL) {
  // Use Redis
  rateLimiter = new RedisRateLimiter();
} else {
  // Fallback to in-memory
  rateLimiter = new InMemoryRateLimiter();
}
```

---

## Production Checklist

- [ ] Redis database created
- [ ] Environment variables set
- [ ] Rate limiter tested
- [ ] Monitoring configured
- [ ] Fallback mechanism in place
- [ ] Documentation updated

---

**Last Updated:** November 2024
**Recommended:** Upstash for Vercel, Redis Cloud for VPS

