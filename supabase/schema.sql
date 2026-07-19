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

create table if not exists public.product_inventory (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on delete cascade,
  size text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  sold_quantity integer not null default 0 check (sold_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, size)
);

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
  carrier_code text,
  base_rate_usd numeric(10,2) not null default 0,
  per_item_rate_usd numeric(10,2) not null default 0,
  per_km_rate_usd numeric(10,2) not null default 0,
  minimum_rate_usd numeric(10,2),
  maximum_rate_usd numeric(10,2),
  free_shipping_threshold_usd numeric(10,2),
  estimated_min_days integer not null default 1,
  estimated_max_days integer not null default 7,
  requires_distance boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (zone_code, code)
);

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

create table if not exists public.delivery_quotes (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid references public.customer_profiles(id) on delete set null,
  delivery_method_id uuid references public.delivery_methods(id) on delete set null,
  origin_id uuid references public.delivery_origins(id) on delete set null,
  email text,
  shipping_country text not null,
  shipping_city text not null,
  shipping_state text,
  shipping_postal_code text,
  shipping_address text not null,
  destination_latitude numeric(10,7),
  destination_longitude numeric(10,7),
  origin_code text,
  origin_city text,
  origin_country_code text,
  origin_latitude numeric(10,7),
  origin_longitude numeric(10,7),
  item_count integer not null default 1 check (item_count > 0),
  subtotal_usd numeric(10,2) not null default 0,
  delivery_zone_code text not null,
  delivery_method_code text not null,
  delivery_method_name text not null,
  carrier_code text,
  shipping_usd numeric(10,2) not null default 0,
  currency text not null default 'USD',
  estimated_min_days integer not null default 1,
  estimated_max_days integer not null default 7,
  distance_km numeric(10,2),
  route_provider text,
  route_distance_meters integer,
  route_duration_seconds integer,
  route_confidence text not null default 'manual_review',
  map_url text,
  quote_source text not null default 'fallback',
  requires_manual_review boolean not null default false,
  note text not null default '',
  status text not null default 'quoted',
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid references public.customer_profiles(id) on delete set null,
  delivery_quote_id uuid references public.delivery_quotes(id) on delete set null,
  delivery_method_id uuid references public.delivery_methods(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text,
  currency text not null default 'USD',
  shipping_country text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_address text,
  delivery_zone_code text,
  delivery_method_code text,
  delivery_method_name text,
  delivery_distance_km numeric(10,2),
  carrier_code text,
  route_provider text,
  route_duration_seconds integer,
  map_url text,
  shipping_status text not null default 'not_started',
  status text not null default 'draft',
  payment_provider text not null default 'stripe',
  payment_status text not null default 'unpaid',
  inventory_status text not null default 'pending',
  inventory_reserved_at timestamptz,
  inventory_released_at timestamptz,
  inventory_sold_at timestamptz,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  subtotal_usd numeric(10,2) not null default 0,
  shipping_usd numeric(10,2) not null default 0,
  total_usd numeric(10,2) not null default 0,
  paid_at timestamptz,
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

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  status text,
  payment_status text,
  shipping_status text,
  inventory_status text,
  note text,
  source text not null default 'system',
  visible_to_customer boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  customer_profile_id uuid references public.customer_profiles(id) on delete set null,
  channel text not null default 'email',
  template text not null,
  recipient text not null,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'staff',
  active boolean not null default true,
  invited_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz,
  check (role in ('owner', 'manager', 'fulfillment', 'support', 'staff'))
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_inventory enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.delivery_methods enable row level security;
alter table public.delivery_origins enable row level security;
alter table public.delivery_quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.notification_queue enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy "Public can read products"
  on public.products
  for select
  using (true);

create policy "Public can read active product inventory"
  on public.product_inventory
  for select
  using (active = true);

create policy "Service role can manage product inventory"
  on public.product_inventory
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Service role can manage customer profiles"
  on public.customer_profiles
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Customers can read their own profile"
  on public.customer_profiles
  for select
  using (auth_user_id = (select auth.uid()));

create policy "Customers can create their own profile"
  on public.customer_profiles
  for insert
  with check (auth_user_id = (select auth.uid()));

create policy "Customers can update their own profile"
  on public.customer_profiles
  for update
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

create policy "Service role can manage customer addresses"
  on public.customer_addresses
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

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

create policy "Public can read active delivery zones"
  on public.delivery_zones
  for select
  using (active = true);

create policy "Public can read active delivery methods"
  on public.delivery_methods
  for select
  using (active = true);

create policy "Service role can manage delivery origins"
  on public.delivery_origins
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Service role can manage delivery quotes"
  on public.delivery_quotes
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

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

create policy "Service role can manage orders"
  on public.orders
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Customers can read their own orders"
  on public.orders
  for select
  using (
    exists (
      select 1
      from public.customer_profiles profile
      where profile.id = customer_profile_id
      and profile.auth_user_id = (select auth.uid())
    )
  );

create policy "Service role can manage order items"
  on public.order_items
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Customers can read their own order items"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders customer_order
      join public.customer_profiles profile on profile.id = customer_order.customer_profile_id
      where customer_order.id = order_id
      and profile.auth_user_id = (select auth.uid())
    )
  );

create policy "Service role can manage order events"
  on public.order_events
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Customers can read visible order events"
  on public.order_events
  for select
  using (
    visible_to_customer = true
    and exists (
      select 1
      from public.orders customer_order
      join public.customer_profiles profile on profile.id = customer_order.customer_profile_id
      where customer_order.id = order_id
      and profile.auth_user_id = (select auth.uid())
    )
  );

create policy "Service role can manage notification queue"
  on public.notification_queue
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Service role can manage admin users"
  on public.admin_users
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "Service role can manage admin activity logs"
  on public.admin_activity_logs
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create unique index if not exists orders_stripe_checkout_session_id_key
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

create index if not exists orders_status_idx
  on public.orders (status);

create index if not exists orders_customer_profile_id_idx
  on public.orders (customer_profile_id);

create index if not exists orders_delivery_quote_id_idx
  on public.orders (delivery_quote_id);

create index if not exists orders_delivery_method_id_idx
  on public.orders (delivery_method_id);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_events_order_id_idx
  on public.order_events (order_id);

create index if not exists order_events_created_at_idx
  on public.order_events (created_at desc);

create index if not exists notification_queue_order_id_idx
  on public.notification_queue (order_id);

create index if not exists notification_queue_customer_profile_id_idx
  on public.notification_queue (customer_profile_id);

create index if not exists notification_queue_status_scheduled_at_idx
  on public.notification_queue (status, scheduled_at);

create index if not exists admin_users_auth_user_id_idx
  on public.admin_users (auth_user_id);

create index if not exists admin_users_active_role_idx
  on public.admin_users (active, role);

create index if not exists admin_activity_logs_admin_user_id_idx
  on public.admin_activity_logs (admin_user_id);

create index if not exists admin_activity_logs_target_idx
  on public.admin_activity_logs (target_type, target_id);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs (created_at desc);

create index if not exists orders_admin_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_admin_status_payment_shipping_idx
  on public.orders (status, payment_status, shipping_status, created_at desc);

create index if not exists product_inventory_admin_active_slug_size_idx
  on public.product_inventory (active, product_slug, size);

create index if not exists product_inventory_product_slug_idx
  on public.product_inventory (product_slug);

create index if not exists product_inventory_active_idx
  on public.product_inventory (active);

create index if not exists customer_profiles_auth_user_id_idx
  on public.customer_profiles (auth_user_id);

create index if not exists customer_addresses_customer_profile_id_idx
  on public.customer_addresses (customer_profile_id);

create index if not exists delivery_methods_zone_code_idx
  on public.delivery_methods (zone_code);

create index if not exists delivery_origins_active_primary_idx
  on public.delivery_origins (active, primary_origin);

create index if not exists delivery_quotes_customer_profile_id_idx
  on public.delivery_quotes (customer_profile_id);

create index if not exists delivery_quotes_delivery_method_id_idx
  on public.delivery_quotes (delivery_method_id);

create index if not exists delivery_quotes_origin_id_idx
  on public.delivery_quotes (origin_id);

create index if not exists delivery_quotes_expires_at_idx
  on public.delivery_quotes (expires_at);

create index if not exists delivery_quotes_route_provider_idx
  on public.delivery_quotes (route_provider);

create index if not exists delivery_quotes_status_created_at_idx
  on public.delivery_quotes (status, created_at desc);

create index if not exists orders_shipping_status_created_at_idx
  on public.orders (shipping_status, created_at desc);

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
  carrier_code,
  base_rate_usd,
  per_item_rate_usd,
  per_km_rate_usd,
  minimum_rate_usd,
  maximum_rate_usd,
  free_shipping_threshold_usd,
  estimated_min_days,
  estimated_max_days,
  requires_distance
)
values
  ('NG_DOMESTIC', 'premium-local', 'Premium local delivery', 'Local courier delivery for Nigerian orders.', 'manual', 'manual-local', 8, 2, 0.14, 8, 28, null, 1, 4, true),
  ('GLOBAL_EXPORT', 'international-express', 'International express delivery', 'Tracked international delivery for export orders.', 'manual', 'manual-global', 30, 4, 0, null, null, 500, 4, 12, true)
on conflict (zone_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  provider = excluded.provider,
  carrier_code = excluded.carrier_code,
  base_rate_usd = excluded.base_rate_usd,
  per_item_rate_usd = excluded.per_item_rate_usd,
  per_km_rate_usd = excluded.per_km_rate_usd,
  minimum_rate_usd = excluded.minimum_rate_usd,
  maximum_rate_usd = excluded.maximum_rate_usd,
  free_shipping_threshold_usd = excluded.free_shipping_threshold_usd,
  estimated_min_days = excluded.estimated_min_days,
  estimated_max_days = excluded.estimated_max_days,
  requires_distance = excluded.requires_distance,
  updated_at = now();

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

insert into public.product_inventory (product_slug, size, stock_quantity, low_stock_threshold)
select product.slug, size.label, 12, 3
from public.products product
cross join (values ('S'), ('M'), ('L'), ('XL'), ('XXL')) as size(label)
on conflict (product_slug, size) do nothing;

create or replace function public.reserve_order_inventory(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line_item record;
  inventory_row record;
begin
  if exists (
    select 1 from public.orders
    where id = target_order_id
    and inventory_status = 'reserved'
  ) then
    return;
  end if;

  for line_item in
    select product_slug, size, sum(quantity)::integer as required_quantity
    from public.order_items
    where order_id = target_order_id
    group by product_slug, size
  loop
    select id, stock_quantity, reserved_quantity
    into inventory_row
    from public.product_inventory
    where product_slug = line_item.product_slug
    and size = line_item.size
    and active = true
    for update;

    if not found or (inventory_row.stock_quantity - inventory_row.reserved_quantity) < line_item.required_quantity then
      raise exception 'INSUFFICIENT_STOCK:%:%', line_item.product_slug, line_item.size;
    end if;
  end loop;

  for line_item in
    select product_slug, size, sum(quantity)::integer as required_quantity
    from public.order_items
    where order_id = target_order_id
    group by product_slug, size
  loop
    update public.product_inventory
    set reserved_quantity = reserved_quantity + line_item.required_quantity,
        updated_at = now()
    where product_slug = line_item.product_slug
    and size = line_item.size
    and active = true;
  end loop;

  update public.orders
  set inventory_status = 'reserved',
      inventory_reserved_at = now(),
      inventory_released_at = null,
      updated_at = now()
  where id = target_order_id;
end;
$$;

create or replace function public.release_order_inventory(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line_item record;
begin
  if not exists (
    select 1 from public.orders
    where id = target_order_id
    and inventory_status = 'reserved'
  ) then
    return;
  end if;

  for line_item in
    select product_slug, size, sum(quantity)::integer as reserved_to_release
    from public.order_items
    where order_id = target_order_id
    group by product_slug, size
  loop
    update public.product_inventory
    set reserved_quantity = greatest(reserved_quantity - line_item.reserved_to_release, 0),
        updated_at = now()
    where product_slug = line_item.product_slug
    and size = line_item.size;
  end loop;

  update public.orders
  set inventory_status = 'released',
      inventory_released_at = now(),
      updated_at = now()
  where id = target_order_id;
end;
$$;

create or replace function public.mark_order_inventory_sold(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line_item record;
begin
  if exists (
    select 1 from public.orders
    where id = target_order_id
    and inventory_status = 'sold'
  ) then
    return;
  end if;

  for line_item in
    select product_slug, size, sum(quantity)::integer as sold_quantity
    from public.order_items
    where order_id = target_order_id
    group by product_slug, size
  loop
    update public.product_inventory
    set reserved_quantity = greatest(reserved_quantity - line_item.sold_quantity, 0),
        stock_quantity = greatest(stock_quantity - line_item.sold_quantity, 0),
        sold_quantity = sold_quantity + line_item.sold_quantity,
        updated_at = now()
    where product_slug = line_item.product_slug
    and size = line_item.size;
  end loop;

  update public.orders
  set inventory_status = 'sold',
      inventory_sold_at = now(),
      updated_at = now()
  where id = target_order_id;
end;
$$;

revoke execute on function public.reserve_order_inventory(uuid) from public, anon, authenticated;
revoke execute on function public.release_order_inventory(uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_inventory_sold(uuid) from public, anon, authenticated;
grant execute on function public.reserve_order_inventory(uuid) to service_role;
grant execute on function public.release_order_inventory(uuid) to service_role;
grant execute on function public.mark_order_inventory_sold(uuid) to service_role;
