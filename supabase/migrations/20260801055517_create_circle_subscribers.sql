create table if not exists public.circle_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  country text not null,
  source text not null default 'website',
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circle_subscribers_email_length check (char_length(email) between 3 and 320),
  constraint circle_subscribers_country_length check (char_length(country) between 2 and 100)
);

alter table public.circle_subscribers enable row level security;
revoke all on table public.circle_subscribers from anon, authenticated;
