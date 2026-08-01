import { NextResponse } from "next/server";
import {
  hasStripeConfig,
  hasStripePublishableConfig,
  hasStripeWebhookConfig,
  hasSupabaseConfig
} from "@/lib/backend/env";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

export async function GET() {
  const client = createSupabaseServiceClient();
  let supabaseReachable = false;
  let productCount: number | null = null;

  if (client) {
    const result = await client.from("products").select("id", { count: "exact", head: true });
    supabaseReachable = !result.error;
    productCount = result.count ?? null;
  }

  return NextResponse.json({
    ok: supabaseReachable,
    supabaseConfigured: hasSupabaseConfig(),
    supabaseServiceConfigured: Boolean(client),
    supabaseReachable,
    productCount,
    stripe: {
      publishableKeyConfigured: hasStripePublishableConfig(),
      secretKeyConfigured: hasStripeConfig(),
      webhookSecretConfigured: hasStripeWebhookConfig()
    },
    timestamp: new Date().toISOString()
  }, { status: supabaseReachable ? 200 : 503 });
}
