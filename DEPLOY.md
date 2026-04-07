# JUT Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Vercel account
- OpenAI API key
- (Optional) Stripe account, Meta Developer account

---

## Step 1 — Supabase Setup

### 1.1 Create project
1. Go to https://supabase.com → New Project
2. Choose a region closest to your users (us-east-1 for US, sa-east-1 for Colombia)
3. Save your database password

### 1.2 Run schema
1. Supabase Dashboard → SQL Editor → New Query
2. Paste contents of `supabase/schema.sql`
3. Click Run (should show "Success")

### 1.3 Configure Auth
1. Authentication → Providers → Email: **Enable**
2. Authentication → Providers → Google (optional):
   - Create Google OAuth app at console.cloud.google.com
   - Add Client ID and Secret
3. Authentication → URL Configuration:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/api/auth/callback`

### 1.4 Get your keys
Dashboard → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Local Development

```bash
git clone https://github.com/your-org/jut.git
cd jut
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
# → http://localhost:3000
```

### Seed test data
1. Sign up at http://localhost:3000/en/signup
2. Supabase SQL Editor: `SELECT id FROM auth.users LIMIT 1;`
3. Copy UUID, replace `YOUR_USER_ID_HERE` in `supabase/seed.sql`
4. Run `supabase/seed.sql` in SQL Editor

---

## Step 3 — Deploy to Vercel

### 3.1 Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### 3.2 Deploy
```bash
cd jut
vercel
# Follow prompts — select "Next.js" framework
```

### 3.3 Set environment variables
```bash
# Or use Vercel Dashboard → Settings → Environment Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL  # your production URL
vercel env add META_WEBHOOK_VERIFY_TOKEN  # any random string
```

### 3.4 Deploy production
```bash
vercel --prod
```

---

## Step 4 — Instagram / Meta Integration

### 4.1 Create Meta App
1. https://developers.facebook.com → My Apps → Create App
2. App type: **Business**
3. Add products: **Instagram Graph API** + **Webhooks**

### 4.2 Configure Instagram OAuth
1. Instagram Basic Display → Settings:
   - Valid OAuth Redirect URIs: `https://your-domain.com/api/integrations/instagram/callback`
   - Deauthorize Callback URL: `https://your-domain.com/api/integrations/instagram/deauth`
2. Add your Meta App ID and Secret to Vercel env vars

### 4.3 Configure Webhooks
1. Webhooks → New Subscription → Instagram
2. Callback URL: `https://your-domain.com/api/webhooks/instagram`
3. Verify Token: same as `META_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to: `comments`, `messages`

---

## Step 5 — Stripe Integration

### 5.1 Get keys
1. https://dashboard.stripe.com → API Keys
2. Add to Vercel env vars

### 5.2 Set up webhook
```bash
# Install Stripe CLI
stripe listen --forward-to https://your-domain.com/api/stripe/webhook
```
Or via Dashboard:
1. Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 6 — Custom Domain

### Vercel
1. Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as shown

### Supabase
Update Site URL and Redirect URLs with your new domain.

---

## Environment Variables Reference

| Variable | Required | Where to get |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase → Settings → API |
| `OPENAI_API_KEY` | ✅ | platform.openai.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your deployment URL |
| `META_APP_ID` | For Instagram | developers.facebook.com |
| `META_APP_SECRET` | For Instagram | developers.facebook.com |
| `META_WEBHOOK_VERIFY_TOKEN` | For Instagram | Any string you choose |
| `STRIPE_SECRET_KEY` | For payments | dashboard.stripe.com |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | dashboard.stripe.com |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook settings |

---

## Architecture Notes

### Frontend (Vercel)
- Next.js 14 App Router
- All pages and API routes
- Handles auth via Supabase SSR
- Edge middleware for locale + auth routing

### Database (Supabase)
- PostgreSQL with Row Level Security
- Realtime subscriptions for messages + notifications
- Auto-triggers for profile creation and `updated_at`

### AI (OpenAI)
- GPT-4o-mini for all responses (cost-efficient)
- System prompt built dynamically from business config
- All runs logged in `ai_runs` table

### Payments (Stripe)
- Checkout Sessions for product sales
- Webhook confirms payment → updates order status

### Social (Meta)
- Instagram Graph API for DMs and comments
- Webhook receives real-time comment/message events
- OAuth flow stores long-lived tokens per user

---

## Production Checklist

- [ ] Schema deployed to Supabase
- [ ] RLS policies active (check in Supabase → Table Editor)
- [ ] Google OAuth configured (optional)
- [ ] OpenAI key set in Vercel
- [ ] Vercel deployment successful
- [ ] Custom domain configured
- [ ] Instagram app submitted for review (for production use)
- [ ] Stripe webhook verified
- [ ] Send a test lead through the system end-to-end

---

## Support

For issues, open a GitHub issue or contact the JUT team.
