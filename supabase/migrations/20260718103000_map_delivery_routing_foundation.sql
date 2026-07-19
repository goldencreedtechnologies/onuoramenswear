create table if not exists public.delivery_origins (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state_region text,
  postal_code text,
  country_code text not null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  primary_origin boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_methods
  add column if not exists carrier_code text,
  add column if not exists per_km_rate_usd numeric(10,2) not null default 0,
  add column if not exists minimum_rate_usd numeric(10,2),
  add column if not exists maximum_rate_usd numeric(10,2),
  add column if not exists free_shipping_threshold_usd numeric(10,2);

alter table public.delivery_quotes
  add column if not exists origin_id uuid,
  add column if not exists origin_code text,
  add column if not exists origin_city text,
  add column if not exists origin_country_code text,
  add column if not exists origin_latitude numeric(10,7),
  add column if not exists origin_longitude numeric(10,7),
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists destination_latitude numeric(10,7),
  add column if not exists destination_longitude numeric(10,7),
  add column if not exists carrier_code text,
  add column if not exists route_provider text,
  add column if not exists route_distance_meters integer,
  add column if not exists route_duration_seconds integer,
  add column if not exists route_confidence text not null default 'manual_review',
  add column if not exists map_url text;

alter table public.orders
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text,
  add column if not exists carrier_code text,
  add column if not exists route_provider text,
  add column if not exists route_duration_seconds integer,
  add column if not exists map_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'delivery_quotes_origin_id_fkey'
    and conrelid = 'public.delivery_quotes'::regclass
  ) then
    alter table public.delivery_quotes
      add constraint delivery_quotes_origin_id_fkey
      foreign key (origin_id) references public.delivery_origins(id) on delete set null;
  end if;
end $$;

alter table public.delivery_origins enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'delivery_origins'
    and policyname = 'Service role can manage delivery origins'
  ) then
    create policy "Service role can manage delivery origins"
      on public.delivery_origins
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;
end $$;

create index if not exists delivery_origins_active_primary_idx
  on public.delivery_origins (active, primary_origin);

create index if not exists delivery_quotes_origin_id_idx
  on public.delivery_quotes (origin_id);

create index if not exists delivery_quotes_route_provider_idx
  on public.delivery_quotes (route_provider);

create index if not exists delivery_quotes_status_created_at_idx
  on public.delivery_quotes (status, created_at desc);

create index if not exists orders_shipping_status_created_at_idx
  on public.orders (shipping_status, created_at desc);

insert into public.delivery_origins (
  code,
  name,
  address_line1,
  city,
  state_region,
  country_code,
  latitude,
  longitude,
  primary_origin
)
values (
  'lagos-studio',
  'ONUORA Lagos fulfilment studio',
  'Fulfilment address pending',
  'Lagos',
  'Lagos',
  'NG',
  6.5244,
  3.3792,
  true
)
on conflict (code) do update set
  name = excluded.name,
  address_line1 = excluded.address_line1,
  city = excluded.city,
  state_region = excluded.state_region,
  country_code = excluded.country_code,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  primary_origin = excluded.primary_origin,
  active = true,
  updated_at = now();

update public.delivery_methods
set
  carrier_code = 'manual-local',
  per_km_rate_usd = 0.14,
  minimum_rate_usd = 8,
  maximum_rate_usd = 28,
  free_shipping_threshold_usd = null,
  updated_at = now()
where zone_code = 'NG_DOMESTIC'
and code = 'premium-local';

update public.delivery_methods
set
  carrier_code = 'manual-global',
  per_km_rate_usd = 0,
  minimum_rate_usd = null,
  maximum_rate_usd = null,
  free_shipping_threshold_usd = 500,
  updated_at = now()
where zone_code = 'GLOBAL_EXPORT'
and code = 'international-express';
