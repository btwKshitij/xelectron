import "server-only";

type DelhiveryScan = {
  status: string;
  location: string | null;
  occurredAt: string | null;
  instructions: string | null;
};

export type DelhiveryTrackingResult = {
  found: boolean;
  trackingNumber: string;
  status: string | null;
  statusType: string | null;
  location: string | null;
  updatedAt: string | null;
  scans: DelhiveryScan[];
};

function getDelhiveryToken() {
  const token = process.env.DELHIVERY_API_TOKEN?.trim();
  if (!token) {
    throw new Error("Delhivery is not configured. Add DELHIVERY_API_TOKEN to enable AWB generation.");
  }
  return token;
}

function getTrackingApiOrigin() {
  return process.env.DELHIVERY_ENVIRONMENT?.toLowerCase() === "staging"
    ? "https://staging-express.delhivery.com"
    : "https://track.delhivery.com";
}

function cleanTrackingNumber(waybill: string) {
  return (waybill || "").replace(/[^0-9A-Za-z-]/g, "").trim();
}

function valueAt(source: unknown, key: string): string | null {
  if (!source || typeof source !== "object") return null;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Reserves one authentic AWB from Delhivery. Reserving an AWB is not shipment
 * manifestation: the first courier scan is what makes external tracking live.
 */
export async function fetchDelhiveryWaybill(): Promise<string> {
  const token = getDelhiveryToken();
  const res = await fetch(
    `https://track.delhivery.com/waybill/api/fetch/json/?token=${encodeURIComponent(token)}&count=1`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Delhivery could not reserve an AWB (HTTP ${res.status}).`);
  }

  const body = await res.text();
  const awb = body.match(/\b[0-9]{8,}\b/)?.[0];
  if (!awb) {
    throw new Error("Delhivery returned an invalid AWB. No tracking number was created.");
  }

  return awb;
}

/** The public Delhivery page accepts an AWB pasted by the customer. */
export function getDelhiveryTrackingUrl(waybill?: string): string {
  const trackingNumber = cleanTrackingNumber(waybill || "");
  return trackingNumber
    ? `https://www.delhivery.com/tracking?uniqueIdentifier=${encodeURIComponent(trackingNumber)}`
    : "https://www.delhivery.com/tracking";
}

/**
 * Retrieves the courier status server-side so the API token and carrier
 * response stay private. A reserved but unmanifested AWB returns found=false.
 */
export async function getDelhiveryTracking(waybill: string): Promise<DelhiveryTrackingResult> {
  const trackingNumber = cleanTrackingNumber(waybill);
  if (!trackingNumber) {
    throw new Error("A valid tracking number is required.");
  }

  const token = getDelhiveryToken();
  const res = await fetch(
    `${getTrackingApiOrigin()}/api/v1/packages/json/?waybill=${encodeURIComponent(trackingNumber)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Delhivery tracking is temporarily unavailable (HTTP ${res.status}).`);
  }

  const payload = (await res.json()) as Record<string, unknown>;
  const shipmentData = Array.isArray(payload.ShipmentData) ? payload.ShipmentData[0] : null;
  const shipment = shipmentData && typeof shipmentData === "object"
    ? (shipmentData as Record<string, unknown>).Shipment
    : null;

  if (!shipment || typeof shipment !== "object") {
    return {
      found: false,
      trackingNumber,
      status: null,
      statusType: null,
      location: null,
      updatedAt: null,
      scans: [],
    };
  }

  const shipmentRecord = shipment as Record<string, unknown>;
  const statusRecord = shipmentRecord.Status && typeof shipmentRecord.Status === "object"
    ? shipmentRecord.Status as Record<string, unknown>
    : {};
  const scans = Array.isArray(shipmentRecord.Scans)
    ? shipmentRecord.Scans.slice(0, 8).flatMap((scan) => {
        if (!scan || typeof scan !== "object") return [];
        const scanRecord = scan as Record<string, unknown>;
        const scanStatus = scanRecord.ScanDetail && typeof scanRecord.ScanDetail === "object"
          ? scanRecord.ScanDetail as Record<string, unknown>
          : scanRecord;
        const status = valueAt(scanStatus, "Scan") || valueAt(scanStatus, "Status");
        if (!status) return [];
        return [{
          status,
          location: valueAt(scanStatus, "ScannedLocation") || valueAt(scanStatus, "Location"),
          occurredAt: valueAt(scanStatus, "ScanDateTime") || valueAt(scanStatus, "StatusDateTime"),
          instructions: valueAt(scanStatus, "Instructions"),
        }];
      })
    : [];

  return {
    found: true,
    trackingNumber,
    status: valueAt(statusRecord, "Status"),
    statusType: valueAt(statusRecord, "StatusType"),
    location: valueAt(statusRecord, "StatusLocation"),
    updatedAt: valueAt(statusRecord, "StatusDateTime"),
    scans,
  };
}
