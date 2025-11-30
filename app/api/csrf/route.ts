import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf - Get CSRF token
 * This endpoint generates and returns a CSRF token for the client
 */
export async function GET(request: NextRequest) {
  try {
    const token = generateCsrfToken();

    return NextResponse.json(
      { token },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

