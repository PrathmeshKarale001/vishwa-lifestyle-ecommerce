import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/account'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Use configured app URL if available, otherwise fallback to request origin
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
            // Ensure we don't double slashes if baseUrl has trailing slash and next starts with slash
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const cleanNext = next.startsWith('/') ? next : `/${next}`;

            return NextResponse.redirect(`${cleanBaseUrl}${cleanNext}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
