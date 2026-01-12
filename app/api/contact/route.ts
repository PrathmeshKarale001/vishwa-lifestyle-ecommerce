import { NextRequest, NextResponse } from 'next/server';
import { submitContactForm, supabase } from '@/lib/supabase';
import { sendContactNotification, sendContactAutoReply } from '@/lib/email';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeText, sanitizePhone } from '@/lib/sanitize';
import { log } from '@/lib/logger';
import { verifyCsrfTokenServer } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Entry log for debugging
  const ip = getClientIP(request);
  log.info(`Contact form submission started`, { ip });

  // Rate limiting - 10 requests per minute
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

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let { name, email, phone, subject, message } = body;

    // Sanitize inputs safely
    name = name ? sanitizeText(String(name)) : '';
    email = email ? sanitizeEmail(String(email)) : '';
    phone = phone ? sanitizePhone(String(phone)) : '';
    subject = subject ? sanitizeText(String(subject)) : '';
    message = message ? sanitizeText(String(message)) : '';

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (Name, Email, Subject, and Message are required)' },
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

    // Attempt to save to database
    try {
      await submitContactForm({
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
      });

      // Send emails (non-blocking, errors swallowed but logged)
      try {
        sendContactNotification({ name, email, phone, subject, message }).catch(err => {
          log.error('Failed to send contact notification', err);
        });
        sendContactAutoReply({ name, email, subject }).catch(err => {
          log.error('Failed to send contact auto-reply', err);
        });
      } catch (emailErr) {
        log.error('Email trigger error', emailErr);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been sent successfully. We\'ll get back to you soon!'
        },
        {
          headers: { 'X-Contact-Status': 'Success' }
        }
      );
    } catch (error: any) {
      log.error('Database submission error', error, { email, subject });

      // Handle duplicate submission
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'You have already submitted this message. Please wait before submitting again.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Submission failed: ${error.message || 'Unknown database error'}. Please contact us directly if this persists.`,
          code: error.code
        },
        {
          status: 500,
          headers: { 'X-Contact-Status': 'DB-Error', 'X-Error-Code': error.code || 'None' }
        }
      );
    }
  } catch (error: any) {
    log.error('Contact API Global error', error);
    return NextResponse.json(
      { success: false, error: `Critical server error: ${error.message || 'Internal Failure'}` },
      {
        status: 500,
        headers: { 'X-Contact-Status': 'Global-Error' }
      }
    );
  }
}
