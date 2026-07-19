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

alter table public.order_events enable row level security;
alter table public.notification_queue enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_events' and policyname = 'Service role can manage order events') then
    create policy "Service role can manage order events"
      on public.order_events
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_events' and policyname = 'Customers can read visible order events') then
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
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notification_queue' and policyname = 'Service role can manage notification queue') then
    create policy "Service role can manage notification queue"
      on public.notification_queue
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;
end $$;

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
