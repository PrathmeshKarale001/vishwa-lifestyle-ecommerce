import { NextRequest, NextResponse } from 'next/server';
import { getAbandonedCartsForReminder, markEmailSent } from '@/lib/abandoned-cart';
import { sendAbandonedCartEmail } from '@/lib/email';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // This should be called by a cron job or scheduled task
    // For now, we'll make it manually triggerable

    const body = await request.json();
    const hoursSinceAbandonment = body.hours || 24;
    const maxEmails = body.maxEmails || 3;

    const carts = await getAbandonedCartsForReminder(hoursSinceAbandonment, maxEmails);

    let sentCount = 0;
    let errorCount = 0;

    for (const cart of carts) {
      try {
        // Send email
        const emailResult = await sendAbandonedCartEmail({
          email: cart.email || '',
          name: cart.email?.split('@')[0] || 'Customer',
          items: cart.items,
          total: cart.total,
          cartId: cart.id,
        });

        if (emailResult.success) {
          // Mark email as sent
          await markEmailSent(cart.id);
          sentCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        log.error(`Error sending abandoned cart email`, error, { cartId: cart.id });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: carts.length,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error: any) {
    log.error('Abandoned cart reminder error', error);
    return NextResponse.json(
      { error: 'Unable to process abandoned cart reminders. Please try again later.' },
      { status: 500 }
    );
  }
}

