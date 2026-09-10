import { z } from "zod";

export const parcelSchema = z.object({
  pickupLocation: z.string().trim().min(1, "Enter the exact registered Delhivery pickup location name.").max(150),
  weight: z.coerce.number().positive("Enter packed weight in grams.").max(50000),
  length: z.coerce.number().positive().max(300),
  width: z.coerce.number().positive().max(300),
  height: z.coerce.number().positive().max(300),
  shippingMode: z.enum(["Express", "Surface"]),
  sellerGst: z.string().trim().max(15).default(""),
  hsnCode: z.string().trim().max(100).default(""),
  ewaybill: z.string().trim().max(30).default(""),
});
export type Parcel = z.infer<typeof parcelSchema>;
export type DeliveryBooking = {
  state: "CREATING" | "FAILED" | "UNKNOWN" | "MANIFESTED";
  parcel: Parcel;
  environment: string;
  awb?: string;
  error?: string;
  pickupState?: "REQUESTING" | "FAILED" | "UNKNOWN" | "SCHEDULED";
  pickupId?: string;
  pickupDate?: string;
  pickupTime?: string;
  reference?: string;
  history?: Array<{ awb: string; cancelledAt: string; pickupId?: string }>;
};

export const pickupSchema = z.object({
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).superRefine((value, ctx) => {
  const date = new Date(`${value.pickupDate}T${value.pickupTime}:00+05:30`);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
    ctx.addIssue({ code: "custom", message: "Choose a future pickup date and time (India time)." });
  }
});

type ShippingOrder = {
  id: string; total: number; paymentVerified: boolean;
  shippingAddress: string | null; customerName: string | null;
  customerPhone: string | null; city: string | null; state: string | null;
  pincode: string | null; country: string | null; internalNotes: string | null;
  trackingNumber: string | null;
  user?: { name: string; phone: string | null } | null;
  items: { quantity: number; product: { name: string } }[];
};

export function shipmentPayment(order: { total: number; paymentVerified?: boolean; shippingAddress?: string | null; internalNotes?: string | null }) {
  const cod = !order.paymentVerified && (/\[Payment:\s*COD/i.test(order.shippingAddress || "") || /\bCOD\b/i.test(order.internalNotes || ""));
  return { cod, eligible: Boolean(order.paymentVerified || cod), amount: cod ? order.total : 0 };
}

export function buildShipment(order: ShippingOrder, parcel: Parcel) {
  const { cod } = shipmentPayment(order);
  if (!order.paymentVerified && !cod) throw new Error("Verify payment or convert the order to COD before shipping.");
  const address = (order.shippingAddress || "").replace(/\[Payment:[^\]]*\]/gi, "").trim();
  const phone = (order.customerPhone || order.user?.phone || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  const name = (order.customerName || order.user?.name || "").trim();
  if (!name || !address || !order.city || !order.state || !/^[1-9]\d{5}$/.test(order.pincode || "") || !/^\d{10}$/.test(phone)) {
    throw new Error("Complete the customer's name, 10-digit phone, address, city, state and 6-digit pincode before shipping.");
  }
  if (order.country && !["india", "in"].includes(order.country.toLowerCase())) throw new Error("This delivery flow supports Indian addresses only.");
  if (!Number.isFinite(order.total) || order.total <= 0 || !order.items.length) throw new Error("The order must have items and a positive total.");
  if (order.total > 50000 && !parcel.ewaybill) throw new Error("Enter the e-waybill number for this shipment value.");
  return {
    shipments: [{
      name, add: address, pin: order.pincode, city: order.city, state: order.state, country: "India", phone,
      order: order.id, payment_mode: cod ? "COD" : "Prepaid", cod_amount: cod ? order.total : 0,
      total_amount: order.total, products_desc: order.items.map(item => item.product.name).join(", ").slice(0, 500),
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      weight: parcel.weight, shipment_length: parcel.length, shipment_width: parcel.width, shipment_height: parcel.height,
      shipping_mode: parcel.shippingMode,
      ...(order.trackingNumber ? { waybill: order.trackingNumber } : {}),
      ...(parcel.sellerGst ? { seller_gst_tin: parcel.sellerGst } : {}),
      ...(parcel.hsnCode ? { hsn_code: parcel.hsnCode } : {}),
      ...(parcel.ewaybill ? { ewbn: parcel.ewaybill } : {}),
    }],
    pickup_location: { name: parcel.pickupLocation },
  };
}
