import "server-only";
import { getDelhiveryToken, getTrackingApiOrigin } from "./delhivery";

export class CourierError extends Error {
  constructor(message: string, public uncertain = false) { super(message); }
}

export async function delhiveryPost(path: string, data: unknown, form = false): Promise<Record<string, unknown>> {
  const token = getDelhiveryToken();
  let response: Response;
  try {
    response = await fetch(`${getTrackingApiOrigin()}${path}`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(25000),
      headers: { Authorization: `Token ${token}`, Accept: "application/json", "Content-Type": form ? "application/x-www-form-urlencoded" : "application/json" },
      body: form ? new URLSearchParams({ format: "json", data: JSON.stringify(data) }).toString() : JSON.stringify(data),
    });
  } catch {
    throw new CourierError("Delhivery did not confirm the request. Check Delhivery One before trying again to avoid a duplicate booking.", true);
  }
  let body: Record<string, unknown>;
  try { body = await response.json(); } catch {
    throw new CourierError(`Delhivery returned an unreadable response (HTTP ${response.status}). Check Delhivery One.`, true);
  }
  if (!response.ok) {
    const detail = typeof body.error === "string" ? body.error : typeof body.message === "string" ? body.message : "Check your API account and pickup location.";
    throw new CourierError(`Delhivery rejected the request (HTTP ${response.status}): ${detail}`, response.status >= 500);
  }
  return body;
}

export function manifestedAwb(body: Record<string, unknown>) {
  const item = Array.isArray(body.packages) ? body.packages[0] : null;
  if (body.success === true && item?.status === "Success" && /^\d{8,}$/.test(String(item.waybill || ""))) return String(item.waybill);
  const remarks = item?.remarks || body.rmk || body.error || "Shipment acceptance could not be confirmed.";
  throw new CourierError(`Delhivery: ${Array.isArray(remarks) ? remarks.join("; ") : String(remarks)}`, body.success !== false && item?.status !== "Fail");
}
