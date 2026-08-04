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

alter table public.orders
  add column if not exists inventory_status text not null default 'pending',
  add column if not exists inventory_reserved_at timestamptz,
  add column if not exists inventory_released_at timestamptz,
  add column if not exists inventory_sold_at timestamptz;

alter table public.product_inventory enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'product_inventory' and policyname = 'Public can read active product inventory') then
    create policy "Public can read active product inventory"
      on public.product_inventory
      for select
      using (active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'product_inventory' and policyname = 'Service role can manage product inventory') then
    create policy "Service role can manage product inventory"
      on public.product_inventory
      for all
      using ((select auth.role()) = 'service_role')
      with check ((select auth.role()) = 'service_role');
  end if;
end $$;

create index if not exists product_inventory_product_slug_idx
  on public.product_inventory (product_slug);

create index if not exists product_inventory_active_idx
  on public.product_inventory (active);

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
