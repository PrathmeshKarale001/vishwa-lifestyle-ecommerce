# 📧 Email Notifications Setup Guide

This guide will help you set up email notifications for your Vishwa Lifestyle website using Resend.

## ✅ What's Implemented

The following email notifications are now configured:

1. **Contact Form Notifications**
   - Admin receives notification when contact form is submitted
   - Customer receives auto-reply confirmation

2. **Newsletter Confirmations**
   - Welcome email when user subscribes to newsletter

3. **Order Confirmations**
   - Customer receives order confirmation email after payment
   - Admin receives notification of new order

---

## 🚀 Setup Instructions

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### Step 2: Get API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Name it (e.g., "Vishwa Lifestyle Production")
5. Copy the API key (starts with `re_`)

### Step 3: Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `vishwalifestyle.com`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually takes a few minutes)

**Note:** For testing, you can use Resend's default domain which doesn't require verification.

### Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Vishwa Lifestyle <noreply@vishwalifestyle.com>
# OR for testing (use Resend's default):
# RESEND_FROM_EMAIL=Vishwa Lifestyle <onboarding@resend.dev>

# Admin Email (where notifications are sent)
ADMIN_EMAIL=admin@vishwalifestyle.com
# OR use the same as NEXT_PUBLIC_ADMIN_EMAILS
# ADMIN_EMAIL will default to first email in NEXT_PUBLIC_ADMIN_EMAILS if not set
```

### Step 5: Test Email Notifications

#### Test Contact Form
1. Go to `/contact` page
2. Fill out and submit the contact form
3. Check:
   - Admin email inbox (should receive notification)
   - Customer email inbox (should receive auto-reply)

#### Test Newsletter
1. Go to homepage footer
2. Enter email in newsletter form
3. Check customer email inbox (should receive welcome email)

#### Test Order Confirmation
1. Complete a test order with Razorpay test mode
2. After payment, check:
   - Customer email inbox (should receive order confirmation)
   - Admin email inbox (should receive order notification)

---

## 📧 Email Templates

All email templates are defined in `lib/email.ts`. They include:

- **Professional HTML styling** with Vishwa Lifestyle branding
- **Responsive design** for mobile devices
- **Clear call-to-action buttons**
- **Order details** formatted nicely
- **Tracking information** when available

### Customizing Email Templates

To customize email templates, edit `lib/email.ts`:

1. **Change colors**: Update the CSS in the HTML templates
2. **Change branding**: Update the header text and styling
3. **Add logo**: Add an `<img>` tag with your logo URL
4. **Modify content**: Update the text content in each template

---

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check API Key**
   - Verify `RESEND_API_KEY` is set correctly in `.env.local`
   - Make sure there are no extra spaces or quotes

2. **Check From Email**
   - For production: Use verified domain email
   - For testing: Use `onboarding@resend.dev` (Resend's default)

3. **Check Console Logs**
   - Look for error messages in server logs
   - Check browser console for client-side errors

4. **Check Resend Dashboard**
   - Go to Resend dashboard → **Logs**
   - See if emails are being sent and any error messages

### Common Errors

**Error: "Invalid API key"**
- Solution: Regenerate API key in Resend dashboard and update `.env.local`

**Error: "Domain not verified"**
- Solution: Either verify your domain in Resend or use `onboarding@resend.dev` for testing

**Error: "Rate limit exceeded"**
- Solution: You've exceeded the free tier limit (3,000/month). Wait or upgrade plan.

**Emails going to spam**
- Solution: Verify your domain and set up SPF/DKIM records in Resend

---

## 📊 Email Service Alternatives

If you prefer a different email service, you can replace Resend with:

### Option 1: SendGrid
- Free tier: 100 emails/day
- Update `lib/email.ts` to use SendGrid SDK
- Set `SENDGRID_API_KEY` in `.env.local`

### Option 2: Nodemailer (SMTP)
- Works with any SMTP provider (Gmail, Outlook, etc.)
- Requires SMTP credentials
- More setup required

### Option 3: AWS SES
- Very cost-effective for high volume
- Requires AWS account setup
- More complex configuration

---

## 🔒 Security Best Practices

1. **Never commit API keys** to Git
   - Keep all keys in `.env.local` (already in `.gitignore`)

2. **Use environment-specific keys**
   - Different keys for development and production

3. **Rotate keys regularly**
   - Change API keys every 3-6 months

4. **Monitor usage**
   - Check Resend dashboard regularly for unusual activity

---

## 📈 Production Checklist

Before going live:

- [ ] Domain verified in Resend
- [ ] `RESEND_FROM_EMAIL` uses verified domain
- [ ] `ADMIN_EMAIL` set to correct admin email
- [ ] Test all email types (contact, newsletter, order)
- [ ] Check email formatting on mobile devices
- [ ] Set up email monitoring/alerts
- [ ] Document email workflow for client

---

## 📝 Email Types Reference

### Contact Form
- **To Admin**: Notification with customer details and message
- **To Customer**: Auto-reply confirmation

### Newsletter
- **To Customer**: Welcome email with subscription benefits

### Order Confirmation
- **To Customer**: Order details, shipping address, tracking info
- **To Admin**: New order notification with customer and order details

---

**Last Updated:** November 2024
**Status:** Ready for production after Resend setup

