import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { getDelhiveryTracking } from "@/lib/server/delhivery";
import { notifyCourierSms } from "@/lib/server/sms/courier";

export async function POST(request: NextRequest) {
  const secret = process.env.SMS_SYNC_SECRET;
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (!secret || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cursor = request.nextUrl.searchParams.get("cursor");
  const orders = await db.order.findMany({
    where: { trackingNumber: { not: null }, status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] } },
    orderBy: { id: "asc" }, take: 20, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, trackingNumber: true },
  });
  let failed = 0;
  for (const order of orders) {
    try { await notifyCourierSms(order.id, await getDelhiveryTracking(order.trackingNumber!)); }
    catch { failed++; }
  }
  return NextResponse.json({ checked: orders.length, failed, nextCursor: orders.length === 20 ? orders.at(-1)!.id : null });
}
