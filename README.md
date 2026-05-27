# PulseEvents — Nightlife & Events Platform

A production-ready, full-stack events ticketing platform built with Next.js 14, Supabase, Stripe, and NextAuth.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js (Credentials provider) |
| Payments | Stripe Checkout |
| Deployment | Vercel |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd nightlife-events
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role" key (keep secret) |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Same page, Secret key |
| `STRIPE_WEBHOOK_SECRET` | See step 5 |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password |

### 3. Set up the database

In your Supabase project, open the **SQL Editor** and run `supabase/schema.sql` in full.

This creates:
- `events` table
- `ticket_tiers` table
- `orders` + `order_items` tables
- `admin_users` table
- Row-level security policies
- `increment_tier_sold` RPC for atomic inventory updates

### 4. Seed the admin user

```bash
npx tsx scripts/seed-admin.ts
```

This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env.local` and creates the first admin.

### 5. Set up Stripe webhook (local)

Install the Stripe CLI, then:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints (starts with `whsec_`) into `STRIPE_WEBHOOK_SECRET`.

### 6. Run locally

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin
- Login page: http://localhost:3000/login

---

## Project Structure

```
nightlife-events/
├── app/
│   ├── (public)/              # Public-facing pages
│   │   ├── page.tsx           # Homepage hero + featured events
│   │   ├── events/
│   │   │   ├── page.tsx       # Event listings with filter
│   │   │   └── [slug]/        # Individual event + ticket purchase
│   │   └── purchase/
│   │       ├── success/       # Post-purchase confirmation
│   │       └── cancel/        # Cancelled checkout
│   ├── admin/                 # Protected admin dashboard
│   │   ├── layout.tsx         # Admin shell with sidebar
│   │   ├── page.tsx           # Dashboard with sales stats
│   │   └── events/            # Event CRUD
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [id]/edit/
│   ├── api/
│   │   ├── auth/[...nextauth] # NextAuth handler
│   │   ├── events/            # Event + tier CRUD API
│   │   ├── checkout/          # Stripe Checkout session creation
│   │   └── webhooks/stripe/   # Stripe webhook handler
│   └── login/                 # Admin login page (outside admin shell)
├── components/
│   ├── ui/                    # Button, Input, Card, Badge, Textarea
│   ├── events/                # EventCard, CountdownTimer, TicketTierCard, CheckoutPanel
│   ├── admin/                 # AdminSidebar, EventForm, TicketTierForm
│   └── layout/                # Navbar, Footer
├── lib/
│   ├── supabase.ts            # Supabase client (public + admin)
│   ├── stripe.ts              # Stripe singleton
│   ├── auth.ts                # NextAuth config
│   └── utils.ts               # Formatters, helpers
├── types/
│   ├── index.ts               # App-level types
│   ├── database.ts            # Supabase table types
│   └── next-auth.d.ts         # Session type augmentation
├── supabase/
│   └── schema.sql             # Complete database schema
├── scripts/
│   └── seed-admin.ts          # Creates initial admin user
└── middleware.ts              # Protects /admin/* routes
```

---

## Key Architecture Decisions

### Security
- **Stripe secret key** is never sent to the client. All Stripe API calls are in API routes (`/api/checkout`, `/api/webhooks/stripe`).
- **Admin routes** are double-protected: Next.js middleware redirects unauthenticated users at the edge, and every API route checks `getServerSession()`.
- **Service role key** is only used in server-side code (API routes, server components using `createAdminClient()`). Public pages use the anon key with RLS.
- **Webhook signature verification** ensures only genuine Stripe events trigger inventory updates.

### Inventory Management
- `quantity_sold` is incremented via a Postgres `security definer` function (`increment_tier_sold`) that atomically checks capacity. This prevents overselling even under concurrent purchases.
- The checkout API validates inventory **before** creating the Stripe session.
- The webhook handler updates inventory only on `checkout.session.completed`.

### Data Flow (Purchase)
1. User selects tickets → `CheckoutPanel` posts to `/api/checkout`
2. API validates inventory, creates a `pending` order, then creates a Stripe Checkout session
3. User completes payment on Stripe's hosted page
4. Stripe fires `checkout.session.completed` webhook → `/api/webhooks/stripe`
5. Webhook marks order `paid`, increments `quantity_sold` per tier
6. User lands on `/purchase/success`; Stripe sends receipt email

---

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repo in Vercel
3. Add all `.env.local` variables as Vercel Environment Variables
4. Set `NEXTAUTH_URL` to your production domain (e.g. `https://yourapp.vercel.app`)
5. Set `NEXT_PUBLIC_APP_URL` to the same production URL
6. In Stripe Dashboard, create a **production webhook** pointing to `https://yourdomain.com/api/webhooks/stripe` with the events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
7. Update `STRIPE_WEBHOOK_SECRET` with the production webhook secret
8. Deploy!

---

## Admin Guide

### Creating an Event
1. Go to `/admin/events/new`
2. Fill in name, venue, date — save as **Draft** initially
3. After saving, add **Ticket Tiers** from the edit page
4. Set pricing, quantity, and optional VIP perks per tier
5. Toggle status to **Published** when ready to go live

### Monitoring Sales
The dashboard shows:
- Total revenue (paid orders only)
- Tickets sold across all events
- Per-event capacity bars (color coded: green/yellow/red)

### Ticket Tiers
- **Sort order**: lower = displayed first on the event page
- **VIP**: shown with gold styling and a crown badge
- **Perks**: bullet-point list shown on the ticket selection card
- Deleting a tier is permanent — only delete tiers with no sales
