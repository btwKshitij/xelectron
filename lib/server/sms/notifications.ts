import { db } from "@/lib/db";
import { formatOrderReference } from "@/lib/order-reference";
import { renderSms, type SmsEvent } from "./templates";
import { sendSmsViaSmsAlert } from "./smsalert";

// Claim before sending. Concurrent requests/webhook retries cannot send twice.
// An interrupted/ambiguous attempt requires review, never automatic replay.
export async function notifySms(key: string, event: SmsEvent, phone: string | null | undefined, values: string[]) {
  if (!phone) return false;
  try {
    const message = renderSms(event, values);
    const claimed = await db.$queryRaw<{ event_key: string }[]>`
      INSERT INTO sms_notifications (event_key, event, phone, variables, status)
      VALUES (${key}, ${event}, ${phone}, ${JSON.stringify(values)}::jsonb, 'SENDING')
      ON CONFLICT (event_key) DO NOTHING RETURNING event_key`;
    if (!claimed.length) return false;
    const result = await sendSmsViaSmsAlert({ phone, ...message });
    const status = result.success ? "ACCEPTED" : "REVIEW";
    const batchId = result.success ? String(result.data?.description?.batchid ?? "") : "";
    await db.$executeRaw`UPDATE sms_notifications SET status = ${status}, batch_id = ${batchId}, updated_at = NOW() WHERE event_key = ${key}`;
    console.info("[SMS NOTIFICATION]", { key, event, status, batchId });
    return result.success;
  } catch {
    console.error("[SMS NOTIFICATION] Could not complete notification; check SMS storage and provider logs", { key, event });
    return false;
  }
}

export async function notifyOrderSms(id: string, event: SmsEvent, occurrence = "") {
  try {
    const order = await db.order.findUnique({ where: { id }, include: { user: { select: { phone: true } } } });
    if (!order) return false;
    if (event === "paid" && !order.paymentVerified) return false;
    if (event === "paymentFailed" && order.paymentVerified) return false;
    const values = [formatOrderReference(id)];
    if (event === "shipped") {
      if (!order.trackingNumber) return false;
      values.push(order.trackingNumber);
    }
    return await notifySms(`order:${id}:${event}:${occurrence}`, event, order.customerPhone || order.user?.phone, values);
  } catch {
    console.error("[SMS NOTIFICATION] Order lookup failed", { id, event });
    return false;
  }
}
