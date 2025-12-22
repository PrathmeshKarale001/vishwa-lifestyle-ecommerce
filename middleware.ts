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

    await supabase.auth.getUser()

    // Add CSP headers
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.supabase.co https://cdn.sanity.io https://images.unsplash.com https://razorpay.com;
        font-src 'self' https://fonts.gstatic.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-src 'self' https://api.razorpay.com;
        connect-src 'self' https://*.supabase.co https://*.sanity.io https://api.razorpay.com https://www.google-analytics.com;
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
