"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock3, CalendarDays, Package, ArrowUpRight, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { shipmentPayment, type DeliveryBooking } from "@/lib/delivery-booking";
import { formatINR } from "@/lib/format-price";
import { pickupLocations, suggestedPickup } from "@/lib/pickup-location";

type Props = {
  orderId: string;
  paymentOrder: Parameters<typeof shipmentPayment>[0];
  booking?: DeliveryBooking | null;
  disabled?: boolean;
  onUpdated: (data: Record<string, unknown>) => void;
  onBusyChange: (busy: boolean) => void;
  onReplacementChange: (replacing: boolean) => void;
  courierStatus?: string | null;
  courierVerified?: boolean;
};

export function DeliveryBookingForm({ orderId, paymentOrder, booking, disabled, onUpdated, onBusyChange, onReplacementChange, courierStatus, courierVerified }: Props) {
  const payment = shipmentPayment(paymentOrder);
  const [busy, setBusy] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(() => /ClientWarehouse|warehouse.*(match|exist)/i.test(booking?.error || "") ? "" : booking?.parcel.pickupLocation || "");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [defaultError, setDefaultError] = useState("");
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [locationEdited, setLocationEdited] = useState(false);
  const [pickupSuggestion] = useState(() => suggestedPickup());
  useEffect(() => {
    let active = true;
    async function loadDefault() {
      try {
        const response = await fetch("/api/shipping/delhivery/defaults", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Unable to load pickup location.");
        if (active) {
          const location = result.data.pickupLocation || "";
          setDefaultLocation(location);
          if (!locationEdited && location && (!booking?.parcel.pickupLocation || /ClientWarehouse|warehouse.*(match|exist)/i.test(booking.error || ""))) setPickupLocation(location);
        }
      } catch (error) {
        if (active) setDefaultError(error instanceof Error ? error.message : "Unable to load pickup location.");
      } finally { if (active) setLoadingDefault(false); }
    }
    void loadDefault();
    return () => { active = false; };
  }, [booking?.parcel.pickupLocation, booking?.error, locationEdited]);
  const manifested = booking?.state === "MANIFESTED" && !replacing;
  const selectedLocation = pickupLocations.find((location) => location.name === (manifested ? booking.parcel.pickupLocation : pickupLocation));
  const blocked = ["CREATING", "UNKNOWN"].includes(booking?.state || "");
  const pickupBlocked = ["REQUESTING", "UNKNOWN", "SCHEDULED"].includes(booking?.pickupState || "");
  const savedError = booking?.error && (manifested || pickupLocation === booking.parcel.pickupLocation) ? booking.error : "";
  const notice = message || savedError;
  const noticeIsError = message ? messageIsError : Boolean(savedError);
  const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    setMessageIsError(false);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/shipping/delhivery/ship", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: replacing ? "replace" : manifested ? "pickup" : "manifest", previousAwb: replacing ? (booking?.awb || booking?.history?.at(-1)?.awb) : undefined, ...(manifested ? values : { parcel: values }) }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        onUpdated(result.data);
        setReplacing(false);
        onReplacementChange(false);
        setMessage(result.message);
      } else {
        setMessageIsError(true);
        setMessage(result.error || "Delivery request failed.");
        // Reload persisted failure/unknown state so a refresh cannot silently retry a booking.
        const refresh = await fetch(`/api/orders/${orderId}`);
        const current = await refresh.json();
        if (refresh.ok && current.success) onUpdated(current.data);
      }
    } catch {
      setMessageIsError(true);
      setMessage("Connection interrupted. Refresh this order to check the saved booking state before trying again.");
    } finally { setBusy(false); onBusyChange(false); }
  }
  if (courierStatus === "Cancelled" && !replacing) return <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
    <div className="flex items-center gap-2 font-semibold text-amber-900"><AlertCircle className="size-5" />Shipment cancelled in Delhivery</div>
    <p className="mt-2 text-sm text-amber-800">Delhivery reports that the seller cancelled this shipment. Pickup cannot be scheduled for this AWB.</p>
    <p className="mt-3 font-mono text-xs text-amber-900">AWB {booking?.awb || booking?.history?.at(-1)?.awb}</p>
    <button type="button" disabled={busy || disabled || blocked} onClick={() => { setReplacing(true); onReplacementChange(true); setMessage(""); }} className="mt-4 mr-4 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Create replacement shipment <ArrowRight className="size-4" /></button>
    {blocked && <p className="mt-2 text-xs text-amber-900">Replacement confirmation is pending. Check Delhivery One before trying again.</p>}
    <a href="https://one.delhivery.com/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline">View in Delhivery One <ArrowUpRight className="size-3.5" /></a>
  </div>;
  return <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900">{booking?.pickupId ? "Pickup requested" : manifested ? "Schedule your pickup" : replacing ? "Create a replacement shipment" : "Prepare your shipment"}</h3>
        <p className="mt-1 text-xs text-slate-500">{manifested ? `AWB ${booking.awb}` : "Choose a pickup location and add the packed box details."}</p>
      </div>
      <a className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600" href="https://one.delhivery.com/" target="_blank" rel="noreferrer">Delhivery One <ArrowUpRight className="size-3.5" /></a>
    </div>
    <div className="flex items-center gap-3 bg-slate-50/80 px-5 py-3 text-xs">
      <span className="flex items-center gap-2 font-semibold text-blue-700"><span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">{manifested ? <Check className="size-3" /> : "1"}</span>Shipment</span>
      <span className="h-px w-8 bg-slate-200" />
      <span className={`flex items-center gap-2 font-semibold ${manifested ? "text-blue-700" : "text-slate-400"}`}><span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${manifested ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>{booking?.pickupId ? <Check className="size-3" /> : "2"}</span>Pickup</span>
    </div>
    <form onSubmit={submit}>
      <fieldset disabled={busy || disabled || blocked || (manifested && (pickupBlocked || !courierVerified))} className="min-w-0 space-y-6 p-5 disabled:opacity-70">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><MapPin className="size-4 text-slate-400" /><span>Pickup location</span></div>
          {!manifested ? <div className="grid gap-3 sm:grid-cols-2">
            {pickupLocations.map((location) => <label key={location.name} className="relative block cursor-pointer">
              <input type="radio" name="pickupLocation" value={location.name} checked={pickupLocation === location.name} required onChange={() => { setPickupLocation(location.name); setLocationEdited(true); setMessage(""); }} className="peer sr-only" />
              <div className="h-full rounded-xl border border-slate-200 bg-white p-4 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50/50 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{location.name}</span>
                  {location.name === defaultLocation && <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100">Default</span>}
                  <span className={`ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border ${pickupLocation === location.name ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>{pickupLocation === location.name && <Check className="size-3" />}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{location.address}</p>
                <p className="mt-1 text-xs text-slate-500">{location.state} {location.pincode}</p>
              </div>
            </label>)}
            {pickupLocation && !selectedLocation && <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm sm:col-span-2"><input type="radio" name="pickupLocation" value={pickupLocation} checked readOnly />{pickupLocation}</label>}
          </div> : <p className="text-sm text-slate-700"><span className="font-semibold">{booking.parcel.pickupLocation}</span>{selectedLocation && <span className="mt-1 block text-xs leading-relaxed text-slate-500">{selectedLocation.address}, {selectedLocation.pincode}</span>}</p>}
          {loadingDefault && !manifested && <p className="mt-2 text-xs text-slate-400">Loading your default location...</p>}
          {defaultError && !manifested && <p className="mt-2 text-xs text-amber-700">{defaultError} Select a location above.</p>}
          {selectedLocation && <div className="mt-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />2:00 PM &ndash; 6:00 PM IST</span>
              {selectedLocation.workingDays && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{selectedLocation.workingDays}</span>}
            </div>
            {(selectedLocation.contactName || selectedLocation.returnAddress) && <details className="mt-3 text-xs text-slate-500">
              <summary className="w-fit cursor-pointer font-medium text-slate-600">Contact &amp; return details</summary>
              <div className="mt-2 space-y-2 border-l-2 border-slate-100 pl-3 leading-relaxed">
                {selectedLocation.contactName && <p>{selectedLocation.contactName}<br />{selectedLocation.phone}<br />{selectedLocation.email}</p>}
                {selectedLocation.returnAddress && <p><span className="font-medium text-slate-700">Return address</span><br />{selectedLocation.returnAddress}</p>}
              </div>
            </details>}
          </div>}
        </div>
        {!manifested ? <>
          <div className={`rounded-xl border p-4 ${payment.eligible ? "border-blue-100 bg-blue-50/40" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-slate-900">{payment.cod ? "Cash on delivery" : payment.eligible ? "Prepaid order" : "Payment not verified"}</p><p className="mt-1 text-xs text-slate-500">Order total: {formatINR(paymentOrder.total)}</p></div>
              {payment.eligible && <div className="sm:text-right"><p className="text-xs text-slate-500">Amount to collect at delivery</p><p className="mt-1 text-xl font-semibold text-slate-900">{formatINR(payment.amount)}</p></div>}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{payment.cod ? "Taken automatically from the saved order total and sent to Delhivery when you create the shipment. No manual entry needed." : payment.eligible ? "Payment is already verified. Delhivery will not collect payment from the customer." : "Verify the payment or convert this order to COD before creating a shipment."}</p>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Package className="size-4 text-slate-400" />Parcel details</div>
            <p className="mb-4 mt-1 text-xs text-slate-500">Measure the final packed box. One box per shipment.</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {([['weight', 'Weight', 'g'], ['length', 'Length', 'cm'], ['width', 'Width', 'cm'], ['height', 'Height', 'cm']] as const).map(([name, label, unit]) => <label key={name} className="grid gap-1.5 text-xs font-medium text-slate-600">{label} ({unit})<input name={name} required type="number" min="0.01" step="0.01" placeholder="0" defaultValue={booking?.parcel[name]} className={inputClass} /></label>)}
            </div>
            <label className="mt-4 grid gap-1.5 text-xs font-medium text-slate-600 sm:max-w-xs">Shipping service<select name="shippingMode" defaultValue={booking?.parcel.shippingMode || "Express"} className={inputClass}><option>Express</option><option>Surface</option></select></label>
          </div>
          <details className="rounded-lg border border-slate-200 px-4 py-3" open={Boolean(booking?.parcel.sellerGst || booking?.parcel.hsnCode || booking?.parcel.ewaybill) || undefined}>
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">Tax &amp; invoice details</summary>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Add GST and HSN details if they are not registered with Delhivery. An e-waybill is required above &#8377;50,000.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-xs font-medium text-slate-600">Seller GSTIN<input name="sellerGst" maxLength={15} defaultValue={booking?.parcel.sellerGst} className={inputClass} /></label>
              <label className="grid gap-1.5 text-xs font-medium text-slate-600">Product HSN codes<input name="hsnCode" defaultValue={booking?.parcel.hsnCode} className={inputClass} /></label>
              <label className="grid gap-1.5 text-xs font-medium text-slate-600">E-waybill number<input name="ewaybill" defaultValue={booking?.parcel.ewaybill} className={inputClass} /></label>
            </div>
          </details>
        </> : !booking.pickupId ? <div className="border-t border-slate-100 pt-5">
          <h4 className="text-sm font-semibold text-slate-900">When is the parcel ready?</h4>
          <p className="mt-1 text-xs text-slate-500">Choose a future date and preferred collection time.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-slate-600">Pickup date<input name="pickupDate" type="date" required defaultValue={booking.pickupState === "FAILED" ? undefined : booking.pickupDate || (selectedLocation ? pickupSuggestion.date : undefined)} className={inputClass} /></label>
            <label className="grid gap-1.5 text-xs font-medium text-slate-600">Preferred time (IST)<input name="pickupTime" type="time" required defaultValue={booking.pickupTime || (selectedLocation ? pickupSuggestion.time : undefined)} className={inputClass} /></label>
          </div>
        </div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><p className="flex items-center gap-2 text-sm font-semibold"><Check className="size-4" />Pickup requested</p><p className="mt-2 text-xs">Reference {booking.pickupId} &middot; {booking.pickupDate} at {booking.pickupTime} IST</p></div>}
        {(!booking?.pickupId || replacing) && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">{manifested ? "Attach the Delhivery label before collection." : "Create the shipment first, then schedule pickup."}</p>
          <button type="submit" disabled={busy || disabled || blocked || (manifested && pickupBlocked) || (!manifested && !pickupLocation)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 className="size-4 motion-safe:animate-spin" /> : null}{busy ? "Contacting Delhivery..." : manifested ? "Schedule pickup" : replacing ? "Create replacement shipment" : "Create shipment"}{!busy && <ArrowRight className="size-4" />}</button>
        </div>}
      </fieldset>
    </form>
    {(notice || blocked || (pickupBlocked && !booking?.pickupId)) && <div role={noticeIsError ? "alert" : "status"} className={`mx-5 mb-5 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed ${noticeIsError || blocked || (pickupBlocked && !booking?.pickupId) ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><AlertCircle className="mt-0.5 size-4 shrink-0" /><p>{notice || "Confirmation is pending. Check Delhivery One before making another request."}</p></div>}
    {booking?.environment === "staging" && <p className="mx-5 mb-4 text-xs text-amber-800">Test environment: this booking will not arrange a real collection.</p>}
    {booking?.pickupId && <p className="px-5 pb-5 text-xs text-slate-500">Manage pickup changes and print your label in Delhivery One.</p>}
  </div>;
}
