import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/backend/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseConfigured: hasSupabaseConfig(),
    timestamp: new Date().toISOString()
  });
}
