import { NextResponse } from "next/server";
import { requireAdminSession, settingUpdateSchema, upsertAdminSetting } from "@/lib/backend/admin";

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid setting payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const saved = await upsertAdminSetting(session.admin, parsed.data);

  if (!saved.ok) {
    return NextResponse.json({ error: saved.reason }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
