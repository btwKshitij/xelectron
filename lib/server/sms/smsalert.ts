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
  const apiKey = process.env.SMSALERT_API_KEY?.trim();
  const senderId = process.env.SMSALERT_SENDER_ID || "XELECT";

  // Clean 10-digit phone number
  const digits = options.phone.replace(/[^0-9]/g, "");
  const cleanPhone = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  const recipient = `******${cleanPhone.slice(-4)}`;
  // Only log selected fields: never the request URL, API key, or OTP text.
  const safeText = (value: unknown) => String(value ?? "")
    .replaceAll(apiKey || "__missing_key__", "[redacted]")
    .replaceAll(options.message, "[message redacted]")
    .replace(/\b\d{5,12}\b/g, "[redacted]")
    .replace(/[\r\n]/g, " ").slice(0, 300);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { success: false, error: "Please enter a valid Indian mobile number" };
  }

  if (!apiKey) {
    console.error("[SMS ALERT] Not configured", { recipient });
    return {
      success: false,
      error: "SMS service is not configured",
    };
  }

  try {
    console.info("[SMS ALERT] Submitting OTP", { recipient, sender: senderId, route: "transactional" });
    const url = new URL("https://www.smsalert.co.in/api/push.json");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("sender", senderId);
    url.searchParams.set("route", "transactional");
    url.searchParams.set("mobileno", `91${cleanPhone}`);
    url.searchParams.set("text", options.message);

    if (options.templateId || process.env.SMSALERT_TEMPLATE_ID) {
      url.searchParams.set(
        "template",
        options.templateId || process.env.SMSALERT_TEMPLATE_ID || ""
      );
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const details = data.description;
    const messages = Array.isArray(details?.batch_dtl) ? details.batch_dtl : [];
    const statuses = messages.map((item: { status?: unknown; msgid?: unknown }) => ({
      messageId: String(item.msgid ?? ""), status: safeText(item.status),
    }));
    console.info("[SMS ALERT] Provider response", {
      recipient, httpStatus: response.status, status: safeText(data.status),
      description: safeText(typeof details === "string" ? details : details?.desc),
      batchId: String(details?.batchid ?? ""), messages: statuses,
    });
    const rejected = statuses.find((item: { status: string }) =>
      item.status && !["DELIVRD", "AWAITED-DLR", "PENDING", "DEFERRED"].includes(item.status.toUpperCase())
    );
    if (rejected) {
      console.error("[SMS ALERT] Delivery rejected", { recipient, status: rejected.status });
      return { success: false, error: "SMS could not be delivered. Please contact support or try another mobile number." };
    }

    if (response.ok && data.status === "success") {
      console.info("[SMS ALERT] Request accepted; handset delivery is not confirmed. Check the batch delivery report.");
      return { success: true, data };
    } else {
      return {
        success: false,
        error: "SMS provider rejected the message. Please try again or contact support.",
      };
    }
  } catch (error) {
    console.error("[SMS ALERT] Request failed", { recipient,
      reason: error instanceof Error ? safeText(error.name) : "Unknown error" });
    return {
      success: false,
      error: "Unable to reach SMS provider. Please try again.",
    };
  }
}

/**
 * Sends a 6-digit OTP SMS to customer mobile
 */
export async function sendOtpSms(phone: string, otp: string) {
  const message = `XElectron: Your account verification code is ${otp}. Please use this code to complete your account registration.`;
  return sendSmsViaSmsAlert({ phone, message });
}
