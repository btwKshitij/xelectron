import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { db } from "@/lib/db";
import { notifySms } from "@/lib/server/sms/notifications";
import { formatOrderReference } from "@/lib/order-reference";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const record = await db.supportRequest.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (!["WARRANTY", "COMPLAINT", "INQUIRY"].includes(record.kind)) return NextResponse.json({ error: "Not a service request" }, { status: 400 });
    const details = record.details as Record<string, unknown>;
    const phone = typeof details.phone === "string" ? details.phone : "";
    if (!phone) return NextResponse.json({ error: "Request has no phone number" }, { status: 400 });
    if (body.event === "warrantyService") {
      if (!["WARRANTY", "COMPLAINT"].includes(record.kind)) return NextResponse.json({ error: "Not a warranty or repair request" }, { status: 400 });
      if (typeof body.orderId !== "string" || !body.orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });
      const order = await db.order.findUnique({ where: { id: body.orderId } });
      if (!order || order.customerPhone?.replace(/\D/g, "").slice(-10) !== phone.replace(/\D/g, "").slice(-10)) return NextResponse.json({ error: "Order must belong to this phone number" }, { status: 400 });
      await db.supportRequest.update({ where: { id }, data: { details: { ...details, warrantyOrderId: order.id } as never } });
      const accepted = await notifySms(`warranty-service:${id}:${order.id}`, "warrantyService", phone, [id, formatOrderReference(order.id)]);
      return NextResponse.json({ accepted });
    }
    if (body.event !== "serviceUpdate") return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    const accepted = await notifySms(`service-update:${id}`, "serviceUpdate", phone, [id]);
    return NextResponse.json({ accepted });
  } catch (error) {
    return NextResponse.json({ error: "Unable to send notification" }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
