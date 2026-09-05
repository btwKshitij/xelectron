import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { sendEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

const requestTypes = new Set([
  "Replacement (Within 7 Days)",
  "Warranty Repair",
  "Out of Warranty Repair",
]);

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = cleanText(body?.name, 120);
    const phone = cleanText(body?.phone, 40);
    const serialNumber = cleanText(body?.serialNumber, 120);
    const requestType = cleanText(body?.requestType, 80);
    const address = cleanText(body?.address, 600);
    const issueDetails = cleanText(body?.issueDetails, 2_000);

    if (!name || !phone || !serialNumber || !issueDetails) {
      return NextResponse.json(
        { success: false, error: "Name, phone number, serial number, and issue description are required." },
        { status: 400 }
      );
    }

    if (!requestTypes.has(requestType)) {
      return NextResponse.json(
        { success: false, error: "Choose a valid request type." },
        { status: 400 }
      );
    }

    const serviceInbox = (
      process.env.SERVICE_REQUEST_EMAIL || process.env.SMTP_USER || "info@xelectron.com"
    ).trim();

    const html = `
      <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.5;max-width:620px">
        <div style="background:#0f1b31;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0">
          <p style="margin:0;color:#38bdf8;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">New service request</p>
          <h1 style="margin:6px 0 0;font-size:22px">Repair / replacement request</h1>
        </div>
        <div style="border:1px solid #dbe4f0;border-top:0;padding:24px;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:9px 0;color:#64748b;font-weight:700;width:150px">Customer</td><td style="padding:9px 0">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b;font-weight:700;border-top:1px solid #edf2f7">Phone</td><td style="padding:9px 0;border-top:1px solid #edf2f7"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
            <tr><td style="padding:9px 0;color:#64748b;font-weight:700;border-top:1px solid #edf2f7">Serial number</td><td style="padding:9px 0;border-top:1px solid #edf2f7;font-family:monospace;font-weight:700">${escapeHtml(serialNumber)}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b;font-weight:700;border-top:1px solid #edf2f7">Request type</td><td style="padding:9px 0;border-top:1px solid #edf2f7">${escapeHtml(requestType)}</td></tr>
            <tr><td style="padding:9px 0;color:#64748b;font-weight:700;border-top:1px solid #edf2f7;vertical-align:top">Pickup address</td><td style="padding:9px 0;border-top:1px solid #edf2f7">${address ? escapeHtml(address) : "Not provided"}</td></tr>
          </table>
          <div style="margin-top:18px;padding:16px;background:#f8fafc;border-left:3px solid #0a7ae6;border-radius:6px">
            <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Issue description</p>
            <p style="margin:0;white-space:pre-wrap">${escapeHtml(issueDetails)}</p>
          </div>
        </div>
      </div>`;

    const emailResult = await sendEmail({
      to: serviceInbox,
      subject: `[Service Request] ${serialNumber} — ${requestType}`,
      html,
      text: [
        "New repair / replacement request",
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `Serial number: ${serialNumber}`,
        `Request type: ${requestType}`,
        `Pickup address: ${address || "Not provided"}`,
        "",
        "Issue description:",
        issueDetails,
      ].join("\n"),
    });

    if (!emailResult.success) {
      console.error("Repair request email could not be delivered:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "The service request could not be sent. Please try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Repair request submission failed:", error);
    return NextResponse.json(
      { success: false, error: "The service request could not be submitted. Please try again." },
      { status: 500 }
    );
  }
}
