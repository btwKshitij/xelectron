import "server-only";
import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import type { MetaCustomData, MetaEventName } from "@/lib/meta-pixel";

/**
 * Meta Conversions API sender. The access token lives only in server env.
 * Customer identifiers are normalized + SHA-256 hashed here; browser/network
 * identifiers (IP, user agent, fbp, fbc) are sent as-is per Meta's spec.
 */

export type MetaCustomer = {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Full name; split into fn/ln when firstName/lastName are not given. */
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

export type MetaRequestContext = {
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  /** Scheme + host of the storefront request, used to build event_source_url for backend events. */
  origin?: string;
};

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const API_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
const COOKIE_PATTERN = /^fb\.\d\.\d+\.[A-Za-z0-9_.-]+$/;

export function isMetaCapiConfigured() {
  return Boolean(PIXEL_ID && ACCESS_TOKEN);
}

export function metaRequestContext(request: NextRequest): MetaRequestContext {
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  const ip = forwarded.split(",")[0].trim();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;
  return {
    ip: ip || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    fbp: fbp && COOKIE_PATTERN.test(fbp) ? fbp : undefined,
    fbc: fbc && COOKIE_PATTERN.test(fbc) ? fbc : undefined,
    origin: request.headers.get("origin") || (host ? `${proto}://${host}` : undefined),
  };
}

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const text = (value: unknown) => String(value ?? "").trim().toLowerCase();
const compact = (value: unknown) => text(value).replace(/[^a-z0-9]/g, "");
function normalizePhone(value: unknown) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`; // Indian store: add country code when missing.
  return digits.length >= 11 && digits.length <= 15 ? digits : "";
}
function normalizeCountry(value: unknown) {
  const country = text(value);
  if (!country) return "";
  if (/^(in|india)$/.test(country)) return "in";
  return /^[a-z]{2}$/.test(country) ? country : "";
}

function buildUserData(customer: MetaCustomer, context: MetaRequestContext, sourceUrl: string) {
  const userData: Record<string, string | string[]> = {};
  if (context.ip) userData.client_ip_address = context.ip;
  if (context.userAgent) userData.client_user_agent = context.userAgent.slice(0, 1024);
  if (context.fbp) userData.fbp = context.fbp;
  let fbc = context.fbc;
  if (!fbc) {
    // Only construct fbc from a genuine fbclid on the page URL.
    try {
      const fbclid = new URL(sourceUrl).searchParams.get("fbclid");
      if (fbclid && /^[A-Za-z0-9_-]{1,255}$/.test(fbclid)) fbc = `fb.1.${Date.now()}.${fbclid}`;
    } catch { /* invalid URL: skip */ }
  }
  if (fbc) userData.fbc = fbc;

  const email = text(customer.email);
  const phone = normalizePhone(customer.phone);
  let firstName = text(customer.firstName);
  let lastName = text(customer.lastName);
  if (!firstName && !lastName && customer.name) {
    const [first, ...rest] = text(customer.name).split(/\s+/).filter(Boolean);
    firstName = first || "";
    lastName = rest.join(" ");
  }
  const city = compact(customer.city);
  const state = compact(customer.state);
  const zip = compact(customer.zip);
  const country = normalizeCountry(customer.country);

  if (email && email.includes("@")) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (firstName) userData.fn = [sha256(firstName)];
  if (lastName) userData.ln = [sha256(lastName)];
  if (city) userData.ct = [sha256(city)];
  if (state) userData.st = [sha256(state)];
  if (zip) userData.zp = [sha256(zip)];
  if (country) userData.country = [sha256(country)];
  if (customer.id) userData.external_id = [sha256(String(customer.id))];
  return userData;
}

export type MetaEventInput = {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  customer?: MetaCustomer;
  context?: MetaRequestContext;
  customData?: MetaCustomData;
  /** Unix seconds; defaults to now. */
  eventTime?: number;
};

type MetaResponse = { events_received?: number; fbtrace_id?: string; error?: { message?: string; code?: number; fbtrace_id?: string } };

/** Sends one event to Meta CAPI. Retries once on network/5xx errors with the same event_id. */
export async function sendMetaEvent(input: MetaEventInput): Promise<{ ok: boolean; error?: string }> {
  if (!isMetaCapiConfigured()) return { ok: false, error: "Meta CAPI is not configured" };
  const payload: Record<string, unknown> = {
    data: [{
      event_name: input.eventName,
      event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: "website",
      event_source_url: input.eventSourceUrl,
      user_data: buildUserData(input.customer || {}, input.context || {}, input.eventSourceUrl),
      custom_data: input.customData || {},
    }],
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      const result = (await response.json().catch(() => ({}))) as MetaResponse;
      if (response.ok) {
        console.log(`[Meta CAPI] ${input.eventName} ${input.eventId} received=${result.events_received ?? "?"} fbtrace=${result.fbtrace_id || "-"}`);
        return { ok: true };
      }
      lastError = `${response.status} ${result.error?.message || "request failed"} fbtrace=${result.error?.fbtrace_id || "-"}`;
      if (response.status < 500) break; // Client errors will not succeed on retry.
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.error(`[Meta CAPI] ${input.eventName} ${input.eventId} failed: ${lastError}`);
  return { ok: false, error: lastError };
}
