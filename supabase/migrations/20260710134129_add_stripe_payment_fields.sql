alter table public.orders
  add column if not exists payment_provider text not null default 'stripe',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists subtotal_usd numeric(10,2) not null default 0,
  add column if not exists shipping_usd numeric(10,2) not null default 0,
  add column if not exists total_usd numeric(10,2) not null default 0,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_stripe_checkout_session_id_key
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

create index if not exists orders_status_idx
  on public.orders (status);
