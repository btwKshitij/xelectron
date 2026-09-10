"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  Save,
  FileText,
  Zap,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatINR } from "@/lib/format-price";
import { CourierStatus } from "@/components/admin/courier-status";
import { DeliveryBookingForm } from "@/components/admin/delivery-booking-form";
import type { DeliveryBooking } from "@/lib/delivery-booking";

type OrderDetailItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    price: number | string;
    mainImage?: string | null;
    slug?: string | null;
  };
};

export type OrderDetailData = {
  id: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  tax?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  deliveryBooking?: DeliveryBooking | null;
  trackingUrl?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
  paymentMethod?: string;
  paymentVerified?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: OrderDetailItem[];
};

type DeliveryTrackingDetails = {
  instructions?: string | null;
  found: boolean;
  trackingNumber: string;
  status: string | null;
  statusType: string | null;
  location: string | null;
  updatedAt: string | null;
  estimatedDelivery: string | null;
  scans: Array<{
    status: string;
    location: string | null;
    occurredAt: string | null;
    instructions: string | null;
  }>;
};



function getPublicDelhiveryTrackingUrl(trackingNumber: string) {
  const awb = trackingNumber.replace(/[^0-9A-Za-z-]/g, "").trim();
  return awb
    ? `https://www.delhivery.com/tracking?uniqueIdentifier=${encodeURIComponent(awb)}`
    : "";
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Shipping details state
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [replacingDelivery, setReplacingDelivery] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryTrackingDetails | null>(null);
  const [deliveryError, setDeliveryError] = useState("");
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  // Internal team notes state
  const [internalNotes, setInternalNotes] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Notification toggle
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();

        if (isMounted) {
          if (res.ok && json.success && json.data) {
            const ord = json.data;
            setOrder(ord);
            setCarrier(ord.shippingCarrier || "");
            const orderAwb = ord.trackingNumber || "";
            setTrackingNumber(orderAwb);
            setTrackingUrl(getPublicDelhiveryTrackingUrl(orderAwb) || ord.trackingUrl || "");
            setEstimatedDelivery(ord.estimatedDelivery || "");
            setInternalNotes(ord.internalNotes || "");
          } else {
            setError(json.error || "Order not found");
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load order details");
          setLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!deliveryOpen || !order?.trackingNumber) return;
    let active = true;
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/orders/${orderId}/tracking`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Unable to refresh courier status.");
        if (active) { setDeliveryDetails(result.data); setDeliveryError(""); }
      } catch (error) {
        if (active) setDeliveryError(error instanceof Error ? error.message : "Unable to refresh courier status.");
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [deliveryOpen, order?.trackingNumber, orderId]);

  const loadDeliveryDetails = async () => {
    if (!order?.trackingNumber) {
      setDeliveryDetails(null);
      setDeliveryError("");
      return;
    }

    setIsLoadingDelivery(true);
    setDeliveryError("");
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to retrieve the courier status.");
      setDeliveryDetails(result.data as DeliveryTrackingDetails);
    } catch (trackingError) {
      setDeliveryDetails(null);
      setDeliveryError(trackingError instanceof Error ? trackingError.message : "Unable to retrieve the courier status.");
    } finally {
      setIsLoadingDelivery(false);
    }
  };

  const toggleDeliveryDetails = () => {
    const nextOpen = !deliveryOpen;
    setDeliveryOpen(nextOpen);
    if (nextOpen) void loadDeliveryDetails();
  };

  const removeInvalidTracking = async () => {
    if (!window.confirm("Remove this unverified tracking number from the order?")) return;
    setIsUpdating(true);
    setStatusMessage("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingCarrier: "",
          trackingNumber: "",
          trackingUrl: "",
          estimatedDelivery: "",
          notifyCustomer: false,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to remove the tracking number.");
      setOrder((current) => current ? { ...current, ...result.data } : current);
      setCarrier("");
      setTrackingNumber("");
      setTrackingUrl("");
      setEstimatedDelivery("");
      setDeliveryDetails(null);
      setDeliveryError("");
      setStatusMessage("The unverified tracking number was removed. Create a delivery or add a verified AWB.");
    } catch (removeError) {
      setStatusMessage(removeError instanceof Error ? removeError.message : "Unable to remove the tracking number.");
    } finally {
      setIsUpdating(false);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    setNoteMessage("");
    const submittedNotes = internalNotes.trim();
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: submittedNotes, notifyCustomer: false }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to save the note.");
      setOrder((current) => current ? { ...current, internalNotes: submittedNotes } : current);
      setNoteMessage("Note saved.");
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "Unable to save the note.");
    } finally { setSavingNote(false); }
  };

  const saveOrderUpdates = async (overrideData?: Partial<OrderDetailData>) => {
    setIsUpdating(true);
    setStatusMessage("");
    try {
      const cleanTrackingNumber = trackingNumber.trim();
      const savedTrackingNumber = order?.trackingNumber?.trim() || "";
      let resolvedCarrier = carrier;

      if (!overrideData?.status && cleanTrackingNumber && cleanTrackingNumber !== savedTrackingNumber) {
        setStatusMessage("Verifying the Delhivery tracking number…");
        const verificationResponse = await fetch("/api/shipping/delhivery/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber: cleanTrackingNumber }),
        });
        const verification = await verificationResponse.json();
        if (!verificationResponse.ok || !verification.success) throw new Error(verification.error || "Unable to verify the tracking number.");
        if (!verification.data?.found) {
          throw new Error("Delhivery could not find an active shipment for this AWB. It was not saved.");
        }
        setDeliveryDetails(verification.data as DeliveryTrackingDetails);
        resolvedCarrier = carrier || "Delhivery Express";
        setCarrier(resolvedCarrier);
      }

      const normalizedTrackingUrl =
        getPublicDelhiveryTrackingUrl(cleanTrackingNumber) || trackingUrl.trim();
      const payload = {
        shippingCarrier: resolvedCarrier,
        trackingNumber: cleanTrackingNumber,
        trackingUrl: normalizedTrackingUrl,
        estimatedDelivery: estimatedDelivery.trim(),
        internalNotes: internalNotes.trim(),
        notifyCustomer,
        ...overrideData,
      };

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        setTrackingUrl(normalizedTrackingUrl);
        setStatusMessage(
          overrideData?.status
            ? `Order status changed to ${overrideData.status}.`
            : "Shipping details and notes updated. The customer can see saved tracking details in My Orders."
        );
        setTimeout(() => setStatusMessage(""), 5000);
      } else {
        alert(json.error || "Failed to update order");
      }
    } catch (saveError) {
      setStatusMessage(saveError instanceof Error ? saveError.message : "Network error while updating order.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm("Verify and mark this order as PAID? It will be confirmed and included in the active Orders section.")) return;
    await saveOrderUpdates({ paymentVerified: true, status: "CONFIRMED" });
  };

  const handleConvertToCod = async () => {
    if (!window.confirm("Convert this order to Cash on Delivery (COD)? It will be marked as COD and included in the active Orders section.")) return;
    const currentAddress = (order?.shippingAddress || "").replace(/\[Payment:\s*[A-Z_]+\]/gi, "").trim();
    const updatedAddress = `${currentAddress} [Payment: COD Verified]`;
    const updatedNotes = order?.internalNotes
      ? `${order.internalNotes}\nPayment method: COD (Converted by Admin)`
      : "Payment method: COD (Converted by Admin)";
    await saveOrderUpdates({
      shippingAddress: updatedAddress,
      internalNotes: updatedNotes,
    });
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Permanently delete this unconfirmed checkout attempt? This cannot be undone.")) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        router.push("/dashboard/orders");
      } else {
        alert(json.error || "Failed to delete order");
        setIsUpdating(false);
      }
    } catch {
      alert("Network error while deleting order");
      setIsUpdating(false);
    }
  };

  const getFulfillmentBadge = (status: string) => {
    if (status === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-3.5" /> FULFILLED
        </span>
      );
    }
    if (status === "SHIPPED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-[#0a7ae6]">
          <Truck className="size-3.5" /> IN TRANSIT
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
          <AlertCircle className="size-3.5" /> CANCELLED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
        <Clock className="size-3.5" /> UNFULFILLED
      </span>
    );
  };

  if (loading) {
    return (
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f5f5]">
            <div className="size-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !order) {
    return (
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center">
            <Package className="mb-3 size-12 text-black/30" />
            <h2 className="text-xl font-bold text-black">Order Not Found</h2>
            <p className="mt-1 text-sm text-black/60">{error || "The requested order could not be located."}</p>
            <Link prefetch={false}
              href="/dashboard/orders"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/80"
            >
              <ArrowLeft className="size-4" /> Back to Orders
            </Link>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const orderRef = `#XE-${order.id.slice(-8).toUpperCase()}`;
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isFulfilled = order.status === "DELIVERED" || order.status === "SHIPPED";
  const hasLiveDelivery = deliveryDetails?.found === true;

  const customerName = order.customerName || order.user?.name || "Guest Customer";
  const customerEmail = order.customerEmail || order.user?.email || "N/A";
  const customerPhone = order.customerPhone || order.user?.phone || "";

  const rawAddress = order.shippingAddress || "";
  const paymentMatch = rawAddress.match(/\[Payment:\s*([A-Z_]+)\]/i);
  const displayPaymentMethod = order.paymentMethod || (paymentMatch ? paymentMatch[1].toUpperCase() : "CARD");
  const cleanAddress = rawAddress.replace(/\[Payment:\s*[A-Z_]+\]/gi, "").trim();

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "UPI":
        return "UPI Instant Payment";
      case "COD":
        return "Cash on Delivery (COD)";
      case "VELOCITY_BNPL":
      case "VELOCITY":
      case "EMI":
        return "Velocity No-Cost EMI / BNPL";
      case "ONLINE_RAZORPAY":
      case "RAZORPAY":
        return "Razorpay Online (UPI / Cards)";
      case "NETBANKING":
        return "Net Banking";
      default:
        return "Online Payment (Cards / UPI)";
    }
  };

  const isPaidOrCod =
    order.paymentVerified === true ||
    /\[Payment:\s*COD/i.test(order.shippingAddress || "") ||
    /Payment method:\s*COD/i.test(order.internalNotes || "") ||
    /\bCOD\b/i.test(order.internalNotes || "");

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-6 lg:p-8">
            {/* Top Navigation & Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <Link prefetch={false}
                  href="/dashboard/orders"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/15 bg-white text-black/70 hover:bg-black/5 hover:text-black"
                >
                  <ArrowLeft className="size-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-bold text-black sm:text-2xl">{orderRef}</h1>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${order.paymentVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {order.paymentVerified === true ? <><Check className="size-3" /> PAID</> : "PAYMENT NOT VERIFIED"}
                    </span>
                    {getFulfillmentBadge(order.status)}
                  </div>
                  <p className="mt-1 text-xs text-black/55">{formattedDate} from Online Store</p>
                </div>
              </div>

              {/* Status Selector & Notification Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-black/15 px-3 py-1.5 rounded-lg">
                  <input
                    type="checkbox"
                    id="notifyToggle"
                    checked={notifyCustomer}
                    onChange={(e) => setNotifyCustomer(e.target.checked)}
                    className="size-3.5 rounded border-black/30 text-black focus:ring-black"
                  />
                  <label htmlFor="notifyToggle" className="text-xs font-medium text-black/70 cursor-pointer select-none">
                    Email & SMS customer
                  </label>
                </div>

                <div className="relative inline-block">
                  <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => saveOrderUpdates({ status: e.target.value as OrderDetailData["status"] })}
                    className="h-9 rounded-lg border border-black/15 bg-white px-3 pr-8 text-xs font-semibold text-black/80 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                  >
                    <option value="PENDING">Status: Pending</option>
                    <option value="CONFIRMED">Status: Confirmed</option>
                    <option value="PROCESSING">Status: Processing</option>
                    <option value="SHIPPED">Status: Shipped</option>
                    <option value="DELIVERED">Status: Delivered</option>
                    <option value="CANCELLED">Status: Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {statusMessage ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span>{statusMessage}</span>
                <button onClick={() => setStatusMessage("")} className="text-emerald-700 hover:text-emerald-900">✕</button>
              </div>
            ) : null}

            {!isPaidOrCod ? (
              <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <h2 className="text-sm font-bold text-amber-900">Unconfirmed Checkout Attempt (Excluded from Orders List)</h2>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      This checkout attempt was started using <strong>{getPaymentLabel(displayPaymentMethod)}</strong>, but payment was never completed or verified, and it is not Cash on Delivery.
                      It is <strong>hidden from the main Orders section</strong> and store analytics so your revenue and order counts remain accurate.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={handleMarkAsPaid}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Check className="size-3.5" /> Verify &amp; Mark as Paid
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={handleConvertToCod}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 font-semibold text-white hover:bg-black/80 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        Convert to Cash on Delivery (COD)
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={handleDeleteOrder}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="size-3.5" /> Delete Attempt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 2-Column Shopify Style Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* LEFT COLUMN: Items & Shipping Management (70%) */}
              <div className="space-y-6 lg:col-span-8">
                {/* Items Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.02] px-5 py-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/75">
                      <Package className="size-4 text-black/60" />
                      <span>
                        {isFulfilled ? "Fulfilled Items" : "Unfulfilled Items"} ({totalItemsCount})
                      </span>
                    </div>
                    {getFulfillmentBadge(order.status)}
                  </div>

                  <div className="divide-y divide-black/10">
                    {order.items.map((item) => {
                      const image = item.product?.mainImage || "/category-smartphone.png";
                      const name = item.product?.name || "XElectron Product";
                      const slug = item.product?.slug || item.product?.id;

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white p-1">
                              <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-contain p-1"
                                sizes="64px"
                              />
                            </div>
                            <div>
                              {slug ? (
                                <Link prefetch={false}
                                  href={`/product/${slug}`}
                                  target="_blank"
                                  className="group inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#0a7ae6]"
                                >
                                  <span>{name}</span>
                                  <ExternalLink className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                              ) : (
                                <p className="text-sm font-semibold text-black">{name}</p>
                              )}
                              <p className="mt-1 text-xs text-black/55">
                                {formatINR(item.unitPrice)} × {item.quantity}
                              </p>
                            </div>
                          </div>

                          <div className="text-right font-semibold text-black text-sm">
                            {formatINR(item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery details load only when this panel is opened. */}
                <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <button type="button" onClick={toggleDeliveryDetails} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Truck className="size-5" /></span>
                      <span className="min-w-0"><span className="flex items-center gap-2 text-sm font-semibold text-slate-900">Delivery & fulfillment <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">DELHIVERY</span></span><span className="mt-1 block truncate text-xs text-slate-500">{replacingDelivery ? "Preparing replacement shipment" : order.trackingNumber ? (hasLiveDelivery ? `AWB ${order.trackingNumber} — live courier updates available` : "Saved AWB needs verification — click to view delivery details") : "No shipment created yet — click to set up delivery"}</span></span>
                    </button>
                    <div className="flex items-center gap-2">
                      {!order.trackingNumber ? <button type="button" onClick={() => setDeliveryOpen(true)} disabled={isUpdating} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-3 text-xs font-bold text-white hover:bg-[#086ac9] disabled:opacity-50"><Zap className="size-3.5 fill-current" />{isUpdating ? "Creating…" : "Create delivery"}</button> : null}
                      <button type="button" onClick={toggleDeliveryDetails} className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 text-slate-500 hover:bg-slate-50" aria-label={deliveryOpen ? "Hide delivery details" : "Show delivery details"}>{deliveryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
                    </div>
                  </div>

                  {deliveryOpen ? <div className="border-t border-black/[0.08] px-5 pb-5 pt-4">
                    <DeliveryBookingForm paymentOrder={order} onReplacementChange={setReplacingDelivery} courierStatus={deliveryDetails?.status} courierVerified={Boolean(deliveryDetails?.found) && !isLoadingDelivery && !deliveryError} onBusyChange={setIsUpdating} orderId={orderId} booking={order.deliveryBooking} disabled={isUpdating || ["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)} onUpdated={(data) => { if (typeof data.trackingNumber === "string" && data.trackingNumber !== order.trackingNumber) { setDeliveryDetails(null); setDeliveryError(""); } setOrder((current) => current ? { ...current, ...data } as OrderDetailData : current); if (typeof data.trackingNumber === "string") setTrackingNumber(data.trackingNumber); if (typeof data.shippingCarrier === "string") setCarrier(data.shippingCarrier); if (typeof data.trackingUrl === "string") setTrackingUrl(data.trackingUrl); if ("estimatedDelivery" in data) setEstimatedDelivery(typeof data.estimatedDelivery === "string" ? data.estimatedDelivery : ""); }} />
                    {replacingDelivery ? <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
                      <p className="text-sm font-semibold text-slate-900">New tracking details pending</p>
                      <p className="mt-1 text-xs text-slate-500">The new AWB, tracking link and courier updates will appear after you create the replacement shipment.</p>
                      <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer">Previous cancelled shipment</summary><p className="mt-2 font-mono">{order.trackingNumber}</p></details>
                    </div> : <>
                    {order.trackingNumber && <CourierStatus trackingNumber={order.trackingNumber} trackingUrl={getPublicDelhiveryTrackingUrl(order.trackingNumber)} details={deliveryDetails} loading={isLoadingDelivery} error={deliveryError} onRefresh={() => void loadDeliveryDetails()} onRemove={!order.deliveryBooking ? () => void removeInvalidTracking() : undefined} removing={isUpdating} />}

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {([
                        ["Shipping courier", carrier],
                        ["Tracking / AWB number", trackingNumber],
                        ["Tracking link", trackingUrl],
                        ["Estimated delivery", estimatedDelivery],
                      ] as const).map(([label, value]) => <label key={label} className="grid gap-1 text-xs font-semibold text-black/70">{label}<input type="text" readOnly value={deliveryDetails?.status === "Cancelled" || order.status === "CANCELLED" ? "" : value || ""} placeholder="" className="h-9 rounded-lg border border-black/15 bg-slate-50 px-3 text-xs font-normal text-slate-600 outline-none" /></label>)}
                    </div>
                    <p className="mt-4 border-t border-black/[0.06] pt-4 text-[11px] text-slate-500">Delivery details are filled automatically when a shipment is created. Cancelled shipments leave these fields empty.</p>
                    </>}
                  </div> : null}
                </section>

                {/* Internal Team Notes Card */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><FileText className="size-4" /></span>
                      <div><h2 className="text-sm font-semibold text-slate-900">Team notes</h2><p className="mt-0.5 text-xs text-slate-500">Payment references and instructions for your team.</p></div>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">Staff use</span>
                  </div>
                  <div className="p-5">
                    <label htmlFor="order-team-notes" className="sr-only">Order notes</label>
                    <textarea id="order-team-notes" rows={4} spellCheck={false} disabled={savingNote} value={internalNotes ?? ""} onChange={(event) => { setInternalNotes(event.target.value); setNoteMessage(""); }} placeholder="Add packing instructions, customer requests or a follow-up for your team..." className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60" />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p role="status" className="text-xs text-slate-500">{noteMessage || (internalNotes.trim() !== (order.internalNotes || "").trim() ? "Unsaved changes" : "No unsaved changes")}</p>
                      <button type="button" onClick={() => void saveNote()} disabled={savingNote || isUpdating || internalNotes.trim() === (order.internalNotes || "").trim()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-3.5" />{savingNote ? "Saving..." : "Save note"}</button>
                    </div>
                  </div>
                </section>

                {/* Payment Breakdown Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/75">
                      <CreditCard className="size-4 text-black/60" />
                      <span>Payment Details</span>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${order.paymentVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {order.paymentVerified === true ? "Paid" : "Payment not verified"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-black/75">
                    <div className="flex justify-between py-0.5">
                      <span className="text-black/60">Payment Method:</span>
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="size-3.5 text-[#0a7ae6]" />
                        {getPaymentLabel(displayPaymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-black/60">Subtotal ({totalItemsCount} items)</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-black/60">Shipping (Standard Free Delivery)</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between pt-2.5 border-t border-black/10 text-sm font-bold text-black">
                      <span>{order.paymentVerified === true ? "Total Paid" : "Order Total"}</span>
                      <span className="text-[#0a7ae6] text-base">{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Customer & Shipping (30%) */}
              <div className="space-y-6 lg:col-span-4">
                {/* Customer Details Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/75 flex items-center gap-2">
                    <User className="size-4 text-black/60" />
                    <span>Customer Details</span>
                  </h3>
                  <div>
                    <p className="text-sm font-semibold text-black">{customerName}</p>
                  </div>
                  <div className="border-t border-black/10 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-black/75">Contact Information</p>
                    <a
                      href={`mailto:${customerEmail}`}
                      className="flex items-center gap-1.5 text-xs text-[#0a7ae6] hover:underline"
                    >
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{customerEmail}</span>
                    </a>
                    {customerPhone ? (
                      <a
                        href={`tel:${customerPhone}`}
                        className="flex items-center gap-1.5 text-xs text-black/80 hover:text-[#0a7ae6]"
                      >
                        <Phone className="size-3.5 shrink-0 text-black/60" />
                        <span>{customerPhone}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-black/45">
                        <Phone className="size-3.5 shrink-0" />
                        <span>No phone number provided</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/75 flex items-center gap-2">
                    <MapPin className="size-4 text-black/60" />
                    <span>Shipping Address</span>
                  </h3>
                  <div className="text-xs leading-relaxed text-black/80 font-normal bg-black/[0.02] p-3.5 rounded-xl border border-black/10 space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{customerName}</p>
                    <p className="text-slate-700 font-medium leading-normal">{cleanAddress || "No address provided"}</p>
                    {order.city && (
                      <p className="text-slate-600 text-xs">
                        {[order.city, order.state, order.pincode, order.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Billing Address Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/75">Billing Address</h3>
                  <p className="text-xs text-black/60">Same as shipping address</p>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
