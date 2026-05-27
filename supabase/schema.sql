-- ============================================================
-- Nightlife Events — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Admin Users ──────────────────────────────────────────────
-- Stores hashed credentials for admin dashboard access.
-- NextAuth sessions are validated against this table.
create table if not exists admin_users (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  password    text not null,       -- bcrypt hash
  name        text,
  created_at  timestamptz default now()
);

-- ── Events ───────────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  description   text,
  venue         text not null,
  venue_address text,
  event_date    timestamptz not null,
  doors_open    timestamptz,
  image_url     text,
  status        text not null default 'draft'
                check (status in ('draft', 'published', 'cancelled', 'past')),
  featured      boolean default false,
  age_restriction text default '21+',
  dress_code    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Ticket Tiers ─────────────────────────────────────────────
-- Each event can have multiple tiers (GA, VIP1, VIP2, etc.)
create table if not exists ticket_tiers (
  id                uuid primary key default uuid_generate_v4(),
  event_id          uuid not null references events(id) on delete cascade,
  name              text not null,            -- e.g. "General Admission", "VIP Tier 1"
  description       text,
  price_cents       integer not null,         -- stored in cents to avoid float issues
  quantity_total    integer not null,
  quantity_sold     integer not null default 0,
  is_vip            boolean default false,
  perks             text[],                   -- array of perk strings
  stripe_price_id   text,                     -- Stripe Price object ID
  sort_order        integer default 0,
  sale_starts_at    timestamptz,
  sale_ends_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  constraint positive_price check (price_cents >= 0),
  constraint positive_quantity check (quantity_total >= 0)
);

-- ── Orders ───────────────────────────────────────────────────
create table if not exists orders (
  id                    uuid primary key default uuid_generate_v4(),
  stripe_session_id     text unique,           -- Stripe Checkout Session ID
  stripe_payment_intent text,
  customer_email        text not null,
  customer_name         text,
  status                text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed', 'refunded')),
  total_cents           integer not null,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── Order Items ──────────────────────────────────────────────
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  ticket_tier_id  uuid not null references ticket_tiers(id),
  quantity        integer not null default 1,
  unit_price_cents integer not null,
  created_at      timestamptz default now(),
  constraint positive_quantity check (quantity > 0)
);

-- ── Atomic inventory increment (called by Stripe webhook) ───
-- Using a dedicated function prevents race conditions when
-- multiple purchases complete at the same time.
create or replace function increment_tier_sold(tier_id uuid, amount integer)
returns void as $$
begin
  update ticket_tiers
  set quantity_sold = quantity_sold + amount
  where id = tier_id
    and quantity_sold + amount <= quantity_total;

  if not found then
    raise exception 'Insufficient inventory for tier %', tier_id;
  end if;
end;
$$ language plpgsql security definer;

-- ── Updated-at triggers ──────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute function set_updated_at();

create trigger ticket_tiers_updated_at
  before update on ticket_tiers
  for each row execute function set_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ── Row-level security ───────────────────────────────────────
-- Public reads on published events and their tiers; all writes require service role.
alter table events enable row level security;
alter table ticket_tiers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Published events are publicly readable
create policy "Public can read published events"
  on events for select
  using (status = 'published');

-- Ticket tiers for published events are publicly readable
create policy "Public can read tiers for published events"
  on ticket_tiers for select
  using (
    exists (
      select 1 from events e
      where e.id = ticket_tiers.event_id
      and e.status = 'published'
    )
  );

-- Service role bypasses RLS for all admin operations
-- (SUPABASE_SERVICE_ROLE_KEY grants this automatically)

-- ── Sample seed data ─────────────────────────────────────────
-- Uncomment to seed example events after initial setup:
/*
insert into events (slug, name, tagline, description, venue, venue_address, event_date, doors_open, status, featured, age_restriction, dress_code)
values
  ('electric-dreams-vol3',
   'Electric Dreams Vol. 3',
   'The city''s hottest underground electronic night returns',
   'Join us for an unforgettable evening of cutting-edge electronic music featuring world-class DJs, immersive visuals, and an atmosphere unlike anything you''ve experienced. Electric Dreams Vol. 3 pushes the boundaries of nightlife.',
   'Warehouse 23',
   '23 Industrial Blvd, Suite 100',
   now() + interval '14 days',
   now() + interval '14 days' - interval '1 hour',
   'published',
   true,
   '21+',
   'Dress to impress — no athletic wear'),

  ('rooftop-sessions-june',
   'Rooftop Sessions: June',
   'Sunset cocktails, live sets, panoramic city views',
   'Experience the magic of a summer rooftop event with handcrafted cocktails, live DJ sets, and breathtaking views of the city skyline.',
   'Sky Lounge at The Grand',
   '500 Main St, 40th Floor',
   now() + interval '21 days',
   now() + interval '21 days' - interval '30 minutes',
   'published',
   false,
   '21+',
   'Smart casual');
*/
