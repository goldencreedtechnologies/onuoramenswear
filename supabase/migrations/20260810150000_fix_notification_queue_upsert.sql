drop index if exists public.notification_queue_order_template_recipient_key;

create unique index if not exists notification_queue_order_template_recipient_key
  on public.notification_queue (order_id, template, recipient);
