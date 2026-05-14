# Supabase Setup

1. Open Supabase SQL Editor and run:
   - `supabase/schema.sql`

2. In `index.html`, set:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`

3. Deploy the email function:
   - `supabase functions deploy send-booking-confirmation`
   - Set secrets:
     - `supabase secrets set RESEND_API_KEY=...`
     - `supabase secrets set FROM_EMAIL=reservations@yourdomain.com`

4. Optional hardening:
   - Replace demo admin credentials in `index.html` with env-backed auth.
   - Tighten SELECT RLS for admin-only reads if public visibility is not desired.