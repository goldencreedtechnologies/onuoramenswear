create sequence if not exists public.onuora_order_number_seq;

alter table public.orders add column if not exists order_number text;
update public.orders set order_number = 'ONU-' || upper(left(replace(id::text, '-', ''), 10)) where order_number is null;
alter table public.orders
  alter column order_number set default ('ONU-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.onuora_order_number_seq')::text, 6, '0')),
  alter column order_number set not null;
create unique index if not exists orders_order_number_key on public.orders (order_number);

alter table public.order_items
  add column if not exists product_name text,
  add column if not exists product_edition text,
  add column if not exists color_name text,
  add column if not exists color_value text;

create unique index if not exists notification_queue_order_template_recipient_key
  on public.notification_queue (order_id, template, recipient)
  where order_id is not null;

-- Scope privileged policies to the service role. The earlier policies used
-- auth.role() without a TO clause, so Postgres evaluated them for every role.
alter policy "Service role can manage orders" on public.orders to service_role using (true) with check (true);
alter policy "Service role can manage order items" on public.order_items to service_role using (true) with check (true);
alter policy "Service role can manage customer profiles" on public.customer_profiles to service_role using (true) with check (true);
alter policy "Service role can manage customer addresses" on public.customer_addresses to service_role using (true) with check (true);
alter policy "Service role can manage delivery quotes" on public.delivery_quotes to service_role using (true) with check (true);
alter policy "Service role can manage product inventory" on public.product_inventory to service_role using (true) with check (true);
alter policy "Service role can manage order events" on public.order_events to service_role using (true) with check (true);
alter policy "Service role can manage notification queue" on public.notification_queue to service_role using (true) with check (true);
alter policy "Service role can manage delivery origins" on public.delivery_origins to service_role using (true) with check (true);
alter policy "Service role can manage admin users" on public.admin_users to service_role using (true) with check (true);
alter policy "Service role can manage admin activity logs" on public.admin_activity_logs to service_role using (true) with check (true);
alter policy "Service role can manage admin permissions" on public.admin_permissions to service_role using (true) with check (true);
alter policy "Service role can manage admin roles" on public.admin_roles to service_role using (true) with check (true);
alter policy "Service role can manage admin role permissions" on public.admin_role_permissions to service_role using (true) with check (true);
alter policy "Service role can manage site settings" on public.site_settings to service_role using (true) with check (true);
alter policy "Service role can manage site social links" on public.site_social_links to service_role using (true) with check (true);
alter policy "Service role can manage site media" on public.site_media to service_role using (true) with check (true);
alter policy "Service role can manage site pages" on public.site_pages to service_role using (true) with check (true);
