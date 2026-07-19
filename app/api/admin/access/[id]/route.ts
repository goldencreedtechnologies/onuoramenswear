import { NextResponse } from "next/server";
import { adminUpdateSchema, requireAdminSession, updateAdminAccount } from "@/lib/backend/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin update payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const params = await context.params;
  const updated = await updateAdminAccount(session.admin, params.id, parsed.data);

  if (!updated.ok) {
    return NextResponse.json({ error: updated.reason }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
