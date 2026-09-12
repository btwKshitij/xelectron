import { db } from "@/lib/db";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/server/mail";

const bulkOrderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.string().trim().max(150).optional().default(""),
  email: z.string().trim().email("Invalid email address").max(254),
  phone: z.string().trim().min(6, "Phone number is required").max(40),
  productCategory: z.string().trim().max(100).optional().default("General / Mixed"),
  quantity: z.string().trim().max(80).optional().default("10+ units"),
  requirementType: z.string().trim().max(100).optional().default("Corporate Order"),
  deliveryLocation: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(10000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulkOrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid input details.";
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }

    const {
      name,
      company,
      email,
      phone,
      productCategory,
      quantity,
      requirementType,
      deliveryLocation,
      message,
    } = parsed.data;

    const salesEmail = process.env.SALES_EMAIL?.trim() || "sales@xelectron.com";
    const backupAdminEmail =
      process.env.SMTP_USER?.trim() && process.env.SMTP_USER.trim() !== salesEmail
        ? process.env.SMTP_USER.trim()
        : undefined;

    // 1. Save to SupportRequest table with kind "BULK_ORDER"
    const saved = await db.supportRequest.create({
      data: {
        kind: "BULK_ORDER",
        details: {
          name,
          company: company || "Not specified",
          email,
          phone,
          productCategory,
          quantity,
          requirementType,
          deliveryLocation: deliveryLocation || "Not specified",
          message,
          routedToEmail: salesEmail,
          backupEmail: backupAdminEmail || null,
        },
      },
    });

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!
      );

    // 2. Email Notification to Sales Team
    const adminNotificationHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #0a7ae6 0%, #034d98 100%); color: white; padding: 24px;">
              <h2 style="margin: 0; font-size: 20px; color: #ffffff;">📦 New Bulk Order Inquiry</h2>
              <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 13px;">Reference: #${saved.id.slice(-8).toUpperCase()} · Routed to: ${salesEmail}</p>
            </div>
            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 140px;">Client Name:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${escapeHtml(name)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Company / Org:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${escapeHtml(company || "Not provided")}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Email:</td>
                  <td style="padding: 10px 0; color: #0a7ae6; font-size: 14px;"><a href="mailto:${email}" style="color: #0a7ae6; text-decoration: none;">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Phone / WhatsApp:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px;"><strong><a href="tel:${phone}" style="color: #0f172a; text-decoration: none;">${phone}</a></strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Product Category:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${escapeHtml(productCategory)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Estimated Quantity:</td>
                  <td style="padding: 10px 0; color: #0369a1; font-size: 14px; font-weight: bold;">${escapeHtml(quantity)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Purpose / Type:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${escapeHtml(requirementType)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Delivery City/Pin:</td>
                  <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${escapeHtml(deliveryLocation || "Not provided")}</td>
                </tr>
              </table>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0a7ae6; padding: 16px; border-radius: 8px;">
                <p style="margin: 0 0 6px 0; font-weight: 700; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Requirements & Notes:</p>
                <p style="margin: 0; white-space: pre-wrap; font-size: 13px; color: #1e293b;">${escapeHtml(message)}</p>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
                <a href="https://wa.me/91${phone.replace(/[^0-9]/g, "").slice(-10)}?text=Hello%20${encodeURIComponent(name)},%20thank%20you%20for%20contacting%20XElectron%20regarding%20your%20bulk%20order%20inquiry." style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px;">Chat on WhatsApp with Client</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const salesDelivery = await sendEmail({
      to: salesEmail,
      cc: backupAdminEmail,
      subject: `[Bulk Order Inquiry] ${company ? `${company} - ` : ""}${name} (${quantity})`,
      html: adminNotificationHtml,
      text: `New Bulk Order Inquiry\n\nClient: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\nCategory: ${productCategory}\nQuantity: ${quantity}\nType: ${requirementType}\nLocation: ${deliveryLocation}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    if (!salesDelivery.success) {
      console.error("[BulkOrder] Could not dispatch sales email notification:", salesDelivery.error);
    } else {
      console.log(`[BulkOrder] Dispatched quotation request successfully to ${salesEmail} (ID: ${salesDelivery.messageId})`);
    }

    // 3. Customer Acknowledgement Email
    const customerAcknowledgementHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #f8fafc;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; color: #ffffff;">XElectron Corporate Sales</h2>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Bulk Quotation Request Acknowledged</p>
            </div>
            <div style="padding: 24px;">
              <p style="margin-top: 0; font-size: 14px;">Dear <strong>${escapeHtml(name)}</strong>,</p>
              <p style="font-size: 14px; color: #334155;">Thank you for your bulk order inquiry with XElectron. We have received your request for <strong>${escapeHtml(productCategory)}</strong> (${escapeHtml(quantity)}).</p>
              <p style="font-size: 14px; color: #334155;">Your request has been routed directly to our Corporate Sales Desk at <strong>sales@xelectron.com</strong>. A dedicated Corporate Key Account Manager has been assigned to your request and will contact you within <strong>2 to 4 business hours</strong> with wholesale volume tier slabs and delivery timelines.</p>
              
              <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px; color: #1e40af;">Need immediate assistance?</p>
                <p style="margin: 0; font-size: 13px; color: #1e3a8a;">Call our Corporate Sales Desk at <strong>+91 9870293008</strong> or WhatsApp us at <strong>9870293008</strong>.</p>
              </div>

              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Warm regards,<br><strong>Corporate & Institutional Sales Team</strong><br>XElectron Technologies Pvt. Ltd.<br><a href="mailto:sales@xelectron.com" style="color: #0a7ae6; text-decoration: none;">sales@xelectron.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: `We've received your Bulk Order inquiry - XElectron [Ref: #${saved.id.slice(-8).toUpperCase()}]`,
      html: customerAcknowledgementHtml,
      text: `Dear ${name},\n\nThank you for reaching out to XElectron for bulk order inquiry. We have received your request for ${productCategory} (${quantity}).\n\nOur Corporate Sales Team will contact you within 2-4 business hours.\n\nImmediate assistance: +91 9870293008 / sales@xelectron.com\n\nBest regards,\nXElectron Technologies`,
      replyTo: "sales@xelectron.com",
    }).catch((err) => {
      console.warn("Could not dispatch customer acknowledgement email:", err);
    });

    return NextResponse.json({
      success: true,
      reference: saved.id,
      salesEmail,
      message: `Your bulk order inquiry has been sent to our corporate sales desk (${salesEmail}).`,
    });
  } catch (error) {
    console.error("Bulk order submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit bulk order inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
