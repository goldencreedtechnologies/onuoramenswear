alter table public.products
  add column if not exists family text not null default 'original',
  add column if not exists color_name text not null default 'Black',
  add column if not exists color_value text not null default '#1F1F1F',
  add column if not exists model_name text not null default 'Studio model',
  add column if not exists details text not null default 'ONUORA stretch-tailored two-piece set.',
  add column if not exists fit text not null default 'Relaxed-tailored fit with four-way movement.',
  add column if not exists fabric_care text not null default 'Gentle cold wash. Dry flat. Cool iron inside out.',
  add column if not exists delivery text not null default 'Delivery options are confirmed at checkout.',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_family_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_family_check
      check (family in ('original', 'button', 'buttonless'));
  end if;
end $$;

create index if not exists products_family_sort_order_idx
  on public.products (family, sort_order);

create index if not exists products_color_name_idx
  on public.products (color_name);

insert into public.site_pages (
  slug,
  title,
  page_type,
  status,
  seo_title,
  seo_description,
  sections,
  published_at,
  updated_at
)
values
  (
    'privacy',
    'Privacy Policy',
    'policy',
    'published',
    'Privacy Policy | ONUORA',
    'How ONUORA collects, uses, stores, and protects personal information.',
    '[{"key":"information","title":"Information we collect"},{"key":"use","title":"How information is used"},{"key":"rights","title":"Your choices and rights"}]'::jsonb,
    now(),
    now()
  ),
  (
    'terms',
    'Terms & Conditions',
    'policy',
    'published',
    'Terms & Conditions | ONUORA',
    'Terms governing use of the ONUORA website, purchases, offers, and services.',
    '[{"key":"website","title":"Using this website"},{"key":"orders","title":"Products and availability"},{"key":"payment","title":"Pricing and payment"}]'::jsonb,
    now(),
    now()
  ),
  (
    'accessibility',
    'Accessibility',
    'policy',
    'published',
    'Accessibility | ONUORA',
    'ONUORA commitment to an inclusive and accessible digital shopping experience.',
    '[{"key":"commitment","title":"Our commitment"},{"key":"support","title":"What the site supports"},{"key":"assistance","title":"Requesting assistance"}]'::jsonb,
    now(),
    now()
  ),
  (
    'shipping',
    'Delivery',
    'policy',
    'published',
    'Delivery | ONUORA',
    'ONUORA delivery rates, destination estimates, dispatch, duties, and tracking information.',
    '[{"key":"rates","title":"Delivery rates"},{"key":"tracking","title":"Dispatch and tracking"},{"key":"duties","title":"International duties"}]'::jsonb,
    now(),
    now()
  ),
  (
    'returns',
    'Returns & Exchanges',
    'policy',
    'published',
    'Returns & Exchanges | ONUORA',
    'ONUORA exchange, return condition, and manufacturing fault policy.',
    '[{"key":"exchange","title":"Size exchanges"},{"key":"condition","title":"Return condition"},{"key":"resolution","title":"Inspection and resolution"}]'::jsonb,
    now(),
    now()
  ),
  (
    'services',
    'Client Services',
    'page',
    'published',
    'Client Services | ONUORA',
    'ONUORA styling, sizing, delivery, order, and private client services.',
    '[{"key":"fit","title":"Fit and sizing"},{"key":"styling","title":"Private styling"},{"key":"delivery","title":"Global delivery"}]'::jsonb,
    now(),
    now()
  )
on conflict (slug) do update
set
  title = excluded.title,
  page_type = excluded.page_type,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sections = excluded.sections,
  published_at = coalesce(public.site_pages.published_at, excluded.published_at),
  updated_at = now();
