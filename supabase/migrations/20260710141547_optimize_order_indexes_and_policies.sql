create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

drop policy if exists "Service role can manage orders" on public.orders;
create policy "Service role can manage orders"
  on public.orders
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

drop policy if exists "Service role can manage order items" on public.order_items;
create policy "Service role can manage order items"
  on public.order_items
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');
