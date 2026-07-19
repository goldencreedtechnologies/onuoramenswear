import { NextResponse } from "next/server";
import { getAdminContentControl, requireAdminSession } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const content = await getAdminContentControl();

  if (!content.ok) {
    return NextResponse.json({ error: content.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: content.content });
}
