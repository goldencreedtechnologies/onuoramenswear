create table if not exists public.circle_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  country_region text not null,
  source text not null default 'modal'
    check (source in ('modal', 'homepage', 'footer')),
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists circle_subscribers_status_created_idx
  on public.circle_subscribers (status, created_at desc);

alter table public.circle_subscribers enable row level security;

comment on table public.circle_subscribers is
  'Email and country or region captured through the ONUORA Circle newsletter forms.';
