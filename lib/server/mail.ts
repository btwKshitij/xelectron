import nodemailer from "nodemailer";

export function getMailTransporter() {
  const host = (process.env.SMTP_HOST || "mail.xelectron.com").trim().replace(/^["']|["']$/g, "");
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false" && port === 465;

  let user = (process.env.SMTP_USER || "info@xelectron.com").trim().replace(/^["']|["']$/g, "");
  let pass = (process.env.SMTP_PASS || "@Gohype#123").trim().replace(/^["']|["']$/g, "");

  if (pass === "@Gohype" || !pass) {
    pass = "@Gohype#123";
  }
  if (!user) {
    user = "info@xelectron.com";
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendMailOptions) {
  try {
    const transporter = getMailTransporter();
    const fromAddress =
      options.from ||
      process.env.SMTP_FROM ||
      `"XElectron Technologies" <${process.env.SMTP_USER || "info@xelectron.com"}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      html: options.html,
      replyTo: options.replyTo || (process.env.SMTP_USER || "info@xelectron.com"),
      headers: {
        "X-Mailer": "XElectron Mailer v2.0",
      },
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email via SMTP:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP sending failed",
    };
  }
}

/**
 * Sends a modern, beautifully designed Inquiry Confirmation Email to the customer
 */
export async function sendInquiryCustomerEmail({
  name,
  email,
  department,
  message,
  targetEmail,
}: {
  name: string;
  email: string;
  department: string;
  message: string;
  targetEmail: string;
}) {
  const currentYear = new Date().getFullYear();
  const ticketId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We Received Your Message - XElectron</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 0; }
          .main-card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05); }
          .brand-header { background: #0f172a; padding: 28px 32px; text-align: center; border-bottom: 3px solid #0a7ae6; }
          .logo-text { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
          .logo-text span { color: #38bdf8; }
          .hero-section { padding: 32px 32px 20px 32px; text-align: center; }
          .badge { display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .headline { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px; line-height: 1.25; }
          .subtext { color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 auto; max-width: 440px; }
          .content-box { padding: 0 32px 32px 32px; }
          .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 16px 0 24px 0; }
          .cta-wrapper { text-align: center; margin: 24px 0 8px 0; }
          .cta-btn { display: inline-block; background: #0a7ae6; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.2px; box-shadow: 0 4px 14px rgba(10, 122, 230, 0.25); }
          .contact-strip { background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 24px; text-align: center; }
          .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="main-card">
            <!-- Brand Header -->
            <div class="brand-header">
              <h1 class="logo-text">X<span>ELECTRON</span></h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Official Customer Experience</p>
            </div>

            <!-- Hero Section -->
            <div class="hero-section">
              <span class="badge">✓ Message Received</span>
              <h2 class="headline">We're on it!</h2>
              <p class="subtext">
                Hi <strong>${name}</strong>, thank you for reaching out to XElectron Technologies. Your inquiry has been routed to our team and we will get back to you within <strong>24 business hours</strong>.
              </p>
            </div>

            <!-- Details Box -->
            <div class="content-box">
              <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Reference ID</td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="font-family: monospace; font-size: 12px; font-weight: 700; background: #e2e8f0; color: #1e293b; padding: 3px 8px; border-radius: 6px;">${ticketId}</span>
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Department</td>
                    <td style="padding: 10px 0; text-align: right; color: #0a7ae6; font-size: 13px; font-weight: 700;">${department}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Status</td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="font-size: 12px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 9999px;">● Assigned & In Review</span>
                    </td>
                  </tr>
                </table>

                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #e2e8f0;">
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 6px;">Your Message</div>
                  <div style="font-size: 13px; color: #334155; line-height: 1.5; background: #ffffff; padding: 12px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-style: italic;">
                    "${message.length > 250 ? message.slice(0, 250) + "..." : message}"
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="cta-wrapper">
                <a href="https://xelectron.com/shop" class="cta-btn" target="_blank">
                  Visit Store & Explore Products →
                </a>
              </div>
            </div>

            <!-- Quick Contact Strip -->
            <div class="contact-strip">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 10px;">Need immediate assistance?</div>
              <table style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px; font-size: 12px; font-weight: 600;">
                    <a href="tel:8527312304" style="color: #0a7ae6; text-decoration: none;">📞 +91 8527312304</a>
                  </td>
                  <td style="padding: 0 10px; font-size: 12px; font-weight: 600;">
                    <a href="https://wa.me/918527312304" style="color: #059669; text-decoration: none;" target="_blank">💬 WhatsApp</a>
                  </td>
                  <td style="padding: 0 10px; font-size: 12px; font-weight: 600;">
                    <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">✉️ Email Team</a>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">XElectron Technologies Pvt. Ltd.</p>
              <p style="margin: 0 0 8px 0;">2417, Tower A, The Corenthum, Sector – 62, Noida, UP – 201301</p>
              <p style="margin: 0;">© ${currentYear} XElectron Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Hi ${name},\n\nWe have received your message regarding ${department} (Ref: ${ticketId}).\nOur team will review your inquiry and reach out within 24 business hours.\n\nNeed immediate assistance?\nCall: +91 8527312304 / +91 9870293008 (Mon-Sat, 10 AM - 6 PM)\nEmail: ${targetEmail}\n\nThank you,\nXElectron Technologies Pvt. Ltd.\n2417, Tower A, The Corenthum, Sector-62, Noida`;

  return sendEmail({
    to: email,
    subject: `We Received Your Message [${ticketId}] - XElectron Technologies`,
    html,
    text,
    replyTo: targetEmail,
  });
}

/**
 * Sends a rich HTML Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  total: number;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  items?: Array<{ name?: string; quantity: number; price?: number }>;
}) {
  if (!order.customerEmail) return;

  const orderNumber = `XE-${order.id.slice(-6).toUpperCase()}`;
  const formattedTotal = `₹${Math.round(order.total).toLocaleString("en-IN")}`;
  const currentYear = new Date().getFullYear();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - XElectron</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 0; }
          .main-card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05); }
          .brand-header { background: #0f172a; padding: 28px 32px; text-align: center; border-bottom: 3px solid #0a7ae6; }
          .logo-text { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
          .logo-text span { color: #38bdf8; }
          .hero-section { padding: 32px 32px 20px 32px; text-align: center; }
          .badge { display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .headline { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px; }
          .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 32px; }
          .cta-wrapper { text-align: center; margin: 24px 32px 32px 32px; }
          .cta-btn { display: inline-block; background: #0a7ae6; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="main-card">
            <div class="brand-header">
              <h1 class="logo-text">X<span>ELECTRON</span></h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Official Order Confirmation</p>
            </div>

            <div class="hero-section">
              <span class="badge">✓ Order Confirmed</span>
              <h2 class="headline">Thank you for your order!</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Hi ${order.customerName || "Valued Customer"}, your order has been received and is being prepared for fulfillment. We will share courier details when your shipment is ready.</p>
            </div>

            <div class="details-card">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Order Number</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 800; text-align: right; font-family: monospace;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Total Amount</td>
                  <td style="padding: 8px 0; color: #0a7ae6; font-size: 14px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                </tr>
                ${
                  order.shippingCarrier
                    ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Carrier Partner</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${order.shippingCarrier}</td>
                </tr>
                `
                    : ""
                }
                ${
                  order.trackingNumber
                    ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Delhivery AWB</td>
                  <td style="padding: 8px 0; color: #0a7ae6; font-size: 13px; font-weight: 800; text-align: right; font-family: monospace;">${order.trackingNumber}</td>
                </tr>
                `
                    : ""
                }
                ${
                  order.estimatedDelivery
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Estimated Delivery</td>
                  <td style="padding: 8px 0; color: #059669; font-size: 13px; font-weight: 700; text-align: right;">${order.estimatedDelivery}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

            ${
              order.trackingNumber && order.trackingUrl
                ? `
            <div class="cta-wrapper">
              <a href="${order.trackingUrl}" class="cta-btn" target="_blank">
                Track Shipment on Delhivery →
              </a>
            </div>
            `
                : ""
            }

            <div class="footer">
              <p style="margin: 0 0 6px 0;"><strong>XElectron Technologies Pvt. Ltd.</strong></p>
              <p style="margin: 0 0 10px 0;">2417, Tower A, The Corenthum, Sector – 62, Noida, UP – 201301</p>
              <p style="margin: 0;">© ${currentYear} XElectron Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Your XElectron Order Confirmation [${orderNumber}]`,
    html,
  });
}
