create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  edition text not null,
  meaning text not null,
  price text not null,
  image text not null,
  images text[] not null default '{}',
  palette text not null,
  page_text text not null,
  page_muted text not null,
  page_panel text not null,
  dark_page boolean not null default false,
  story text not null,
  story_kicker text not null,
  story_title text not null,
  occasion text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  phone text,
  currency text not null default 'USD',
  shipping_country text,
  shipping_city text,
  shipping_address text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  quantity integer not null check (quantity > 0),
  size text not null,
  unit_price_usd numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public can read products"
  on public.products
  for select
  using (true);

create policy "Service role can manage orders"
  on public.orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage order items"
  on public.order_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
