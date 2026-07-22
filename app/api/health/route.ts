import { NextResponse } from "next/server";
import {
  hasStripeConfig,
  hasStripePublishableConfig,
  hasStripeWebhookConfig,
  hasSupabaseConfig
} from "@/lib/backend/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseConfigured: hasSupabaseConfig(),
    stripe: {
      publishableKeyConfigured: hasStripePublishableConfig(),
      secretKeyConfigured: hasStripeConfig(),
      webhookSecretConfigured: hasStripeWebhookConfig()
    },
    timestamp: new Date().toISOString()
  });
}
