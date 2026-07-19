alter table public.admin_users
  add column if not exists full_name text,
  add column if not exists username text,
  add column if not exists access_level text not null default 'admin',
  add column if not exists role_id uuid;

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_users_access_level_check'
    and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_access_level_check
      check (access_level in ('super_admin', 'admin'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_users_username_key'
    and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_username_key unique (username);
  end if;
end $$;

create table if not exists public.admin_permissions (
  key text primary key,
  category text not null,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  access_level text not null default 'admin',
  description text,
  system_role boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (access_level in ('super_admin', 'admin'))
);

create table if not exists public.admin_role_permissions (
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_key text not null references public.admin_permissions(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_users_role_id_fkey'
    and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_role_id_fkey
      foreign key (role_id) references public.admin_roles(id) on delete set null;
  end if;
end $$;

create table if not exists public.site_settings (
  key text primary key,
  category text not null default 'general',
  label text not null,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  handle text,
  url text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt_text text,
  file_url text not null,
  file_type text not null default 'image',
  folder text not null default 'brand',
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  page_type text not null default 'page',
  status text not null default 'draft',
  seo_title text,
  seo_description text,
  sections jsonb not null default '[]'::jsonb,
  updated_by uuid references public.admin_users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('draft', 'published', 'archived'))
);

alter table public.admin_permissions enable row level security;
alter table public.admin_roles enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_social_links enable row level security;
alter table public.site_media enable row level security;
alter table public.site_pages enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_permissions' and policyname = 'Service role can manage admin permissions') then
    create policy "Service role can manage admin permissions"
      on public.admin_permissions
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_roles' and policyname = 'Service role can manage admin roles') then
    create policy "Service role can manage admin roles"
      on public.admin_roles
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_role_permissions' and policyname = 'Service role can manage admin role permissions') then
    create policy "Service role can manage admin role permissions"
      on public.admin_role_permissions
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_settings' and policyname = 'Service role can manage site settings') then
    create policy "Service role can manage site settings"
      on public.site_settings
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_social_links' and policyname = 'Service role can manage site social links') then
    create policy "Service role can manage site social links"
      on public.site_social_links
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_media' and policyname = 'Service role can manage site media') then
    create policy "Service role can manage site media"
      on public.site_media
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_pages' and policyname = 'Service role can manage site pages') then
    create policy "Service role can manage site pages"
      on public.site_pages
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;
end $$;

create index if not exists admin_users_role_id_idx
  on public.admin_users (role_id);

create index if not exists admin_users_access_level_idx
  on public.admin_users (access_level, active);

create index if not exists admin_roles_active_idx
  on public.admin_roles (active, access_level);

create index if not exists admin_role_permissions_permission_key_idx
  on public.admin_role_permissions (permission_key);

create index if not exists site_settings_category_idx
  on public.site_settings (category);

create index if not exists site_social_links_active_sort_idx
  on public.site_social_links (active, sort_order);

create index if not exists site_media_folder_created_at_idx
  on public.site_media (folder, created_at desc);

create index if not exists site_pages_status_type_idx
  on public.site_pages (status, page_type);

insert into public.admin_permissions (key, category, label, description)
values
  ('analytics.view', 'Analytics', 'View analytics', 'View system statistics, platform analytics, activity reports, and reports.'),
  ('analytics.export', 'Analytics', 'Export analytics', 'Export system data and reports.'),
  ('users.manage', 'Users', 'Manage users', 'Create, edit, suspend, ban, restore, verify, and delete customer accounts.'),
  ('users.export', 'Users', 'Export users', 'Export user lists and activity history.'),
  ('admins.manage', 'Access', 'Manage administrators', 'Create, remove, and assign administrator accounts.'),
  ('roles.manage', 'Access', 'Manage roles and permissions', 'Create custom roles, edit permissions, and control staff access hierarchy.'),
  ('orders.manage', 'Commerce', 'Manage orders', 'View transactions, update order statuses, and support payment review.'),
  ('customers.support', 'Support', 'Customer support', 'View customer context and support requests.'),
  ('inventory.manage', 'Commerce', 'Manage inventory', 'Update stock, sizes, and low stock settings.'),
  ('products.manage', 'Commerce', 'Manage products', 'Create, edit, delete, and publish products.'),
  ('media.manage', 'Content', 'Manage media', 'Upload images, videos, and delete media files.'),
  ('pages.manage', 'Content', 'Manage pages', 'Create, edit, delete, and publish website pages and sections.'),
  ('journal.manage', 'Content', 'Manage journal', 'Create, edit, delete articles, categories, tags, and comments.'),
  ('homepage.manage', 'Content', 'Manage homepage', 'Manage homepage sections and campaign content.'),
  ('settings.manage', 'Settings', 'Manage site settings', 'Manage social links, brand settings, integrations, and operational settings.'),
  ('security.manage', 'Security', 'Manage security', 'Manage access, bans, resets, and system security operations.'),
  ('integrations.manage', 'Integrations', 'Manage integrations', 'Configure payment, delivery, email, maps, and third-party integrations.')
on conflict (key) do update set
  category = excluded.category,
  label = excluded.label,
  description = excluded.description;

insert into public.admin_roles (slug, name, access_level, description, system_role)
values
  ('super-admin', 'Super Admin', 'super_admin', 'Full platform ownership with every permission.', true),
  ('admin', 'Admin', 'admin', 'Selected operational access for store management.', true),
  ('inventory-manager', 'Inventory Manager', 'admin', 'Product and stock operations.', true),
  ('customer-support', 'Customer Support', 'admin', 'Customer care and order support.', true),
  ('content-manager', 'Content Manager', 'admin', 'Website content, media, journal, and homepage operations.', true)
on conflict (slug) do update set
  name = excluded.name,
  access_level = excluded.access_level,
  description = excluded.description,
  system_role = excluded.system_role,
  active = true,
  updated_at = now();

insert into public.admin_role_permissions (role_id, permission_key)
select role.id, permission.key
from public.admin_roles role
cross join public.admin_permissions permission
where role.slug = 'super-admin'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_key)
select role.id, permission.key
from public.admin_roles role
join public.admin_permissions permission on permission.key in (
  'analytics.view',
  'orders.manage',
  'customers.support',
  'inventory.manage',
  'products.manage',
  'media.manage',
  'pages.manage',
  'homepage.manage',
  'settings.manage'
)
where role.slug = 'admin'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_key)
select role.id, permission.key
from public.admin_roles role
join public.admin_permissions permission on permission.key in ('inventory.manage', 'products.manage', 'media.manage')
where role.slug = 'inventory-manager'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_key)
select role.id, permission.key
from public.admin_roles role
join public.admin_permissions permission on permission.key in ('orders.manage', 'customers.support', 'users.manage')
where role.slug = 'customer-support'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_key)
select role.id, permission.key
from public.admin_roles role
join public.admin_permissions permission on permission.key in ('media.manage', 'pages.manage', 'journal.manage', 'homepage.manage', 'settings.manage')
where role.slug = 'content-manager'
on conflict do nothing;

update public.admin_users admin_user
set
  role_id = role.id,
  access_level = case when admin_user.role in ('owner', 'super_admin') then 'super_admin' else 'admin' end,
  role = case when admin_user.role in ('owner', 'super_admin') then 'super_admin' else admin_user.role end,
  updated_at = now()
from public.admin_roles role
where admin_user.role_id is null
and role.slug = case when admin_user.role in ('owner', 'super_admin') then 'super-admin' else 'admin' end;

insert into public.site_settings (key, category, label, value)
values
  ('brand.identity', 'brand', 'Brand Identity', '{"name":"ONUORA Menswear","tagline":"Nigerian-made stretch menswear","primaryColor":"#1F1F1F","accentColor":"#C9A23E"}'::jsonb),
  ('homepage.hero', 'homepage', 'Homepage Hero', '{"headline":"Shop Nigerian-Made Stretch Menswear","subcopy":"Premium stretch tailoring rooted in African heritage.","cta":"Shop collections"}'::jsonb),
  ('integrations.status', 'integrations', 'Integration Status', '{"stripe":"pending","maps":"manual","email":"pending"}'::jsonb)
on conflict (key) do nothing;
