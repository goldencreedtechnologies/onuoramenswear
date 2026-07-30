import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const newsletterSchema = z.object({
  email: z.string().email(),
  country: z.string().trim().min(2).max(120)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and country or region." }, { status: 400 });
  }

  const client = createSupabaseServiceClient();
  if (!client) {
    return NextResponse.json({ error: "Newsletter capture is not configured." }, { status: 503 });
  }

  const { error } = await client.from("newsletter_subscribers").upsert(
    {
      email: parsed.data.email.toLowerCase(),
      country_region: parsed.data.country,
      source: "website_modal",
      subscribed_at: new Date().toISOString()
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: "Unable to save newsletter subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
