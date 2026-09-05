import { NextRequest, NextResponse } from "next/server";
import { sendEmail, sendInquiryCustomerEmail } from "@/lib/server/mail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Determine target recipient based on department
    let targetEmail = "info@xelectron.com";
    if (department?.toLowerCase().includes("sales")) {
      targetEmail = "sales@xelectron.com";
    } else if (department?.toLowerCase().includes("customer") || department?.toLowerCase().includes("support")) {
      targetEmail = "customercare@xelectron.com";
    } else if (department?.toLowerCase().includes("service") || department?.toLowerCase().includes("warranty")) {
      targetEmail = "kapil@xelectron.com";
    }

    // 1. Send Notification Email to Internal Team
    const adminNotificationHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #f8fafc;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; color: white; padding: 20px 24px;">
              <h2 style="margin: 0; font-size: 18px; color: #38bdf8;">[New Website Inquiry]</h2>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Routed to: ${targetEmail}</p>
            </div>
            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: bold; width: 120px;">Department:</td>
                  <td style="padding: 6px 0; color: #0a7ae6; font-size: 13px; font-weight: bold;">${department || "General Inquiry"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: bold;">Customer Name:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: bold;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: bold;">Email:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-size: 13px;"><a href="mailto:${email}" style="color: #0a7ae6;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: bold;">Phone:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${phone || "Not provided"}</td>
                </tr>
              </table>
              <div style="background: #f8fafc; border-left: 3px solid #0a7ae6; padding: 14px 16px; border-radius: 6px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 12px; color: #475569; text-transform: uppercase;">Message:</p>
                <p style="margin: 0; white-space: pre-wrap; font-size: 13px; color: #1e293b;">${message}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: targetEmail,
      subject: `[Website Inquiry] ${name} - ${department || "General Inquiry"}`,
      html: adminNotificationHtml,
      text: `New Website Inquiry\n\nDepartment: ${department || "General Inquiry"}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    // 2. Send Premium Branded Confirmation Email to Customer
    await sendInquiryCustomerEmail({
      name,
      email,
      department: department || "Customer Support",
      message,
      targetEmail,
    });

    return NextResponse.json({
      success: true,
      message: `Inquiry sent successfully to ${targetEmail}`,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to send inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
