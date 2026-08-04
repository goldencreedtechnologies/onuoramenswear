create extension if not exists "pgcrypto";

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.customer_profiles(id) on delete cascade,
  label text not null default 'Primary',
  recipient_name text,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state_region text,
  postal_code text,
  country_code text not null,
  country_name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  code text primary key,
  name text not null,
  country_codes text[] not null default '{}',
  city_patterns text[] not null default '{}',
  base_rate_usd numeric(10,2) not null default 0,
  per_item_rate_usd numeric(10,2) not null default 0,
  estimated_min_days integer not null default 1,
  estimated_max_days integer not null default 7,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_methods (
  id uuid primary key default gen_random_uuid(),
  zone_code text not null references public.delivery_zones(code) on delete cascade,
  code text not null,
  name text not null,
  description text,
  provider text not null default 'manual',
  base_rate_usd numeric(10,2) not null default 0,
  per_item_rate_usd numeric(10,2) not null default 0,
  estimated_min_days integer not null default 1,
  estimated_max_days integer not null default 7,
  requires_distance boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (zone_code, code)
);

create table if not exists public.delivery_quotes (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid references public.customer_profiles(id) on delete set null,
  delivery_method_id uuid references public.delivery_methods(id) on delete set null,
  email text,
  shipping_country text not null,
  shipping_city text not null,
  shipping_address text not null,
  item_count integer not null default 1 check (item_count > 0),
  subtotal_usd numeric(10,2) not null default 0,
  delivery_zone_code text not null,
  delivery_method_code text not null,
  delivery_method_name text not null,
  shipping_usd numeric(10,2) not null default 0,
  currency text not null default 'USD',
  estimated_min_days integer not null default 1,
  estimated_max_days integer not null default 7,
  distance_km numeric(10,2),
  quote_source text not null default 'fallback',
  requires_manual_review boolean not null default false,
  note text not null default '',
  status text not null default 'quoted',
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists customer_profile_id uuid,
  add column if not exists delivery_quote_id uuid,
  add column if not exists delivery_method_id uuid,
  add column if not exists delivery_zone_code text,
  add column if not exists delivery_method_code text,
  add column if not exists delivery_method_name text,
  add column if not exists delivery_distance_km numeric(10,2),
  add column if not exists shipping_status text not null default 'not_started';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_customer_profile_id_fkey'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_customer_profile_id_fkey
      foreign key (customer_profile_id) references public.customer_profiles(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_delivery_quote_id_fkey'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_delivery_quote_id_fkey
      foreign key (delivery_quote_id) references public.delivery_quotes(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_delivery_method_id_fkey'
    and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_delivery_method_id_fkey
      foreign key (delivery_method_id) references public.delivery_methods(id) on delete set null;
  end if;
end $$;

alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.delivery_methods enable row level security;
alter table public.delivery_quotes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_profiles' and policyname = 'Service role can manage customer profiles') then
    create policy "Service role can manage customer profiles"
      on public.customer_profiles
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_profiles' and policyname = 'Customers can read their own profile') then
    create policy "Customers can read their own profile"
      on public.customer_profiles
      for select
      using (auth_user_id = (select auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_profiles' and policyname = 'Customers can create their own profile') then
    create policy "Customers can create their own profile"
      on public.customer_profiles
      for insert
      with check (auth_user_id = (select auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_profiles' and policyname = 'Customers can update their own profile') then
    create policy "Customers can update their own profile"
      on public.customer_profiles
      for update
      using (auth_user_id = (select auth.uid()))
      with check (auth_user_id = (select auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'Service role can manage customer addresses') then
    create policy "Service role can manage customer addresses"
      on public.customer_addresses
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'Customers can manage their own addresses') then
    create policy "Customers can manage their own addresses"
      on public.customer_addresses
      for all
      using (
        exists (
          select 1
          from public.customer_profiles profile
          where profile.id = customer_profile_id
          and profile.auth_user_id = (select auth.uid())
        )
      )
      with check (
        exists (
          select 1
          from public.customer_profiles profile
          where profile.id = customer_profile_id
          and profile.auth_user_id = (select auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'delivery_zones' and policyname = 'Public can read active delivery zones') then
    create policy "Public can read active delivery zones"
      on public.delivery_zones
      for select
      using (active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'delivery_methods' and policyname = 'Public can read active delivery methods') then
    create policy "Public can read active delivery methods"
      on public.delivery_methods
      for select
      using (active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'delivery_quotes' and policyname = 'Service role can manage delivery quotes') then
    create policy "Service role can manage delivery quotes"
      on public.delivery_quotes
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'delivery_quotes' and policyname = 'Customers can read their own delivery quotes') then
    create policy "Customers can read their own delivery quotes"
      on public.delivery_quotes
      for select
      using (
        exists (
          select 1
          from public.customer_profiles profile
          where profile.id = customer_profile_id
          and profile.auth_user_id = (select auth.uid())
        )
      );
  end if;
end $$;

create index if not exists customer_profiles_auth_user_id_idx
  on public.customer_profiles (auth_user_id);

create index if not exists customer_addresses_customer_profile_id_idx
  on public.customer_addresses (customer_profile_id);

create index if not exists delivery_methods_zone_code_idx
  on public.delivery_methods (zone_code);

create index if not exists delivery_quotes_customer_profile_id_idx
  on public.delivery_quotes (customer_profile_id);

create index if not exists delivery_quotes_delivery_method_id_idx
  on public.delivery_quotes (delivery_method_id);

create index if not exists delivery_quotes_expires_at_idx
  on public.delivery_quotes (expires_at);

create index if not exists orders_customer_profile_id_idx
  on public.orders (customer_profile_id);

create index if not exists orders_delivery_quote_id_idx
  on public.orders (delivery_quote_id);

create index if not exists orders_delivery_method_id_idx
  on public.orders (delivery_method_id);

insert into public.delivery_zones (
  code,
  name,
  country_codes,
  city_patterns,
  base_rate_usd,
  per_item_rate_usd,
  estimated_min_days,
  estimated_max_days
)
values
  ('NG_DOMESTIC', 'Nigeria domestic delivery', array['NG'], array['lagos','abuja','port harcourt'], 8, 2, 1, 4),
  ('GLOBAL_EXPORT', 'Global export delivery', array['US','GB','CA','GH','ZA','KE','AE','AU','DE','FR','IT','ES','NL','IE'], array[]::text[], 30, 4, 4, 12)
on conflict (code) do update set
  name = excluded.name,
  country_codes = excluded.country_codes,
  city_patterns = excluded.city_patterns,
  base_rate_usd = excluded.base_rate_usd,
  per_item_rate_usd = excluded.per_item_rate_usd,
  estimated_min_days = excluded.estimated_min_days,
  estimated_max_days = excluded.estimated_max_days,
  updated_at = now();

insert into public.delivery_methods (
  zone_code,
  code,
  name,
  description,
  provider,
  base_rate_usd,
  per_item_rate_usd,
  estimated_min_days,
  estimated_max_days,
  requires_distance
)
values
  ('NG_DOMESTIC', 'premium-local', 'Premium local delivery', 'Local courier delivery for Nigerian orders.', 'manual', 8, 2, 1, 4, true),
  ('GLOBAL_EXPORT', 'international-express', 'International express delivery', 'Tracked international delivery for export orders.', 'manual', 30, 4, 4, 12, true)
on conflict (zone_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  provider = excluded.provider,
  base_rate_usd = excluded.base_rate_usd,
  per_item_rate_usd = excluded.per_item_rate_usd,
  estimated_min_days = excluded.estimated_min_days,
  estimated_max_days = excluded.estimated_max_days,
  requires_distance = excluded.requires_distance,
  updated_at = now();
