import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting - 20 requests per minute
  const ip = getClientIP(request);
  const limit = rateLimit(`coupons:${ip}`, { windowMs: 60000, maxRequests: 20 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a moment.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': String(limit.remaining),
          'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  let couponCode = 'unknown';
  try {
    const body = await request.json();
    let { code, subtotal, user_id } = body;
    couponCode = code || 'unknown';

    // Sanitize coupon code
    if (code) code = sanitizeText(code.toUpperCase().trim());

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await validateCoupon(code, subtotal, user_id);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: result.coupon,
      discount: result.discount,
    });
  } catch (error: any) {
    log.error('Coupon validation error', error, { code: couponCode });
    return NextResponse.json(
      { error: 'Unable to validate coupon. Please try again later.' },
      { status: 500 }
    );
  }
}

