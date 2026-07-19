import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminBootstrapSecret } from "@/lib/backend/env";
import { createSupabaseServiceClient } from "@/lib/backend/supabase-service";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  fullName: z.string().trim().min(2).max(120).default("Charles Samuel"),
  username: z.string().trim().min(3).max(60).default("Dev.OAE"),
  roleSlug: z.string().trim().min(2).default("super-admin")
});

export async function POST(request: Request) {
  const expectedSecret = getAdminBootstrapSecret();
  const providedSecret = request.headers.get("x-admin-bootstrap-secret") ?? "";

  if (!expectedSecret) {
    return NextResponse.json({ error: "Admin bootstrap is not configured." }, { status: 503 });
  }

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid bootstrap secret." }, { status: 401 });
  }

  const client = createSupabaseServiceClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bootstrapSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bootstrap payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = parsed.data.password
    ? await client.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.fullName,
          username: parsed.data.username
        }
      })
    : await client.auth.admin.inviteUserByEmail(parsed.data.email, {
        data: {
          full_name: parsed.data.fullName,
          username: parsed.data.username
        }
      });

  if (error || !data.user?.id || !data.user.email) {
    return NextResponse.json({ error: error?.message ?? "Unable to create or invite admin auth user." }, { status: 500 });
  }

  const { data: role, error: roleError } = await client
    .from("admin_roles")
    .select("id, slug, access_level")
    .eq("slug", parsed.data.roleSlug)
    .maybeSingle();

  if (roleError || !role) {
    return NextResponse.json({ error: roleError?.message ?? "Admin role was not found. Run migrations first." }, { status: 500 });
  }

  const { error: upsertError } = await client.from("admin_users").upsert(
    {
      auth_user_id: data.user.id,
      email: data.user.email,
      full_name: parsed.data.fullName,
      username: parsed.data.username,
      role: role.slug === "super-admin" ? "super_admin" : role.slug,
      role_id: role.id,
      access_level: role.access_level,
      active: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "auth_user_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
