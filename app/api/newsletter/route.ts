import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const signupSchema = z.object({
  email: z.string().trim().email().max(320),
  country: z.string().trim().min(2).max(100)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address and country." }, { status: 400 });
  }

  const client = createSupabaseServiceClient();
  if (!client) {
    return NextResponse.json({ error: "Newsletter service is temporarily unavailable." }, { status: 503 });
  }

  const email = parsed.data.email.toLowerCase();
  const now = new Date().toISOString();
  const { error } = await client.from("circle_subscribers").upsert(
    {
      email,
      country: parsed.data.country,
      source: "website",
      status: "active",
      updated_at: now
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Newsletter signup failed", error.message);
    return NextResponse.json({ error: "We could not save your signup. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
