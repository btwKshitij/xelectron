/**
 * SMS Alert India (smsalert.co.in) Integration Helper
 * Used for sending real OTPs and order tracking notifications to Indian phone numbers via SMS.
 */

export interface SendSmsOptions {
  phone: string;
  message: string;
  templateId?: string;
}

export async function sendSmsViaSmsAlert(options: SendSmsOptions) {
  const apiKey = process.env.SMSALERT_API_KEY;
  const senderId = process.env.SMSALERT_SENDER_ID || "XELCTR";

  // Clean 10-digit phone number
  const cleanPhone = options.phone.replace(/[^0-9]/g, "").slice(-10);

  if (!apiKey) {
    console.warn(
      `[SMS ALERT] SMSALERT_API_KEY is not configured in .env. SMS to +91 ${cleanPhone} was simulated.`
    );
    return {
      success: true,
      simulated: true,
      phone: cleanPhone,
      message: options.message,
    };
  }

  try {
    const url = new URL("https://www.smsalert.co.in/api/push.json");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("sender", senderId);
    url.searchParams.set("mobileno", cleanPhone);
    url.searchParams.set("text", options.message);

    if (options.templateId || process.env.SMSALERT_TEMPLATE_ID) {
      url.searchParams.set(
        "template",
        options.templateId || process.env.SMSALERT_TEMPLATE_ID || ""
      );
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("[SMS ALERT] API Response:", data);

    if (data.status === "success" || data.description?.status === "success") {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.description?.desc || data.message || "Failed to send SMS",
      };
    }
  } catch (error) {
    console.error("[SMS ALERT] Error dispatching SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error calling SMS Alert",
    };
  }
}

/**
 * Sends a 6-digit OTP SMS to customer mobile
 */
export async function sendOtpSms(phone: string, otp: string) {
  const message = `Your XElectron verification code is ${otp}. Valid for 10 minutes. Please do not share this OTP with anyone.`;
  return sendSmsViaSmsAlert({ phone, message });
}
