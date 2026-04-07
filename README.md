# JUT — AI-Powered Commercial Operations Platform

> Automate every conversation. Close every deal.

JUT is a premium AI-powered platform that automates messages, captures leads, manages conversations, and drives sales across social media and messaging channels. Built bilingual from day one — English (🇺🇸) and Colombian Spanish (🇨🇴).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom design system |
| Auth & DB | Supabase (Postgres + RLS + Realtime) |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe |
| i18n | next-intl (EN + ES) |
| Deployment | Vercel (frontend) |

---

## Quick Start

### 1. Clone and install
```bash
git clone https://github.com/your-org/jut.git
cd jut
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase, OpenAI, and Stripe keys
```

### 3. Set up Supabase
1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Enable **Email Auth** in Authentication → Providers
4. (Optional) Enable **Google Auth** for social login
5. Copy your Project URL and Anon Key to `.env.local`

### 4. Run locally
```bash
npm run dev
# → http://localhost:3000
# → Redirects to /en (or /es)
```

---

## Project Structure

```
jut/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              ← Landing page (bilingual)
│   │   ├── layout.tsx            ← next-intl provider
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx        ← Auth-protected shell
│   │       ├── dashboard/        ← Overview
│   │       ├── leads/            ← CRM module
│   │       ├── conversations/    ← Inbox + chat
│   │       ├── automations/      ← Automation builder
│   │       ├── social/           ← Comment triggers
│   │       ├── sales/            ← Products + orders
│   │       ├── business/         ← AI configuration
│   │       ├── analytics/        ← Analytics
│   │       └── settings/         ← Account + integrations
│   └── api/
│       ├── ai/chat/              ← AI response endpoint
│       ├── leads/                ← Leads CRUD
│       ├── conversations/        ← Conversations CRUD
│       ├── automations/          ← Automations CRUD
│       ├── orders/               ← Orders CRUD
│       └── webhooks/instagram/   ← Meta webhook handler
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── StatCard.tsx
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser client
│   │   └── server.ts             ← Server client + helpers
│   ├── ai/
│   │   └── client.ts             ← OpenAI service layer
│   └── automation/
│       └── engine.ts             ← Trigger/action processor
├── messages/
│   ├── en.json                   ← English translations
│   └── es.json                   ← Colombian Spanish translations
├── hooks/
│   ├── useLocale.ts
│   └── useSupabase.ts
├── types/
│   └── index.ts                  ← All TypeScript types
├── supabase/
│   └── schema.sql                ← Full DB schema + RLS
├── i18n.ts                       ← next-intl config
└── middleware.ts                 ← Auth protection + locale routing
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | For webhooks/server operations |
| `OPENAI_API_KEY` | ✅ | GPT-4o-mini for AI responses |
| `STRIPE_SECRET_KEY` | ⚠️ | For payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ | For frontend Stripe |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | For Stripe webhook verification |
| `META_APP_ID` | ⚠️ | Instagram/Facebook app |
| `META_APP_SECRET` | ⚠️ | Meta app secret |
| `META_WEBHOOK_VERIFY_TOKEN` | ⚠️ | Any string you choose |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL |

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add OPENAI_API_KEY
# ... (all variables from .env.example)
```

### Instagram Webhook Setup (after deploy)
1. Go to https://developers.facebook.com → Your App → Webhooks
2. Subscribe to: `messages`, `comments`, `feed`
3. Set Callback URL to: `https://your-domain.com/api/webhooks/instagram`
4. Set Verify Token to the value in `META_WEBHOOK_VERIFY_TOKEN`

---

## Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `profiles` | User account + plan info |
| `business_configs` | AI/automation configuration per user |
| `leads` | CRM leads with status, stage, tags |
| `lead_activities` | Timeline of lead interactions |
| `conversations` | Chat threads per channel |
| `messages` | Individual messages in a thread |
| `automations` | Automation definitions (trigger + actions) |
| `automation_runs` | Execution log per automation |
| `social_triggers` | Instagram/Facebook comment triggers |
| `products` | Product/service catalog |
| `orders` | Sales orders and transactions |
| `ai_runs` | AI response logs + token usage |
| `integrations` | Connected social/payment accounts |

All tables have **Row Level Security** — users only see their own data.

---

## i18n — Adding Translations

All copy lives in `messages/en.json` and `messages/es.json`. To add a new string:

```json
// messages/en.json
{ "mySection": { "myKey": "My English text" } }

// messages/es.json  
{ "mySection": { "myKey": "Mi texto en español" } }
```

Use in server components:
```typescript
const t = await getTranslations('mySection')
t('myKey')
```

Use in client components:
```typescript
const t = useTranslations('mySection')
t('myKey')
```

---

## Key Architecture Decisions

- **No n8n** — automation engine is built in code (`lib/automation/engine.ts`)
- **next-intl** for i18n — URL-based locale routing (`/en/...`, `/es/...`)
- **Supabase RLS** — all DB access is scoped to the authenticated user
- **Service role** only used in API routes and webhooks, never client-side
- **OpenAI abstraction** — swap models easily in `lib/ai/client.ts`
- **Modular pages** — each dashboard module is fully independent

---

## Roadmap (Post V1)

- [ ] Real Instagram Graph API integration (OAuth flow)
- [ ] WhatsApp Business API integration  
- [ ] Visual automation flow builder (drag & drop)
- [ ] Stripe payment link generation in conversations
- [ ] Voice/calling module foundation
- [ ] Multi-account / agency mode
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Mobile app (React Native)

---

## Brand

- **Primary Pink:** `#ED1966`
- **Primary Blue:** `#2152A4`  
- **Display Font:** Syne (headings)
- **Body Font:** DM Sans
- **Design:** Dark-dominant, premium, high-contrast

---

© 2025 JUT. All rights reserved.
