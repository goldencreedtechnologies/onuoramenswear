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

alter table public.admin_users enable row level security;
alter table public.admin_activity_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'admin_users'
    and policyname = 'Service role can manage admin users'
  ) then
    create policy "Service role can manage admin users"
      on public.admin_users
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'admin_activity_logs'
    and policyname = 'Service role can manage admin activity logs'
  ) then
    create policy "Service role can manage admin activity logs"
      on public.admin_activity_logs
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;
end $$;

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
