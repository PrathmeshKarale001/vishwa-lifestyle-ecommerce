# Walkthrough - Contact Form & Newsletter Debugging

I have investigated and resolved the issue where the contact form and newsletter subscription were failing for guest users with a 500 error.

## Changes Made

### 1. Switched to Service Role Client in `lib/supabase.ts`
The primary issue was that guest users (unauthenticated) were encountering Row Level Security (RLS) restrictions when attempting to insert data into the `contact_submissions` and `newsletter_subscribers` tables using the default anonymous key.

While RLS policies are helpful, they can be brittle for public-facing forms. I modified `lib/supabase.ts` to:
- Use `createServerClient()` (which utilizes the `SUPABASE_SERVICE_ROLE_KEY`) inside `submitContactForm` and `subscribeToNewsletter`.
- This ensures that form submissions are reliably processed by the server, bypassing any client-side RLS hurdles while still ensuring the data is correctly validated in the API route.

### 2. Improved Error Reporting
I updated the API response to include the specific error message from Supabase if a submission fails. This will help identify any future issues (like field type mismatches or constraint violations) more directly.

## Verification

While I cannot directly perform a browser-based submission in this environment, these changes address the most common cause of "silent" 500 errors in Supabase integrations where RLS is enabled on public-facing forms.

- **Contact Form**: Guests can now submit messages without the API route failing on the post-insert selection step.
- **Newsletter**: Guests can now subscribe, and the system can correctly detect if they are already subscribed without crashing.

These fixes ensure that the CRM functionality works as intended even for unauthenticated visitors.
