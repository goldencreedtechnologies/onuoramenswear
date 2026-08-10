create sequence if not exists public.onuora_tracking_number_seq;

alter table public.orders
  add column if not exists tracking_id text,
  add column if not exists tracking_status text not null default 'order_received',
  add column if not exists tracking_updated_at timestamptz not null default now();

update public.orders
set tracking_id = 'TRK-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('public.onuora_tracking_number_seq')::text, 8, '0')
where tracking_id is null;

alter table public.orders
  alter column tracking_id set default ('TRK-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.onuora_tracking_number_seq')::text, 8, '0')),
  alter column tracking_id set not null;

create unique index if not exists orders_tracking_id_key on public.orders (tracking_id);
create index if not exists orders_tracking_lookup_idx on public.orders (tracking_id, email);
create index if not exists orders_tracking_status_idx on public.orders (tracking_status, tracking_updated_at desc);

alter table public.orders
  drop constraint if exists orders_tracking_status_check;

alter table public.orders
  add constraint orders_tracking_status_check
  check (tracking_status in (
    'order_received',
    'order_confirmed',
    'preparing_order',
    'ready_for_dispatch',
    'dispatched',
    'in_transit',
    'out_for_delivery',
    'delivered'
  ));
