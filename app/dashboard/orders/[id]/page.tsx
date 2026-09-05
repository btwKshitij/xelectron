"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
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
  RefreshCw,
  Zap,
} from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatINR } from "@/lib/format-price";

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
  trackingUrl?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
  paymentMethod?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: OrderDetailItem[];
};

type DeliveryTrackingDetails = {
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

const CARRIERS = [
  "Delhivery Express",
  "Delhivery Surface",
];

function getPublicDelhiveryTrackingUrl(trackingNumber: string) {
  const awb = trackingNumber.replace(/[^0-9A-Za-z-]/g, "").trim();
  return awb
    ? `https://www.delhivery.com/tracking?uniqueIdentifier=${encodeURIComponent(awb)}`
    : "";
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryTrackingDetails | null>(null);
  const [deliveryError, setDeliveryError] = useState("");
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  // Internal team notes state
  const [internalNotes, setInternalNotes] = useState("");

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

  const handleGenerateAndPublishAwb = async () => {
    setIsUpdating(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/shipping/delhivery/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCarrier(json.data.shippingCarrier);
        setTrackingNumber(json.data.trackingNumber);
        setTrackingUrl(json.data.trackingUrl);
        setEstimatedDelivery(json.data.estimatedDelivery);
        setOrder((prev) => (prev ? { ...prev, ...json.data } : null));
        setDeliveryOpen(true);
        setDeliveryDetails(null);
        setDeliveryError("");
        setStatusMessage(`AWB ${json.data.trackingNumber} generated and published to the customer. Courier updates start after the first scan.`);
        setTimeout(() => setStatusMessage(""), 6000);
      } else {
        setStatusMessage(json.error || "Failed to generate a Delhivery AWB");
      }
    } catch {
      setStatusMessage("Network error while communicating with Delhivery API");
    } finally {
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
            <Link
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

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-6 lg:p-8">
            {/* Top Navigation & Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/orders"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/15 bg-white text-black/70 hover:bg-black/5 hover:text-black"
                >
                  <ArrowLeft className="size-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-bold text-black sm:text-2xl">{orderRef}</h1>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      <Check className="size-3" /> PAID
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
                                <Link
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
                      <span className="min-w-0"><span className="flex items-center gap-2 text-sm font-semibold text-slate-900">Delivery & fulfillment <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">DELHIVERY</span></span><span className="mt-1 block truncate text-xs text-slate-500">{order.trackingNumber ? (hasLiveDelivery ? `AWB ${order.trackingNumber} — live courier updates available` : "Saved AWB needs verification — click to view delivery details") : "No shipment created yet — click to set up delivery"}</span></span>
                    </button>
                    <div className="flex items-center gap-2">
                      {!order.trackingNumber ? <button type="button" onClick={handleGenerateAndPublishAwb} disabled={isUpdating} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-3 text-xs font-bold text-white hover:bg-[#086ac9] disabled:opacity-50"><Zap className="size-3.5 fill-current" />{isUpdating ? "Creating…" : "Create delivery"}</button> : null}
                      <button type="button" onClick={toggleDeliveryDetails} className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 text-slate-500 hover:bg-slate-50" aria-label={deliveryOpen ? "Hide delivery details" : "Show delivery details"}>{deliveryOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
                    </div>
                  </div>

                  {deliveryOpen ? <div className="border-t border-black/[0.08] px-5 pb-5 pt-4">
                    {order.trackingNumber ? <div className="mb-4 rounded-xl border border-[#0a7ae6]/15 bg-[#f7fbff] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#075faf]">Live courier status</p><p className="mt-1 text-sm font-semibold text-slate-900">{isLoadingDelivery ? "Checking Delhivery…" : hasLiveDelivery ? (deliveryDetails?.status || "Shipment update received") : deliveryDetails ? "Delhivery could not verify this AWB" : "Waiting for the first Delhivery scan"}</p><p className="mt-1 text-xs text-slate-500">{deliveryDetails?.location || deliveryError || (deliveryDetails ? "This number is not linked to an active Delhivery shipment. Remove it and add a verified AWB." : "A reserved AWB becomes trackable after the parcel is handed to Delhivery.")}</p></div><div className="flex gap-2"><button type="button" onClick={() => void loadDeliveryDetails()} disabled={isLoadingDelivery} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#0a7ae6]/20 bg-white px-2.5 text-xs font-semibold text-[#075faf] hover:bg-[#0a7ae6]/5 disabled:opacity-50"><RefreshCw className={`size-3.5 ${isLoadingDelivery ? "animate-spin" : ""}`} />Refresh</button>{hasLiveDelivery ? <a href={getPublicDelhiveryTrackingUrl(order.trackingNumber)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-semibold text-[#075faf] ring-1 ring-[#0a7ae6]/20 hover:bg-[#0a7ae6]/5"><ExternalLink className="size-3.5" />Open Delhivery</a> : null}{deliveryDetails && !deliveryDetails.found && !isLoadingDelivery ? <button type="button" onClick={() => void removeInvalidTracking()} disabled={isUpdating} className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Remove invalid AWB</button> : null}</div></div>
                      {deliveryDetails?.scans?.length ? <ol className="mt-4 space-y-2 border-l border-[#0a7ae6]/20 pl-4">{deliveryDetails.scans.map((scan, index) => <li key={`${scan.status}-${index}`} className="text-xs text-slate-600"><span className="font-semibold text-slate-800">{scan.status}</span>{scan.location ? ` · ${scan.location}` : ""}{scan.occurredAt ? ` · ${scan.occurredAt}` : ""}</li>)}</ol> : null}
                    </div> : <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center"><Truck className="mx-auto size-5 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">Delivery has not been created</p><p className="mt-1 text-xs text-slate-500">Create a delivery to reserve and publish a real Delhivery AWB.</p></div>}

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-semibold text-black/70">Shipping courier<select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="h-9 rounded-lg border border-black/20 bg-white px-3 text-xs font-medium text-black focus:border-black focus:outline-none"><option value="">Select courier</option>{CARRIERS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                      <label className="grid gap-1 text-xs font-semibold text-black/70">Tracking / AWB number<input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter a manifested AWB" className="h-9 rounded-lg border border-black/20 bg-white px-3 font-mono text-xs font-medium text-black focus:border-black focus:outline-none" /></label>
                      <label className="grid gap-1 text-xs font-semibold text-black/70">Tracking link<input type="text" value={trackingUrl} readOnly placeholder="Generated automatically from the AWB" className="h-9 rounded-lg border border-black/15 bg-slate-50 px-3 text-xs text-slate-500 outline-none" /></label>
                      <label className="grid gap-1 text-xs font-semibold text-black/70">Estimated delivery<input type="text" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} placeholder="e.g. 28 Aug 2026" className="h-9 rounded-lg border border-black/20 bg-white px-3 text-xs text-black focus:border-black focus:outline-none" /></label>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4"><p className="text-[11px] text-slate-500">Tracking links are generated automatically from the saved AWB. Courier status refreshes only when you open or refresh this panel.</p><button type="button" onClick={() => saveOrderUpdates()} disabled={isUpdating} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-black/80 disabled:opacity-50"><Save className="size-3.5" />{isUpdating ? "Saving…" : "Save delivery"}</button></div>
                  </div> : null}
                </section>

                {/* Internal Team Notes Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/75">
                      <FileText className="size-4 text-black/60" />
                      <span>Internal Team Notes (Not visible to customer)</span>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add private internal notes for warehouse, packaging, or customer service team..."
                    className="w-full rounded-lg border border-black/20 bg-white p-3 text-xs text-black focus:border-black focus:outline-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveOrderUpdates()}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-black/80 hover:bg-black/5 transition cursor-pointer"
                    >
                      <Save className="size-3.5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>

                {/* Payment Breakdown Card */}
                <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/75">
                      <CreditCard className="size-4 text-black/60" />
                      <span>Payment Details</span>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      Paid
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
                      <span>Total Paid</span>
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
