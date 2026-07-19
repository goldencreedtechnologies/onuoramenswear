import { NextResponse } from "next/server";
import { createAdminMedia, mediaSchema, requireAdminSession } from "@/lib/backend/admin";

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = mediaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid media payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createAdminMedia(session.admin, parsed.data);

  if (!created.ok) {
    return NextResponse.json({ error: created.reason }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
