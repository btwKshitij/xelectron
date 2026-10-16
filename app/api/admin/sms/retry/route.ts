import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { db } from "@/lib/db";
import { renderSms, smsTemplates, type SmsEvent } from "@/lib/server/sms/templates";
import { sendSmsViaSmsAlert } from "@/lib/server/sms/smsalert";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (typeof body.key !== "string" || body.confirmedNotDelivered !== true) return NextResponse.json({ error: "Check the provider report and explicitly confirm the previous SMS was not delivered before retrying." }, { status: 400 });
    const rows = await db.$queryRaw<{ event: string; phone: string; variables: string[] }[]>`
      UPDATE sms_notifications SET status = 'SENDING', updated_at = NOW()
      WHERE event_key = ${body.key} AND (status = 'REVIEW' OR (status = 'SENDING' AND updated_at < NOW() - INTERVAL '15 minutes'))
      RETURNING event, phone, variables`;
    const record = rows[0];
    if (!record) return NextResponse.json({ error: "Notification is already accepted, currently sending, or does not exist." }, { status: 409 });
    if (!Object.hasOwn(smsTemplates, record.event) || /Otp$/.test(record.event)) throw new Error("Invalid event");
    const result = await sendSmsViaSmsAlert({ phone: record.phone, ...renderSms(record.event as SmsEvent, record.variables) });
    const status = result.success ? "ACCEPTED" : "REVIEW";
    const batchId = result.success ? String(result.data?.description?.batchid ?? "") : "";
    await db.$executeRaw`UPDATE sms_notifications SET status = ${status}, batch_id = ${batchId}, updated_at = NOW() WHERE event_key = ${body.key}`;
    return NextResponse.json({ accepted: result.success });
  } catch (error) {
    return NextResponse.json({ error: "Retry could not be completed. Review the notification before retrying again." }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
