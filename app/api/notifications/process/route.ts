import { NextResponse } from "next/server";
import { getNotificationWorkerSecret } from "@/lib/backend/env";
import { processNotificationQueue } from "@/lib/backend/notifications";

function isAuthorized(request: Request) {
  const expectedSecret = getNotificationWorkerSecret();

  if (!expectedSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const workerSecret = request.headers.get("x-notification-worker-secret");

  return authorization === `Bearer ${expectedSecret}` || workerSecret === expectedSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized notification worker request." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const limit = typeof body.limit === "number" ? body.limit : undefined;
  const dryRun = body.dryRun === true;
  const result = await processNotificationQueue({ limit, dryRun });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 503 });
  }

  return NextResponse.json(result);
}
