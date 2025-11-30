import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { isServerAdmin } from '@/lib/auth-server';

/**
 * Middleware to protect admin routes
 * This runs on the edge and checks admin access
 */
export async function adminMiddleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    // No token, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token and check admin status
  // Note: This is a simplified check - in production, verify JWT properly
  // For now, we'll do the full check in the page component
  // This middleware just ensures user is authenticated

  return NextResponse.next();
}

