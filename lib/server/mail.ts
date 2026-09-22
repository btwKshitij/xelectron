import nodemailer from "nodemailer";

export function getMailTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || "587");
  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS must be configured.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Keep the queue across development hot reloads. Each server process sends one
// message at a time; the provider may also enforce limits across server instances.
const mailState = globalThis as typeof globalThis & { smtpQueue?: Promise<void> };

export function sendEmail(options: SendMailOptions) {
  const result = (mailState.smtpQueue ?? Promise.resolve()).then(() => sendEmailNow(options));
  mailState.smtpQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function sendEmailNow(options: SendMailOptions) {
  let transporter: ReturnType<typeof getMailTransporter> | undefined;
  try {
    transporter = getMailTransporter();
    const fromAddress =
      options.from ||
      process.env.SMTP_FROM ||
      `"XElectron Technologies" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text || options.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      html: options.html,
      replyTo: options.replyTo || (process.env.SMTP_USER),
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
  } finally {
    transporter?.close();
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

export const ORDER_NOTIFICATION_EMAILS = [
  "info@xelectron.com",
  "customercare@xelectron.com",
];

export function getOrderNotificationEmails(): string[] {
  const envEmails = process.env.ORDER_NOTIFICATION_EMAILS;
  if (envEmails) {
    const parsed = envEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return [...ORDER_NOTIFICATION_EMAILS];
}

export interface OrderEmailItem {
  name?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  product?: { name?: string; mainImage?: string | null };
}

export interface SendOrderConfirmationOptions {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  paymentMethod?: string | null;
  total: number;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  items?: OrderEmailItem[];
}

/**
 * Sends Order Confirmation Email to the customer and dispatches notification alerts
 * to info@xelectron.com and customercare@xelectron.com when an order is created.
 */
export async function sendOrderConfirmationEmail(order: SendOrderConfirmationOptions) {
  const orderNumber = `XE-${order.id.slice(-6).toUpperCase()}`;
  const formattedTotal = `₹${Math.round(order.total).toLocaleString("en-IN")}`;
  const currentYear = new Date().getFullYear();
  const deliveryAddress =
    order.shippingAddress ||
    [order.city, order.state, order.pincode].filter(Boolean).join(", ");
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xelectron.com";
  const dashboardOrderUrl = `${siteUrl}/dashboard/orders/${order.id}`;

  const itemsTableHtml =
    order.items && order.items.length > 0
      ? `
        <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px;">Ordered Products (${order.items.length})</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                <th style="padding: 6px 0; text-align: left;">Product</th>
                <th style="padding: 6px 8px; text-align: center;">Qty</th>
                <th style="padding: 6px 0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map((item) => {
                  const name = item.name || item.product?.name || "Product";
                  const unit = item.unitPrice ?? item.price ?? 0;
                  const lineTotal = Math.round(unit * item.quantity);
                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${name}</td>
                      <td style="padding: 8px; text-align: center; color: #475569;">${item.quantity}</td>
                      <td style="padding: 8px 0; text-align: right; color: #0f172a; font-weight: 600;">₹${lineTotal.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `
      : "";

  // 1. Customer Confirmation Email HTML
  const customerHtml = `
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
              <p style="color: #64748b; font-size: 14px; margin: 0;">Hi ${order.customerName || "Valued Customer"}, your order has been received and is being prepared for fulfillment. We will share courier tracking details as soon as your package is dispatched.</p>
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
                  order.paymentMethod
                    ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Payment Mode</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${order.paymentMethod}</td>
                </tr>
                `
                    : ""
                }
                ${
                  deliveryAddress
                    ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; vertical-align: top;">Delivery Address</td>
                  <td style="padding: 8px 0; color: #334155; font-size: 12px; font-weight: 500; text-align: right; max-width: 280px;">${deliveryAddress}</td>
                </tr>
                `
                    : ""
                }
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

              ${itemsTableHtml}
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
              <p style="margin: 0 0 4px 0;">Customer Support: <a href="mailto:customercare@xelectron.com" style="color: #0a7ae6; text-decoration: none;">customercare@xelectron.com</a> | Call: +91 8527312304</p>
              <p style="margin: 0 0 10px 0;">2417, Tower A, The Corenthum, Sector – 62, Noida, UP – 201301</p>
              <p style="margin: 0;">© ${currentYear} XElectron Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const customerText = `Thank you for your order!
Order Number: ${orderNumber}
Total Amount: ${formattedTotal}
${order.paymentMethod ? `Payment Mode: ${order.paymentMethod}\n` : ""}${deliveryAddress ? `Delivery Address: ${deliveryAddress}\n` : ""}${order.trackingNumber ? `Tracking AWB: ${order.trackingNumber}\n` : ""}
Need help? Contact Customer Support at customercare@xelectron.com or call +91 8527312304.
XElectron Technologies Pvt. Ltd.`;

  // 2. Admin / Internal Notification Email HTML (for info@xelectron.com and customercare@xelectron.com)
  const adminHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert - XElectron</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 36px 0; }
          .main-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05); }
          .brand-header { background: #0f172a; padding: 24px 32px; text-align: center; border-bottom: 3px solid #0a7ae6; }
          .logo-text { color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
          .logo-text span { color: #38bdf8; }
          .hero-section { padding: 28px 32px 16px 32px; text-align: center; }
          .badge { display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px; }
          .headline { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; }
          .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 32px; }
          .cta-wrapper { text-align: center; margin: 20px 32px 28px 32px; }
          .cta-btn { display: inline-block; background: #0a7ae6; color: #ffffff !important; text-decoration: none; padding: 12px 26px; border-radius: 10px; font-weight: 700; font-size: 13px; letter-spacing: 0.3px; }
          .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; background: #fafafa; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="main-card">
            <div class="brand-header">
              <h1 class="logo-text">X<span>ELECTRON</span></h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Store Operations • New Order Alert</p>
            </div>

            <div class="hero-section">
              <span class="badge">🔔 New Order Placed</span>
              <h2 class="headline">${orderNumber} • ${formattedTotal}</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">A new order was successfully created on xelectron.com. Please review the customer details and fulfillment requirements below.</p>
            </div>

            <div class="details-card">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Order Reference</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 800; text-align: right; font-family: monospace;">${orderNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Order Amount</td>
                  <td style="padding: 8px 0; color: #0a7ae6; font-size: 14px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Payment Status / Method</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 12px; font-weight: 700; text-align: right;">${order.paymentMethod || "Online / COD"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Customer Name</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${order.customerName || "Not provided"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Customer Phone</td>
                  <td style="padding: 8px 0; text-align: right;">
                    ${order.customerPhone ? `<a href="tel:${order.customerPhone}" style="color: #0a7ae6; font-weight: 700; text-decoration: none; font-size: 13px;">${order.customerPhone}</a>` : '<span style="color: #94a3b8; font-size: 12px;">N/A</span>'}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">Customer Email</td>
                  <td style="padding: 8px 0; text-align: right;">
                    ${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color: #0a7ae6; font-weight: 600; text-decoration: none; font-size: 12px;">${order.customerEmail}</a>` : '<span style="color: #94a3b8; font-size: 12px;">Not provided</span>'}
                  </td>
                </tr>
                ${
                  deliveryAddress
                    ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; vertical-align: top;">Shipping Address</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 12px; font-weight: 500; text-align: right; max-width: 300px;">${deliveryAddress}</td>
                </tr>
                `
                    : ""
                }
              </table>

              ${itemsTableHtml}
            </div>

            <div class="cta-wrapper">
              <a href="${dashboardOrderUrl}" class="cta-btn" target="_blank">
                Open in Admin Dashboard →
              </a>
            </div>

            <div class="footer">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">XElectron Operations Notification</p>
              <p style="margin: 0;">Dispatched to store operations: info@xelectron.com & customercare@xelectron.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const adminText = `[New Order Alert] Order ${orderNumber}
Total: ${formattedTotal}
Payment: ${order.paymentMethod || "Online / COD"}
Customer: ${order.customerName || "N/A"}
Phone: ${order.customerPhone || "N/A"}
Email: ${order.customerEmail || "N/A"}
Address: ${deliveryAddress || "N/A"}
${
  order.items && order.items.length > 0
    ? `\nItems:\n` +
      order.items
        .map(
          (i) =>
            `- ${i.name || i.product?.name || "Item"} x ${i.quantity} (₹${((i.unitPrice ?? i.price ?? 0) * i.quantity).toLocaleString("en-IN")})`
        )
        .join("\n")
    : ""
}

Dashboard URL: ${dashboardOrderUrl}`;

  const deliveries: Promise<any>[] = [];

  // Dispatch customer confirmation if email address is available
  if (order.customerEmail && order.customerEmail.trim()) {
    deliveries.push(
      sendEmail({
        to: order.customerEmail.trim(),
        replyTo: "customercare@xelectron.com",
        subject: `Your XElectron Order Confirmation [${orderNumber}]`,
        html: customerHtml,
        text: customerText,
      })
    );
  }

  // Dispatch store operations notification to info@xelectron.com and customercare@xelectron.com
  const notificationRecipients = getOrderNotificationEmails();
  if (notificationRecipients.length > 0) {
    deliveries.push(
      sendEmail({
        to: notificationRecipients,
        replyTo: order.customerEmail?.trim() || "customercare@xelectron.com",
        subject: `[New Order] ${orderNumber} - ${formattedTotal} (${order.customerName || "Customer"})`,
        html: adminHtml,
        text: adminText,
      })
    );
  }

  const results = await Promise.allSettled(deliveries);
  return results;
}

