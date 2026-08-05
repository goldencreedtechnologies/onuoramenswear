import { NextResponse } from "next/server";
import {
  hasStripeConfig,
  hasStripePublishableConfig,
  hasStripeWebhookConfig,
  hasSupabaseConfig,
  hasEmailProviderConfig,
  getNotificationWorkerSecret
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

  const stripeReady = hasStripePublishableConfig() && hasStripeConfig() && hasStripeWebhookConfig();
  const emailReady = hasEmailProviderConfig() && Boolean(getNotificationWorkerSecret());
  const productionReady = supabaseReachable && stripeReady && emailReady;

  return NextResponse.json({
    ok: productionReady,
    productionReady,
    supabaseConfigured: hasSupabaseConfig(),
    supabaseServiceConfigured: Boolean(client),
    supabaseReachable,
    productCount,
    stripe: {
      publishableKeyConfigured: hasStripePublishableConfig(),
      secretKeyConfigured: hasStripeConfig(),
      webhookSecretConfigured: hasStripeWebhookConfig()
    },
    transactionalEmail: {
      resendConfigured: hasEmailProviderConfig(),
      retryWorkerConfigured: Boolean(getNotificationWorkerSecret())
    },
    timestamp: new Date().toISOString()
  }, { status: productionReady ? 200 : 503 });
}
