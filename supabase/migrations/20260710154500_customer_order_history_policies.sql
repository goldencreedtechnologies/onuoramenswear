do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Customers can read their own orders') then
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
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'Customers can read their own order items') then
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
  end if;
end $$;
