import crypto from "crypto";

export interface VelocityCustomerAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface VelocityCustomer {
  name: string;
  email: string;
  phone: string;
  address: VelocityCustomerAddress;
}

export interface VelocityLineItem {
  name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  discount?: number;
  tax?: number;
}

export interface VelocityOrderDetails {
  total_price: number;
  total_discount?: number;
  total_tax?: number;
  line_items: VelocityLineItem[];
}

export interface CreateVelocityOrderPayload {
  order_id: string;
  customer: VelocityCustomer;
  order_details: VelocityOrderDetails;
  notes?: string;
}

export interface VelocityOrderResponse {
  velocity_order_id: string;
  order_id: string;
  customer: VelocityCustomer;
  order_details: VelocityOrderDetails;
  notes?: string;
  payments: unknown[];
  status: string;
  created_at: string;
}

export interface VelocityOrderSession {
  session_uuid: string;
  order_uuid: string;
  status: "created" | "processing" | "success" | "failed";
  kfs_url?: string;
  error?: {
    reason?: string;
    code?: string;
    step?: string;
    description?: string;
    source?: string;
  };
}

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractVelocityOrderResponse(value: unknown): VelocityOrderResponse | null {
  if (!isJsonRecord(value)) return null;

  const candidates: unknown[] = [
    value,
    value.data,
    value.order,
    isJsonRecord(value.data) ? value.data.order : undefined,
  ];

  for (const candidate of candidates) {
    if (
      isJsonRecord(candidate) &&
      typeof candidate.velocity_order_id === "string" &&
      candidate.velocity_order_id.trim()
    ) {
      return candidate as unknown as VelocityOrderResponse;
    }
  }

  return null;
}

export function getVelocityConfig() {
  const isProd = process.env.VELOCITY_ENVIRONMENT === "production";
  const apiKey = process.env.VELOCITY_API_KEY || "";
  const apiSecret = process.env.VELOCITY_API_SECRET || "";
  const publicApiKey = process.env.VELOCITY_PUBLIC_API_KEY || apiKey;
  const configuredMerchantId = process.env.VELOCITY_MERCHANT_ID || "";
  // A webhook endpoint was mistakenly configured as the merchant ID. Merchant
  // IDs are issued by Velocity and must not be URLs.
  const merchantId = /^https?:\/\//i.test(configuredMerchantId)
    ? ""
    : configuredMerchantId;
  const webhookSecret = process.env.VELOCITY_WEBHOOK_SECRET || "";

  const apiBaseUrl = isProd
    ? "https://loki.velocity.in"
    : "https://loki.stagingvelocity.in";

  const checkoutBaseUrl = isProd
    ? "https://checkout.velocity.in"
    : "https://checkout.stagingvelocity.in";

  return {
    isProd,
    apiKey,
    apiSecret,
    publicApiKey,
    merchantId,
    webhookSecret,
    apiBaseUrl,
    checkoutBaseUrl,
  };
}

function requireVelocityConfig() {
  const config = getVelocityConfig();
  if (
    !config.apiKey ||
    !config.apiSecret ||
    !config.merchantId ||
    !config.webhookSecret
  ) {
    throw new Error(
      "Velocity payment is not configured. Set VELOCITY_API_KEY, VELOCITY_API_SECRET, VELOCITY_MERCHANT_ID (the merchant code), and VELOCITY_WEBHOOK_SECRET."
    );
  }
  return config;
}

/** Validates all credentials required for a secure Velocity checkout. */
export function assertVelocityConfig() {
  return requireVelocityConfig();
}

function velocityHeaders(config: ReturnType<typeof getVelocityConfig>) {
  const authHeader = `Basic ${Buffer.from(
    `${config.apiKey}:${config.apiSecret}`
  ).toString("base64")}`;

  return {
    Authorization: authHeader,
    "X-Merchant-ID": config.merchantId,
    "Content-Type": "application/json",
  };
}

/**
 * Creates an order in Velocity's server API
 */
export async function createVelocityOrder(
  payload: CreateVelocityOrderPayload
): Promise<VelocityOrderResponse> {
  const config = requireVelocityConfig();

  const res = await fetch(`${config.apiBaseUrl}/merchant/api/orders`, {
    method: "POST",
    headers: velocityHeaders(config),
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json();

  if (!res.ok || !data) {
    const response = isJsonRecord(data) ? data : {};
    const errorMsg =
      (typeof response.message === "string" && response.message) ||
      (typeof response.error === "string" && response.error) ||
      `Velocity API error (Status: ${res.status})`;
    throw new Error(errorMsg);
  }

  const order = extractVelocityOrderResponse(data);
  if (!order) {
    console.error("Velocity order response did not include velocity_order_id", {
      keys: isJsonRecord(data) ? Object.keys(data) : [],
      nestedDataKeys: isJsonRecord(data) && isJsonRecord(data.data) ? Object.keys(data.data) : [],
    });
    throw new Error("Velocity returned an order response without a velocity_order_id.");
  }

  return order;
}

/** Fetches all payment attempts for a Velocity order. */
export async function getVelocityOrderSessions(
  velocityOrderId: string
): Promise<VelocityOrderSession[]> {
  const config = requireVelocityConfig();
  const res = await fetch(
    `${config.apiBaseUrl}/merchant/api/orders/${encodeURIComponent(velocityOrderId)}/sessions`,
    {
      method: "GET",
      headers: velocityHeaders(config),
    }
  );
  const data = await res.json();

  if (!res.ok || !data) {
    const errorMsg =
      data?.message || data?.error || `Velocity API error (Status: ${res.status})`;
    throw new Error(errorMsg);
  }

  if (Array.isArray(data)) return data as VelocityOrderSession[];
  if (Array.isArray(data.data)) return data.data as VelocityOrderSession[];
  throw new Error("Unexpected Velocity order-sessions response.");
}

/**
 * Builds the hosted Velocity checkout redirection URL
 */
export function buildVelocityRedirectUrl(params: {
  velocityOrderId: string;
  stateToken: string;
  redirectUri: string;
}): string {
  const config = requireVelocityConfig();
  if (!params.velocityOrderId?.trim()) {
    throw new Error("Cannot build a Velocity checkout URL without a velocity_order_id.");
  }

  const searchParams = new URLSearchParams({
    order_id: params.velocityOrderId,
    state: params.stateToken,
    redirect_uri: params.redirectUri,
    api_key: config.publicApiKey,
    merchant_id: config.merchantId,
  });

  return `${config.checkoutBaseUrl}/payments?${searchParams.toString()}`;
}

/** Creates a tamper-evident partner state token for the hosted checkout return. */
export function createVelocityStateToken(orderId: string): string {
  const config = requireVelocityConfig();
  const payload = Buffer.from(
    JSON.stringify({ orderId, issuedAt: Date.now(), nonce: crypto.randomBytes(16).toString("hex") })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", config.webhookSecret)
    .update(payload)
    .digest("hex");

  return `v1.${payload}.${signature}`;
}

/** Returns the partner order ID only when a state token is authentic. */
export function parseVelocityStateToken(state: string | null): string | null {
  if (!state) return null;
  const [version, payload, signature, ...extra] = state.split(".");
  if (version !== "v1" || !payload || !signature || extra.length > 0) return null;

  const config = getVelocityConfig();
  if (!config.webhookSecret) return null;

  const expectedSignature = crypto
    .createHmac("sha256", config.webhookSecret)
    .update(payload)
    .digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof value?.orderId === "string" && value.orderId ? value.orderId : null;
  } catch {
    return null;
  }
}

/**
 * Validates HMAC SHA-256 signature on Velocity Webhooks
 */
export function verifyVelocityWebhook(
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
    console.error("Velocity signature verification error:", err);
    return false;
  }
}
