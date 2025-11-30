import { NextRequest, NextResponse } from 'next/server';
import { submitContactForm, supabase } from '@/lib/supabase';
import { sendContactNotification, sendContactAutoReply } from '@/lib/email';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeText, sanitizePhone } from '@/lib/sanitize';
import { log } from '@/lib/logger';
import { verifyCsrfTokenServer } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  // Rate limiting - 10 requests per minute
  const ip = getClientIP(request);
  const limit = rateLimit(`contact:${ip}`, { windowMs: 60000, maxRequests: 10 });
  
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again in a moment.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(limit.remaining),
          'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    // Verify CSRF token (optional for now, can be enforced later)
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('csrf_token')?.value;
    
    // Only verify if token is provided (backward compatible)
    if (csrfToken && sessionToken && !verifyCsrfTokenServer(csrfToken, sessionToken)) {
      log.warn('Invalid CSRF token in contact form', { ip });
      return NextResponse.json(
        { success: false, error: 'Invalid request. Please refresh and try again.' },
        { status: 403 }
      );
    }

    let { name, email, phone, subject, message } = await request.json();
    
    // Sanitize inputs
    name = sanitizeText(name);
    email = sanitizeEmail(email);
    if (phone) phone = sanitizePhone(phone);
    subject = sanitizeText(subject);
    message = sanitizeText(message);

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      // For development without Supabase, just log and return success
      log.info('Contact form submission (dev mode)', { name, email, subject });
      return NextResponse.json({ success: true, message: 'Message received (dev mode)' });
    }

      // Save to database
    try {
      await submitContactForm({
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
      });

      // Send notification email to admin (non-blocking)
      sendContactNotification({ name, email, phone, subject, message }).catch(err => {
        log.error('Failed to send contact notification', err);
      });

      // Send auto-reply to customer (non-blocking)
      sendContactAutoReply({ name, email, subject }).catch(err => {
        log.error('Failed to send contact auto-reply', err);
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Your message has been sent successfully. We\'ll get back to you soon!' 
      });
    } catch (error: any) {
      log.error('Contact form error', error, { email, subject });
      
      // Handle duplicate or other database errors gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'You have already submitted this message. Please wait before submitting again.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to submit message. Please try again or contact us directly.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    log.error('Contact API error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}

