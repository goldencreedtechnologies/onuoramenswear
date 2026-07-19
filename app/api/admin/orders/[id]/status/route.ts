import { NextResponse } from "next/server";
import { orderStatusSchema, requireAdminSession, updateAdminOrderStatus } from "@/lib/backend/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order status payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const params = await context.params;
  const updated = await updateAdminOrderStatus(session.admin, params.id, parsed.data);

  if (!updated.ok) {
    return NextResponse.json({ error: updated.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
