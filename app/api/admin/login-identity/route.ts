import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

export async function POST(request: Request) {
  const client = createSupabaseServiceClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const identity = typeof body?.identity === "string" ? body.identity.trim() : "";

  if (!identity) {
    return NextResponse.json({ error: "Admin identity is required." }, { status: 400 });
  }

  if (identity.includes("@")) {
    return NextResponse.json({ ok: true, email: identity });
  }

  const { data, error } = await client
    .from("admin_users")
    .select("email")
    .ilike("username", identity)
    .eq("active", true)
    .maybeSingle();

  if (error || !data?.email) {
    return NextResponse.json({ error: "Admin account was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, email: data.email });
}
