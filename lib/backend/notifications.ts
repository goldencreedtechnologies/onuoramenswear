import { getResendApiKey, getTransactionalEmailFrom, hasEmailProviderConfig } from "@/lib/backend/env";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

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

function getString(payload: Record<string, unknown>, key: string, fallback = "") {
  const value = payload[key];
  return typeof value === "string" ? value : fallback;
}

function getNumber(payload: Record<string, unknown>, key: string, fallback = 0) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function baseEmail({ title, body, action }: { title: string; body: string; action?: string }) {
  const text = [title, body, action].filter(Boolean).join("\n\n");
  const html = `
    <div style="background:#F7F3E8;padding:32px;font-family:Arial,sans-serif;color:#1F1F1F">
      <div style="max-width:620px;margin:0 auto;background:#fffaf0;border:1px solid #E2D2B1;padding:28px">
        <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C9A23E;font-weight:700;margin:0 0 18px">ỌNUỌRA Menswear</p>
        <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.05;margin:0 0 18px">${title}</h1>
        <p style="font-size:15px;line-height:1.8;margin:0;color:#5A3A28">${body}</p>
        ${action ? `<p style="font-size:13px;line-height:1.7;margin:22px 0 0;color:#5A3A28">${action}</p>` : ""}
      </div>
    </div>
  `;

  return { text, html };
}

export function renderNotificationEmail(row: NotificationRow): RenderedEmail {
  const fullName = getString(row.payload, "fullName", "Client");
  const totalUsd = getNumber(row.payload, "totalUsd");

  if (row.template === "payment_confirmed") {
    const subject = row.subject ?? "Your ỌNUỌRA payment is confirmed";
    const body = `Dear ${fullName}, your payment has been confirmed. Your order total is ${money(totalUsd)}, and the garment now moves into fulfilment.`;
    return { subject, ...baseEmail({ title: "Payment confirmed.", body, action: "We will send another note when your order moves into delivery." }) };
  }

  if (row.template === "payment_expired") {
    const subject = row.subject ?? "Your ỌNUỌRA checkout expired";
    const body = `Dear ${fullName}, your checkout session expired before payment was completed. The reserved pieces have been released back to availability.`;
    return { subject, ...baseEmail({ title: "Checkout expired.", body, action: "You can return to your bag and start checkout again when ready." }) };
  }

  const subject = row.subject ?? "Your ỌNUỌRA order has been started";
  const body = `Dear ${fullName}, your private order has been created and your selected size has been reserved while payment is pending.`;
  return { subject, ...baseEmail({ title: "Order started.", body, action: "Complete payment to move your order into fulfilment." }) };
}

async function sendResendEmail(row: NotificationRow, rendered: RenderedEmail) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getTransactionalEmailFrom(),
      to: row.recipient,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Resend returned ${response.status}`);
  }
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
