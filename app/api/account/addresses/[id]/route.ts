import { NextResponse } from "next/server";
import { deleteCustomerAddress, getAuthenticatedAccountUser } from "@/lib/backend/account";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthenticatedAccountUser();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.status });
  }

  const { id } = await params;
  const result = await deleteCustomerAddress(auth.user, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
