import { NextResponse } from "next/server";
import { adminCreateSchema, createAdminAccount, getAdminAccessControl, requireAdminSession } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const access = await getAdminAccessControl();

  if (!access.ok) {
    return NextResponse.json({ error: access.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, access: access.access });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createAdminAccount(session.admin, parsed.data);

  if (!created.ok) {
    return NextResponse.json({ error: created.reason }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
