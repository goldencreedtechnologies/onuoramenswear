import { NextResponse } from "next/server";
import { getAccountOverview, getAuthenticatedAccountUser } from "@/lib/backend/account";

export async function GET() {
  const auth = await getAuthenticatedAccountUser();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const account = await getAccountOverview(auth.user);

  if (!account.ok) {
    return NextResponse.json({ error: account.reason }, { status: account.status });
  }

  return NextResponse.json({ ok: true, account });
}
