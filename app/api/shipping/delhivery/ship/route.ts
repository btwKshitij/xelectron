import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { getDelhiveryToken, getDelhiveryTracking, getDelhiveryTrackingUrl } from "@/lib/server/delhivery";
import { buildShipment, parcelSchema, pickupSchema, type DeliveryBooking } from "@/lib/delivery-booking";
import { CourierError, delhiveryPost, manifestedAwb } from "@/lib/server/delhivery-booking";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (typeof body.orderId !== "string" || !["manifest", "pickup", "replace"].includes(body.action)) {
      return NextResponse.json({ success: false, error: "Order ID and delivery action are required." }, { status: 400 });
    }
    getDelhiveryToken();
    const order = await db.order.findUnique({ where: { id: body.orderId }, include: { user: true, items: { include: { product: true } } } });
    if (!order) return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    if (["CANCELLED", "DELIVERED", "SHIPPED"].includes(order.status)) {
      return NextResponse.json({ success: false, error: "This order cannot be booked in its current status." }, { status: 409 });
    }
    const previous = order.deliveryBooking as DeliveryBooking | null;
    const environment = process.env.DELHIVERY_ENVIRONMENT?.toLowerCase() === "staging" ? "staging" : "production";
    if (previous && previous.environment !== environment) throw new Error("This booking belongs to a different Delhivery environment. Restore its original environment.");
    const respond = (data: unknown, message: string) => NextResponse.json({ success: true, data, message });
    const claim = async (booking: DeliveryBooking) => {
      const result = await db.order.updateMany({
        where: { id: order.id, updatedAt: order.updatedAt, deliveryBooking: { equals: previous || Prisma.DbNull } },
        data: { deliveryBooking: booking },
      });
      if (result.count !== 1) throw new Error("The order changed or another delivery request is running. Refresh before continuing.");
    };
    const save = (booking: DeliveryBooking, extra: Record<string, unknown> = {}) => db.order.update({
      where: { id: order.id }, data: { deliveryBooking: booking, ...extra },
      select: { deliveryBooking: true, trackingNumber: true, shippingCarrier: true, trackingUrl: true, status: true, estimatedDelivery: true },
    });
    if (body.action === "manifest" || body.action === "replace") {
      const replacing = body.action === "replace";
      if (replacing) {
        if (!order.trackingNumber || body.previousAwb !== order.trackingNumber) throw new Error("The shipment changed. Refresh the order before creating a replacement.");
        const current = await getDelhiveryTracking(order.trackingNumber);
        if (!current.found || current.status !== "Cancelled") throw new Error("Delhivery must confirm the existing shipment is cancelled before a replacement can be created.");
      }
      if (!replacing && previous?.state === "MANIFESTED") return respond({ deliveryBooking: previous, trackingNumber: order.trackingNumber, shippingCarrier: order.shippingCarrier, trackingUrl: order.trackingUrl, status: order.status }, "Shipment is already registered with Delhivery.");
      if (previous && ["CREATING", "UNKNOWN"].includes(previous.state)) throw new Error("A shipment request is pending confirmation. Check Delhivery One before creating another shipment.");
      const parsed = parcelSchema.safeParse(body.parcel);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      if (!replacing && previous?.history?.length) throw new Error("Use the replacement shipment action to retry this booking.");
      const reference = replacing ? previous?.state === "FAILED" && previous.reference ? previous.reference : `${order.id}-${randomUUID().slice(0, 8)}` : order.id;
      const history = [...(previous?.history || [])];
      if (replacing && !history.some(entry => entry.awb === order.trackingNumber)) history.push({ awb: order.trackingNumber, cancelledAt: new Date().toISOString(), ...(previous?.pickupId ? { pickupId: previous.pickupId } : {}) });
      const payload = buildShipment({ ...order, id: reference, trackingNumber: replacing ? null : order.trackingNumber }, parsed.data);
      const booking: DeliveryBooking = { state: "CREATING", parcel: parsed.data, environment, reference, history };
      if (!replacing && order.trackingNumber) {
        const tracking = await getDelhiveryTracking(order.trackingNumber);
        if (tracking.found) throw new Error("This AWB already has a Delhivery shipment. Schedule its pickup in Delhivery One.");
      }
      await claim(booking);
      try {
        const response = await delhiveryPost("/api/cmu/create.json", payload, true);
        const awb = manifestedAwb(response);
        booking.state = "MANIFESTED";
        booking.awb = awb;
        const saved = await save(booking, { trackingNumber: awb, shippingCarrier: `Delhivery ${parsed.data.shippingMode}`, trackingUrl: getDelhiveryTrackingUrl(awb), estimatedDelivery: null, status: "PROCESSING" });
        return respond(saved, `Shipment ${awb} created in Delhivery. Schedule pickup below.`);
      } catch (error) {
        booking.state = error instanceof CourierError && !error.uncertain ? "FAILED" : "UNKNOWN";
        booking.error = error instanceof Error ? error.message : "Shipment confirmation failed. Check Delhivery One.";
        await save(booking);
        throw error;
      }
    }
    if (previous?.state !== "MANIFESTED" || !previous.awb || order.trackingNumber !== previous.awb) throw new Error("Create the shipment before scheduling pickup.");
    const liveShipment = await getDelhiveryTracking(previous.awb);
    if (!liveShipment.found) throw new Error("Delhivery could not verify this shipment. Check Delhivery One before scheduling pickup.");
    if (liveShipment.status === "Cancelled") throw new Error("This shipment was cancelled in Delhivery. Pickup cannot be scheduled for this AWB.");
    if (previous.pickupState === "SCHEDULED") return respond({ deliveryBooking: previous }, `Pickup ${previous.pickupId} is already scheduled. Manage it in Delhivery One.`);
    if (["REQUESTING", "UNKNOWN"].includes(previous.pickupState || "")) throw new Error("Pickup confirmation is pending. Check Pickup Requests in Delhivery One before making another request.");
    const parsed = pickupSchema.safeParse(body);
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);
    const booking: DeliveryBooking = { ...previous, pickupState: "REQUESTING", pickupDate: parsed.data.pickupDate, pickupTime: parsed.data.pickupTime };
    delete booking.error;
    await claim(booking);
    try {
      const response = await delhiveryPost("/fm/request/new/", {
        pickup_location: booking.parcel.pickupLocation, pickup_date: booking.pickupDate,
        pickup_time: `${booking.pickupTime}:00`, expected_package_count: 1,
      });
      if (response.error || response.success === false) throw new CourierError(String(response.error || response.message || "Pickup request rejected."));
      if (!response.pickup_id) throw new CourierError("Pickup ID was not returned. Check Pickup Requests in Delhivery One.", true);
      booking.pickupState = "SCHEDULED";
      booking.pickupId = String(response.pickup_id);
      return respond(await save(booking), `Pickup ${booking.pickupId} scheduled. Check Delhivery One → Pickup Requests.`);
    } catch (error) {
      booking.pickupState = error instanceof CourierError && !error.uncertain ? "FAILED" : "UNKNOWN";
      booking.error = error instanceof Error ? error.message : "Pickup confirmation failed.";
      await save(booking);
      throw error;
    }
  } catch (error) {
    const status = error instanceof AuthError ? error.status : error instanceof CourierError ? 502 : 400;
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to book delivery." }, { status });
  }
}
