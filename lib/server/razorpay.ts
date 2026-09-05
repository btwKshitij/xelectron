import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing or empty in .env");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Validates HMAC SHA-256 signature on Razorpay Webhooks
 */
export function verifyRazorpayWebhook(
  rawBody: string,
  receivedSignature: string | null | undefined,
  webhookSecret: string
): boolean {
  if (!receivedSignature || !webhookSecret) return false;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const receivedBuf = Buffer.from(receivedSignature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");

    if (receivedBuf.length !== expectedBuf.length) return false;

    return crypto.timingSafeEqual(receivedBuf, expectedBuf);
  } catch (err) {
    console.error("Razorpay webhook signature verification error:", err);
    return false;
  }
}

