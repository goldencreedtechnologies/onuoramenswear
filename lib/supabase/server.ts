import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv, hasSupabaseConfig } from "@/lib/backend/env";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured yet.");
  }

  const cookieStore = await cookies();

  return createServerClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });
}
