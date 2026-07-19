export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name] ?? "";
}

function getFirstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  return "";
}

export function getSupabaseUrl() {
  return getFirstEnv(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_ONUORAMENSWEAR_SUPABASE_URL"]);
}

export function getSupabasePublishableKey() {
  return getFirstEnv([
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_ONUORAMENSWEAR_SUPABASE_ANON_KEY",
    "ONUORAMENSWEAR_SUPABASE_PUBLISHABLE_KEY"
  ]);
}

export function getSupabaseServiceRoleKey() {
  return getFirstEnv(["SUPABASE_SERVICE_ROLE_KEY", "ONUORAMENSWEAR_SUPABASE_SERVICE_ROLE_KEY"]);
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function getStripeSecretKey() {
  return getOptionalEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getOptionalEnv("STRIPE_WEBHOOK_SECRET");
}

export function getSiteUrl() {
  return getOptionalEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
}

export function hasStripeConfig() {
  return Boolean(getStripeSecretKey());
}

export function getNotificationWorkerSecret() {
  return getOptionalEnv("NOTIFICATION_WORKER_SECRET");
}

export function getResendApiKey() {
  return getOptionalEnv("RESEND_API_KEY");
}

export function getTransactionalEmailFrom() {
  return getOptionalEnv("TRANSACTIONAL_EMAIL_FROM") || "ỌNUỌRA Client Care <orders@onuoramenswear.com>";
}

export function hasEmailProviderConfig() {
  return Boolean(getResendApiKey() && getTransactionalEmailFrom());
}

export function getMapsProvider() {
  const provider = getOptionalEnv("MAPS_PROVIDER").toLowerCase();

  if (provider === "google" || provider === "mapbox") {
    return provider;
  }

  return "manual";
}

export function getGoogleMapsServerApiKey() {
  return getOptionalEnv("GOOGLE_MAPS_SERVER_API_KEY");
}

export function getMapboxAccessToken() {
  return getOptionalEnv("MAPBOX_ACCESS_TOKEN");
}

export function getAdminBootstrapSecret() {
  return getOptionalEnv("ADMIN_BOOTSTRAP_SECRET");
}
