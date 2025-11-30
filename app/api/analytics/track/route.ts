import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type,
      event_name,
      user_id,
      session_id,
      page_path,
      page_title,
      properties,
    } = body;

    // Validate required fields
    if (!event_type || !event_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();
    if (!serverClient) {
      return NextResponse.json(
        { error: 'Server not configured' },
        { status: 500 }
      );
    }

    // Get IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert analytics event
    const { error } = await serverClient
      .from('analytics_events')
      .insert({
        event_type,
        event_name,
        user_id: user_id || null,
        session_id: session_id || null,
        page_path: page_path || null,
        page_title: page_title || null,
        properties: properties || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      log.error('Error tracking analytics event', error, { event_name, event_type });
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error('Analytics tracking error', error);
    return NextResponse.json(
      { error: 'Unable to track analytics event. Please try again later.' },
      { status: 500 }
    );
  }
}

