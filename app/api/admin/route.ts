import { NextResponse } from "next/server";
import { getAdminOverview, requireAdminSession } from "@/lib/backend/admin";

export async function GET() {
  const session = await requireAdminSession();

  if (!session.ok) {
    return NextResponse.json({ error: session.reason }, { status: session.status });
  }

  const overview = await getAdminOverview();

  if (!overview.ok) {
    return NextResponse.json({ error: overview.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, admin: session.admin, overview: overview.overview });
}
