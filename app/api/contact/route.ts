import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderNotificationEmail } from "@/lib/backend/env";
import { queueOrderNotification } from "@/lib/backend/order-lifecycle";
import { processNotificationQueue } from "@/lib/backend/notifications";

const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  enquiry: z.string().trim().min(2).max(120),
  message: z.string().trim().min(2).max(4000)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your contact details and message." }, { status: 400 });
  }

  const recipient = getOrderNotificationEmail();
  if (!recipient) {
    return NextResponse.json({ error: "Client Care is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }

  const result = await queueOrderNotification({
    template: "internal_contact",
    recipient,
    subject: `Client Care enquiry · ${parsed.data.enquiry}`,
    payload: {
      fullName: parsed.data.fullName,
      customerEmail: parsed.data.email,
      phone: parsed.data.phone,
      enquiry: parsed.data.enquiry,
      message: parsed.data.message
    }
  });

  if (!result.ok) {
    return NextResponse.json({ error: "We could not send your enquiry. Please try again." }, { status: 503 });
  }

  await processNotificationQueue({ limit: 10 });
  return NextResponse.json({ ok: true });
}
