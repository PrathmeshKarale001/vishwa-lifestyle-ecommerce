import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter, supabase } from '@/lib/supabase';
import { sendNewsletterConfirmation } from '@/lib/email';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeText } from '@/lib/sanitize';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  // Rate limiting - 5 requests per minute
  const ip = getClientIP(request);
  const limit = rateLimit(`newsletter:${ip}`, { windowMs: 60000, maxRequests: 5 });
  
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again in a moment.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(limit.remaining),
          'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  let email: string | undefined;
  let name: string | undefined;
  
  try {
    const body = await request.json();
    email = sanitizeEmail(body.email);
    name = body.name ? sanitizeText(body.name) : undefined;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      // For development without Supabase, just return success
      log.info('Newsletter signup (dev mode)', { email });
      return NextResponse.json({ success: true });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { success: false, error: 'Already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
    } else {
      // Create new subscription
      await subscribeToNewsletter(email, name);
    }

    // Send confirmation email (non-blocking)
    sendNewsletterConfirmation(email, name).catch(err => {
      log.error('Failed to send newsletter confirmation', err, { email });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error('Newsletter error', error, { email });
    
    // Handle duplicate email error gracefully
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed to our newsletter.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Unable to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

// Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('email', email);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Unsubscribe error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to unsubscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
