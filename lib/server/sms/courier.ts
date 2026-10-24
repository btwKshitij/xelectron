import type { DelhiveryTrackingResult } from "@/lib/server/delhivery";
import { notifyOrderSms } from "./notifications";
import type { SmsEvent } from "./templates";
import { db } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/server/order-status-email";

export function courierSmsEvent(tracking: DelhiveryTrackingResult): SmsEvent | null {
  if (!tracking.found || tracking.statusType === "RT" || tracking.statusType === "RTO") return null;
  const status = tracking.status?.trim().toLowerCase();
  if (status === "delivered") return "delivered";
  if (status === "in transit") return "shipped";
  if (status === "dispatched" || status === "out for delivery") return "outForDelivery";
  if (status === "delivery failed" || status === "undelivered") return "deliveryFailed";
  if (status === "rescheduled" || status === "delivery rescheduled") return "rescheduled";
  return null;
}

export async function notifyCourierSms(orderId: string, tracking: DelhiveryTrackingResult) {
  const event = courierSmsEvent(tracking);
  const order = await db.order.findUnique({ where: { id: orderId }, include: { user: { select: { email: true } } } });
  if (!order || order.status === "CANCELLED" || order.trackingNumber !== tracking.trackingNumber) return;
  const status = event === "delivered" ? "DELIVERED" : event === "shipped" || event === "outForDelivery" ? "SHIPPED" : null;
  if (status) {
    // Claim the forward transition so repeated courier polls do not resend email
    // or restore an order cancelled while the tracking request was in flight.
    const changed = await db.order.updateMany({
      where: { id: orderId, trackingNumber: tracking.trackingNumber, status: { in: status === "DELIVERED" ? ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] : ["PENDING", "CONFIRMED", "PROCESSING"] } },
      data: { status },
    });
    if (changed.count === 1) await sendOrderStatusEmail({ ...order, status });
  }
  if (event) await notifyOrderSms(orderId, event);
}
