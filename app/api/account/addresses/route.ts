import { NextResponse } from "next/server";
import { addressSchema, createCustomerAddress, getAuthenticatedAccountUser } from "@/lib/backend/account";

export async function POST(request: Request) {
  const auth = await getAuthenticatedAccountUser();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createCustomerAddress(auth.user, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  return NextResponse.json({ ok: true, address: result.address });
}
