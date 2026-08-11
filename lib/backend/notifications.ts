import { getResendApiKey, getSiteUrl, getTransactionalEmailFrom, hasEmailProviderConfig } from "@/lib/backend/env";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";
import { CURRENCY_LOCALES, isCurrencyCode, type CurrencyCode } from "@/data/site-config";
import { Resend } from "resend";

type NotificationRow = {
  id: string;
  order_id: string | null;
  customer_profile_id: string | null;
  channel: string;
  template: string;
  recipient: string;
  subject: string | null;
  payload: Record<string, unknown>;
  attempts: number;
};

type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

type ProcessNotificationOptions = {
  limit?: number;
  dryRun?: boolean;
};

type ConfirmedItem = {
  name?: string;
  edition?: string;
  colour?: string;
  size?: string;
  quantity?: number;
  unitPrice?: number;
};

function getString(payload: Record<string, unknown>, key: string, fallback = "") {
  const value = payload[key];
  return typeof value === "string" ? value : fallback;
}

function getNumber(payload: Record<string, unknown>, key: string, fallback = 0) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getItems(payload: Record<string, unknown>) {
  const value = payload.purchasedItems;
  return Array.isArray(value) ? value as ConfirmedItem[] : [];
}

function money(amount: number, currency: CurrencyCode = "USD") {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseEmail({ title, body, action, actionHref }: { title: string; body: string; action?: string; actionHref?: string }) {
  const text = [title, body.replace(/<[^>]+>/g, " "), action].filter(Boolean).join("\n\n");
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const html = `
    <div style="background:#F7F3E8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1F1F1F">
      <div style="max-width:620px;margin:0 auto;background:#FFFCF5;border:1px solid #E2D2B1">
        <div style="height:4px;background:#C9A23E"></div>
        <div style="padding:30px 28px">
        <img src="${siteUrl}/brand/onuora-logo-horizontal.png" alt="ỌNUỌRA Menswear" width="170" style="display:block;width:170px;max-width:100%;height:auto;margin:0 0 24px" />
        <p style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#9F751D;font-weight:700;margin:0 0 14px">Order correspondence</p>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.12;margin:0 0 18px">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.8;margin:0;color:#5A3A28">${body}</div>
        ${action ? `<p style="font-size:13px;line-height:1.7;margin:22px 0 0;color:#5A3A28">${escapeHtml(action)}</p>` : ""}
        ${actionHref ? `<p style="margin:24px 0 0"><a href="${escapeHtml(actionHref)}" style="display:inline-block;background:#1F1F1F;color:#F7F3E8;padding:14px 20px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Track Your Order</a></p>` : ""}
        </div>
        <div style="border-top:1px solid #E2D2B1;padding:16px 28px;color:#786B60;font-size:11px;line-height:1.6">ỌNUỌRA Menswear · Designed in Nigeria. Worn worldwide.</div>
      </div>
    </div>
  `;

  return { text, html };
}

export function renderNotificationEmail(row: NotificationRow): RenderedEmail {
  const fullName = getString(row.payload, "fullName");
  const currencyValue = getString(row.payload, "currency", "USD");
  const currency = isCurrencyCode(currencyValue) ? currencyValue : "USD";
  const total = getNumber(row.payload, "total", getNumber(row.payload, "totalUsd"));

  if (row.template === "order_confirmed") {
    const subject = row.subject ?? "Your ỌNUỌRA order is confirmed";
    const orderReference = getString(row.payload, "orderReference", row.order_id ?? "");
    const deliveryAddress = getString(row.payload, "deliveryAddress");
    const shippingMethod = getString(row.payload, "shippingMethod", "Tracked delivery");
    const dispatchStatus = getString(row.payload, "dispatchStatus", "Order confirmed");
    const estimatedDispatchTiming = getString(row.payload, "estimatedDispatchTiming", "Prepared for dispatch within three working days");
    const estimatedDeliveryWindow = getString(row.payload, "estimatedDeliveryWindow", "Confirmed with your dispatch notification");
    const paymentStatus = getString(row.payload, "paymentStatus", "Paid");
    const contactInformation = getString(row.payload, "contactInformation", "orders@onuoramenswear.com");
    const orderDate = getString(row.payload, "orderDate");
    const trackingId = getString(row.payload, "trackingId");
    const subtotal = getNumber(row.payload, "subtotal");
    const shipping = getNumber(row.payload, "shipping");
    const discount = getNumber(row.payload, "discount");
    const items = getItems(row.payload);
    const itemText = items.map((item) => `${item.quantity ?? 1} × ${item.name ?? "ỌNUỌRA outfit"}${item.edition ? ` · ${item.edition}` : ""}${item.colour ? ` · ${item.colour}` : ""}${item.size ? ` · Size ${item.size}` : ""}${typeof item.unitPrice === "number" ? ` · ${money(item.unitPrice, currency)} each` : ""}`).join("\n");
    const itemHtml = items.map((item) => `<li style="margin:0 0 10px">${escapeHtml(item.quantity ?? 1)} × ${escapeHtml(item.name ?? "ỌNUỌRA outfit")}${item.edition ? ` · ${escapeHtml(item.edition)}` : ""}${item.colour ? ` · ${escapeHtml(item.colour)}` : ""}${item.size ? ` · Size ${escapeHtml(item.size)}` : ""}${typeof item.unitPrice === "number" ? ` · ${escapeHtml(money(item.unitPrice, currency))} each` : ""}</li>`).join("");
    const text = [
      `${fullName ? `Dear ${fullName},` : "Thank you,"} your order is confirmed.`,
      `Order number: ${orderReference}`,
      ...(trackingId ? [`Tracking ID: ${trackingId}`] : []),
      ...(orderDate ? [`Order date: ${orderDate}`] : []),
      "Purchased items:",
      itemText,
      `Delivery address: ${deliveryAddress}`,
      `Shipping method: ${shippingMethod}`,
      `Dispatch status: ${dispatchStatus}`,
      `Estimated dispatch timing: ${estimatedDispatchTiming}`,
      `Estimated delivery window: ${estimatedDeliveryWindow}`,
      `Payment status: ${paymentStatus}`,
      `Subtotal: ${money(subtotal, currency)}`,
      `Shipping: ${money(shipping, currency)}`,
      `Discount: -${money(discount, currency)}`,
      `Total paid: ${money(total, currency)}`,
      `Client Care: ${contactInformation}`
    ].join("\n\n");
    const body = `
      <p style="margin:0 0 16px">${fullName ? `Dear ${escapeHtml(fullName)},` : "Thank you,"} your order is confirmed.</p>
      <p style="margin:0 0 8px"><strong>Order number:</strong> ${escapeHtml(orderReference)}</p>
      ${trackingId ? `<p style="margin:0 0 8px"><strong>Tracking ID:</strong> ${escapeHtml(trackingId)}</p>` : ""}
      ${orderDate ? `<p style="margin:0 0 16px"><strong>Order date:</strong> ${escapeHtml(orderDate)}</p>` : ""}
      <p style="margin:0 0 8px"><strong>Purchased items</strong></p>
      <ul style="margin:0 0 18px;padding-left:20px">${itemHtml}</ul>
      <p style="margin:0 0 8px"><strong>Delivery address:</strong> ${escapeHtml(deliveryAddress)}</p>
      <p style="margin:0 0 8px"><strong>Shipping method:</strong> ${escapeHtml(shippingMethod)}</p>
      <p style="margin:0 0 8px"><strong>Dispatch status:</strong> ${escapeHtml(dispatchStatus)}</p>
      <p style="margin:0 0 18px"><strong>Estimated dispatch timing:</strong> ${escapeHtml(estimatedDispatchTiming)}</p>
      <p style="margin:0 0 8px"><strong>Estimated delivery window:</strong> ${escapeHtml(estimatedDeliveryWindow)}</p>
      <p style="margin:0 0 18px"><strong>Payment status:</strong> ${escapeHtml(paymentStatus)}</p>
      <p style="margin:0"><strong>Order summary</strong><br>Subtotal: ${money(subtotal, currency)}<br>Shipping: ${money(shipping, currency)}<br>Discount: -${money(discount, currency)}<br>Total paid: ${money(total, currency)}</p>
    `;
    const email = baseEmail({ title: "Order Confirmed.", body, action: `We will send another note when your order moves into delivery. Client Care: ${contactInformation}`, actionHref: trackingId ? `${getSiteUrl().replace(/\/$/, "")}/tracking` : undefined });
    return { subject, text, html: email.html };
  }

  if (row.template === "payment_confirmed") {
    const subject = row.subject ?? "Your ỌNUỌRA payment is confirmed";
    const body = `Dear ${fullName}, your payment has been confirmed. Your order total is ${money(total, currency)}, and the garment now moves into fulfilment.`;
    return { subject, ...baseEmail({ title: "Payment Confirmed.", body, action: "We will send another note when your order moves into delivery." }) };
  }

  if (row.template === "payment_expired") {
    const subject = row.subject ?? "Your ỌNUỌRA checkout expired";
    const body = `Dear ${fullName}, your checkout session expired before payment was completed. The reserved pieces have been released back to availability.`;
    return { subject, ...baseEmail({ title: "Checkout Expired.", body, action: "You can return to your bag and start checkout again when ready." }) };
  }

  if (row.template === "payment_failed") {
    const subject = row.subject ?? "Your ỌNUỌRA payment was not completed";
    const body = `Dear ${fullName}, Stripe could not complete your payment. No charge has been confirmed, and the reserved pieces have been returned to availability.`;
    return { subject, ...baseEmail({ title: "Payment Not Completed.", body, action: "Review your payment method and begin checkout again when ready." }) };
  }

  const subject = row.subject ?? "Your ỌNUỌRA order has been started";
  const body = `Dear ${fullName}, your private order has been created and your selected size has been reserved while payment is pending.`;
  return { subject, ...baseEmail({ title: "Order Started.", body, action: "Complete payment to move your order into fulfilment." }) };
}

async function sendResendEmail(row: NotificationRow, rendered: RenderedEmail) {
  const resend = new Resend(getResendApiKey());
  const { error } = await resend.emails.send(
    {
      from: getTransactionalEmailFrom(),
      to: row.recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    },
    { idempotencyKey: `notification-${row.id}` }
  );
  if (error) throw new Error(error.message);
}

export async function processNotificationQueue(options: ProcessNotificationOptions = {}) {
  const client = createSupabaseServiceClient();
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);

  if (!client) {
    return { ok: false as const, reason: "Supabase is not configured yet." };
  }

  if (!options.dryRun && !hasEmailProviderConfig()) {
    return {
      ok: false as const,
      reason: "Email provider is not configured yet. Add RESEND_API_KEY and TRANSACTIONAL_EMAIL_FROM."
    };
  }

  const { data, error } = await client
    .from("notification_queue")
    .select("id, order_id, customer_profile_id, channel, template, recipient, subject, payload, attempts")
    .eq("status", "queued")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  const rows = (data ?? []) as NotificationRow[];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const rendered = renderNotificationEmail(row);

    try {
      if (!options.dryRun) {
        await sendResendEmail(row, rendered);
      }

      await client
        .from("notification_queue")
        .update({
          status: options.dryRun ? "queued" : "sent",
          sent_at: options.dryRun ? null : new Date().toISOString(),
          attempts: row.attempts + (options.dryRun ? 0 : 1),
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", row.id);

      sent += options.dryRun ? 0 : 1;
    } catch (error) {
      failed += 1;
      await client
        .from("notification_queue")
        .update({
          status: row.attempts + 1 >= 3 ? "failed" : "queued",
          attempts: row.attempts + 1,
          last_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown notification error",
          updated_at: new Date().toISOString()
        })
        .eq("id", row.id);
    }
  }

  return { ok: true as const, processed: rows.length, sent, failed, dryRun: Boolean(options.dryRun) };
}
