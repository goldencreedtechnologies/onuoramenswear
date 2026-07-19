import { NextResponse } from "next/server";
import { accountProfileSchema, getAuthenticatedAccountUser, updateCustomerProfile } from "@/lib/backend/account";

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedAccountUser();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = accountProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await updateCustomerProfile(auth.user, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  return NextResponse.json({ ok: true, profile: result.profile });
}
