import type { DelhiveryTrackingResult } from "@/lib/server/delhivery";
import { notifyOrderSms } from "./notifications";
import type { SmsEvent } from "./templates";

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
  if (event) await notifyOrderSms(orderId, event);
}
