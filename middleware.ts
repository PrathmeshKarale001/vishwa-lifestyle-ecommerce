import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 4. Refresh session
    let user = null;
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user;
        console.log('Middleware User Check:', {
            email: user?.email,
            isAdminRoute: request.nextUrl.pathname.startsWith('/admin'),
            adminEmails: process.env.NEXT_PUBLIC_ADMIN_EMAILS
        });
    } catch (error: any) {
        console.error('Middleware auth error:', error)
    }

    // --- PROTECTED ROUTES: Admin ---
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 1. Require Authenticated User
        if (!user) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
            const redirectUrl = new URL('/auth/login', baseUrl);
            redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // 2. Require Admin Email
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        const userEmail = user.email?.toLowerCase();

        if (!userEmail || !adminEmails.includes(userEmail)) {
            // Redirect to home if not admin
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // 5. Add CSP Headers (from proxy.ts) - Updated with missing domains from console
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://checkout.ccavenue.com https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com https://va.vercel-scripts.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.supabase.co https://cdn.sanity.io https://images.unsplash.com https://*.ccavenue.com https://razorpay.com https://lh3.googleusercontent.com;
        font-src 'self' https://fonts.gstatic.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self' https://secure.ccavenue.com;
        frame-src 'self' https://api.razorpay.com https://secure.ccavenue.com;
        connect-src 'self' https://*.supabase.co https://*.sanity.io https://api.razorpay.com https://www.google-analytics.com https://api.ipify.org;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
