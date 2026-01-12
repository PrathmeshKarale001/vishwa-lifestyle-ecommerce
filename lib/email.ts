import { Resend } from 'resend';
import { log } from './logger';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Vishwa Lifestyle <noreply@vishwaglobal.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0] || 'crm@vishwaglobal.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vishwalifestyle.com';

// Check if email is configured
export const isEmailConfigured = () => {
  return !!process.env.RESEND_API_KEY;
};

// Contact Form - Notification to Admin
export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  if (!isEmailConfigured()) {
    log.debug('Email not configured. Skipping contact notification.');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1A1A1A; }
              .value { margin-top: 5px; color: #666; }
              .message-box { background: white; padding: 15px; border-left: 3px solid #D4AF37; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${data.name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>
                ${data.phone ? `
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${data.phone}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${data.subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <a href="mailto:${data.email}" style="background: #D4AF37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Reply to Customer
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'contact_notification' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'contact_notification' });
    return { success: false, error: error.message };
  }
}

// Contact Form - Auto-reply to Customer
export async function sendContactAutoReply(data: {
  name: string;
  email: string;
  subject: string;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Thank you for contacting Vishwa Lifestyle`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Contacting Us</h1>
              </div>
              <div class="content">
                <p>Dear ${data.name},</p>
                <p>Thank you for reaching out to Vishwa Lifestyle. We have received your message regarding "<strong>${data.subject}</strong>".</p>
                <p>Our team will review your inquiry and get back to you within 24-48 hours.</p>
                <p>If you have any urgent questions, please feel free to contact us directly.</p>
                <p>Best regards,<br>The Vishwa Lifestyle Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'contact_notification' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'contact_notification' });
    return { success: false, error: error.message };
  }
}

// Newsletter - Confirmation Email
export async function sendNewsletterConfirmation(email: string, name?: string) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Vishwa Lifestyle Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Vishwa Lifestyle</h1>
              </div>
              <div class="content">
                <p>${name ? `Dear ${name},` : 'Hello,'}</p>
                <p>Thank you for subscribing to our newsletter! You'll now receive updates about:</p>
                <ul>
                  <li>New product launches</li>
                  <li>Exclusive offers and discounts</li>
                  <li>Vedic living tips and insights</li>
                  <li>Special events and workshops</li>
                </ul>
                <p>We're excited to share our journey of modern Vedic living with you.</p>
                <p>If you ever wish to unsubscribe, you can do so at any time.</p>
                <p>Best regards,<br>The Vishwa Lifestyle Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'contact_notification' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'contact_notification' });
    return { success: false, error: error.message };
  }
}

// Order Confirmation - Customer Email
export async function sendOrderConfirmationEmail(order: {
  order_number: string;
  customer_email: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  tracking_number?: string;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .order-info { background: white; padding: 15px; margin: 15px 0; border-left: 3px solid #D4AF37; }
              .item-row { padding: 10px 0; border-bottom: 1px solid #eee; }
              .item-row:last-child { border-bottom: none; }
              .total-row { font-weight: bold; font-size: 18px; padding-top: 10px; border-top: 2px solid #ddd; }
              .address-box { background: white; padding: 15px; margin: 15px 0; }
              .button { background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed!</h1>
                <p>Order #${order.order_number}</p>
              </div>
              <div class="content">
                <p>Dear ${order.customer_name},</p>
                <p>Thank you for your order! We're excited to prepare your items for shipment.</p>
                
                <div class="order-info">
                  <h2 style="margin-top: 0;">Order Details</h2>
                  ${order.items.map(item => `
                    <div class="item-row">
                      <strong>${item.name}</strong> × ${item.quantity}<br>
                      <span style="color: #666;">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `).join('')}
                  
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span>Subtotal:</span>
                      <span>${formatPrice(order.subtotal)}</span>
                    </div>
                    ${order.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: green;">
                      <span>Discount:</span>
                      <span>-${formatPrice(order.discount)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span>Shipping:</span>
                      <span>${formatPrice(order.shipping)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                      <span>Tax:</span>
                      <span>${formatPrice(order.tax)}</span>
                    </div>
                    <div class="total-row" style="display: flex; justify-content: space-between;">
                      <span>Total:</span>
                      <span>${formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                <div class="address-box">
                  <h3 style="margin-top: 0;">Shipping Address</h3>
                  <p>
                    ${order.shipping_address.name}<br>
                    ${order.shipping_address.line1}<br>
                    ${order.shipping_address.line2 ? `${order.shipping_address.line2}<br>` : ''}
                    ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
                    Phone: ${order.shipping_address.phone}
                  </p>
                </div>

                ${order.tracking_number ? `
                <div class="order-info">
                  <h3 style="margin-top: 0;">Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                  <p>You can track your order using this tracking number on the courier's website.</p>
                </div>
                ` : `
                <p>We'll send you tracking information as soon as your order ships.</p>
                `}

                <p>Payment Method: ${order.payment_method}</p>
                
                <p>If you have any questions about your order, please don't hesitate to contact us.</p>
                
                <a href="${APP_URL}/account/orders/${order.order_number}" class="button">View Order Details</a>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                  Best regards,<br>
                  The Vishwa Lifestyle Team
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    // Log error but don't throw (email failures shouldn't break the app)
    if (process.env.NODE_ENV === 'development') {
      console.error('Email send error:', error);
    }
    return { success: false, error: error.message };
  }
}

// Order Cancelled - Customer Email
export async function sendOrderCancelledEmail(order: {
  order_number: string;
  customer_email: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Cancelled - ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: #1A1A1A; color: #D4AF37; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
              .content { padding: 40px; }
              .order-summary { background: #f9f9f9; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0; }
              .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
              .item-row:last-child { border-bottom: none; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
              .button { display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Cancelled</h1>
              </div>
              <div class="content">
                <p>Dear ${order.customer_name},</p>
                <p>Your order <strong>#${order.order_number}</strong> has been cancelled as per your request or due to unforeseen circumstances.</p>
                
                <p>If you have already paid for this order, a refund has been initiated to your original payment method and should reflect within 5-7 business days.</p>

                <div class="order-summary">
                  <h3 style="margin-top: 0; color: #1A1A1A;">Cancelled Items</h3>
                  ${order.items.map(item => `
                    <div class="item-row">
                      <span>${item.name} × ${item.quantity}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `).join('')}
                  <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #ddd; display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Total Refund Amount:</span>
                    <span>${formatPrice(order.total)}</span>
                  </div>
                </div>

                <p>We apologize for any inconvenience. If you have any questions, simply reply to this email.</p>
                
                <div style="text-align: center;">
                  <a href="${APP_URL}/shop" class="button">Visit Store</a>
                </div>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Vishwa Lifestyle. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'order_cancelled' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'order_cancelled' });
    return { success: false, error: error.message };
  }
}

// Order Shipped - Customer Email
export async function sendOrderShippedEmail(order: {
  order_number: string;
  customer_email: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  tracking_number: string;
  carrier_name?: string;
  tracking_url?: string;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Shipped - ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: #1A1A1A; color: #D4AF37; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
              .content { padding: 40px; }
              .tracking-box { background: #f0f7ff; padding: 20px; border: 1px solid #cce5ff; border-radius: 4px; text-align: center; margin: 20px 0; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
              .button { display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Shipped</h1>
              </div>
              <div class="content">
                <p>Dear ${order.customer_name},</p>
                <p>Great news! Your order <strong>#${order.order_number}</strong> is on its way.</p>
                
                <div class="tracking-box">
                  <h3>Tracking Number</h3>
                  <p style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${order.tracking_number}</p>
                  ${order.carrier_name ? `<p>Carrier: ${order.carrier_name}</p>` : ''}
                  ${order.tracking_url ? `<a href="${order.tracking_url}" class="button">Track Package</a>` : ''}
                </div>

                <p>The following items are in this shipment:</p>
                <ul style="padding-left: 20px; color: #666;">
                  ${order.items.map(item => `<li>${item.quantity} x ${item.name}</li>`).join('')}
                </ul>

                <p>You can also track your order status in your account.</p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Vishwa Lifestyle. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'order_shipped' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'order_shipped' });
    return { success: false, error: error.message };
  }
}

// Order Delivered - Customer Email
export async function sendOrderDeliveredEmail(order: {
  order_number: string;
  customer_email: string;
  customer_name: string;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Delivered - ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: #1A1A1A; color: #D4AF37; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
              .content { padding: 40px; text-align: center; }
              .icon { font-size: 48px; color: #44b700; margin-bottom: 20px; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
              .button { display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>It's Here!</h1>
              </div>
              <div class="content">
                <div class="icon">✓</div>
                <h2 style="margin-top: 0;">Order Delivered</h2>
                <p>Dear ${order.customer_name},</p>
                <p>Your order <strong>#${order.order_number}</strong> has been marked as delivered.</p>
                <p>We hope you love your purchase! If you have any feedback or issues, please let us know.</p>
                
                <a href="${APP_URL}/account/orders" class="button">Leave a Review</a>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Vishwa Lifestyle. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'order_delivered' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'order_delivered' });
    return { success: false, error: error.message };
  }
}

// Order Notification - Admin Email
export async function sendOrderNotificationToAdmin(order: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shipping_address: {
    name: string;
    city: string;
    state: string;
  };
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Order Received - ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .order-info { background: white; padding: 15px; margin: 15px 0; border-left: 3px solid #D4AF37; }
              .button { background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Order Received</h1>
                <p>Order #${order.order_number}</p>
              </div>
              <div class="content">
                <div class="order-info">
                  <h2 style="margin-top: 0;">Customer Information</h2>
                  <p><strong>Name:</strong> ${order.customer_name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${order.customer_email}">${order.customer_email}</a></p>
                  <p><strong>Shipping To:</strong> ${order.shipping_address.name}, ${order.shipping_address.city}, ${order.shipping_address.state}</p>
                </div>

                <div class="order-info">
                  <h2 style="margin-top: 0;">Order Items</h2>
                  ${order.items.map(item => `
                    <p><strong>${item.name}</strong> × ${item.quantity} - ${formatPrice(item.price * item.quantity)}</p>
                  `).join('')}
                  <p style="font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                    Total: ${formatPrice(order.total)}
                  </p>
                </div>

                <a href="${APP_URL}/admin/orders/${order.order_number}" class="button">View Order in Admin</a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'contact_notification' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'contact_notification' });
    return { success: false, error: error.message };
  }
}

// Abandoned Cart Recovery Email
export async function sendAbandonedCartEmail(data: {
  email: string;
  name: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  cartId: string;
}) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const recoveryUrl = `${APP_URL}/checkout?recover=${data.cartId}`;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Complete Your Purchase - Your Cart is Waiting!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .item-row { padding: 10px 0; border-bottom: 1px solid #eee; }
              .button { background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Don't Miss Out!</h1>
                <p>Your cart is waiting for you</p>
              </div>
              <div class="content">
                <p>Dear ${data.name},</p>
                <p>We noticed you left some items in your cart. Complete your purchase now and bring Vedic wellness into your life!</p>
                
                <div style="background: white; padding: 15px; margin: 15px 0; border-left: 3px solid #D4AF37;">
                  <h3 style="margin-top: 0;">Items in Your Cart:</h3>
                  ${data.items.map(item => `
                    <div class="item-row">
                      <strong>${item.name}</strong> × ${item.quantity}<br>
                      <span style="color: #666;">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `).join('')}
                  <div style="font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                    Total: ${formatPrice(data.total)}
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${recoveryUrl}" class="button">Complete Your Purchase</a>
                </div>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                  This link will expire in 7 days. If you have any questions, feel free to contact us.<br><br>
                  Best regards,<br>
                  The Vishwa Lifestyle Team
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      log.error('Resend error', error, { type: 'contact_notification' });
      return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
  } catch (error: any) {
    log.error('Email send error', error, { type: 'contact_notification' });
    return { success: false, error: error.message };
  }
}
