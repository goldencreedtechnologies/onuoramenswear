import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(320),
  country: z.string().trim().min(2).max(120),
  source: z.enum(["modal", "homepage", "footer"]).default("modal")
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and country or region." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Newsletter signup is not configured yet." }, { status: 503 });
  }

  const { error } = await supabase.from("circle_subscribers").upsert(
    {
      email: parsed.data.email.toLowerCase(),
      country_region: parsed.data.country,
      source: parsed.data.source,
      status: "subscribed",
      updated_at: new Date().toISOString()
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: "Unable to join right now. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
