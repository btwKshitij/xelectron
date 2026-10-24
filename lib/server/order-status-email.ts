import { formatOrderReference } from "@/lib/order-reference";
import { sendEmail, type SendOrderConfirmationOptions } from "@/lib/server/mail";

const messages = {
  SHIPPED: ["Your order has shipped", "Your package is on its way."],
  DELIVERED: ["Your order has been delivered", "Your order has been marked as delivered. Thank you for shopping with XElectron."],
  CANCELLED: ["Your order has been cancelled", "Your order has been cancelled. For payment or refund questions, please contact customercare@xelectron.com."],
} as const;

export async function sendOrderStatusEmail(order: SendOrderConfirmationOptions & { status: string; user?: { email?: string | null } | null }) {
  const message = messages[order.status as keyof typeof messages];
  const email = order.customerEmail?.trim() || order.user?.email?.trim();
  if (!message || !email) return { success: false };
  const reference = formatOrderReference(order.id);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xelectron.com";
  const tracking = order.status === "SHIPPED" ? [
    order.shippingCarrier && `Courier: ${order.shippingCarrier}`,
    order.trackingNumber && `Tracking number: ${order.trackingNumber}`,
    order.estimatedDelivery && `Estimated delivery: ${order.estimatedDelivery}`,
  ].filter(Boolean).join("\n") : "";
  return sendEmail({
    to: email,
    subject: `${message[0]} [${reference}] - XElectron`,
    replyTo: "customercare@xelectron.com",
    text: `Hi ${order.customerName || "Customer"},\n\n${message[1]}\n\nOrder: ${reference}\nTotal: ₹${order.total.toLocaleString("en-IN")}\n${tracking}\n\nView your order: ${siteUrl}/orders\n\nXElectron Customer Care`,
  });
}
