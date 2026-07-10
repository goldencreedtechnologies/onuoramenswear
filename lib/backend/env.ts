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
