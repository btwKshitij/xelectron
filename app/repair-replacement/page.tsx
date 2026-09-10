"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Wrench,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function RepairReplacementPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serialNumber: "",
    requestType: "Replacement (Within 7 Days)",
    issueDetails: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [reference, setReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.serialNumber || !formData.issueDetails) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/repair-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "The service request could not be sent.");
      }

      setSubmitted(true);
      setConfirmationSent(result.confirmationSent === true);
      setReference(result.reference);
      toast.success("Service request submitted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The service request could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900">
      <Navbar />

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_360px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a7ae6]">
              <RotateCcw className="size-3.5" /> Service & replacement
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#071a38] sm:text-4xl">
              Repair or replace your XElectron product.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Tell us what happened and we will arrange doorstep pickup when eligible, or guide you to our authorised service centre.
            </p>
          </div>
          <div className="rounded-2xl bg-[#071a38] p-5 text-white shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-300">How we can help</p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-300" />Free 7-day replacement for eligible issues</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-300" />Official warranty repairs from trained technicians</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fbff] py-7 sm:py-9">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 sm:px-8">
          <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7ff] text-[#0a7ae6]"><RotateCcw className="size-5" /></div>
            <div>
              <h2 className="text-sm font-bold text-[#071a38]">7-day replacement</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">For delivery damage or verified hardware defects reported within seven days.</p>
            </div>
          </div>
          <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="size-5" /></div>
            <div>
              <h2 className="text-sm font-bold text-[#071a38]">Official warranty repairs</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Repairs and eligible parts are handled during the one-year warranty period.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM & SERVICE CENTER DETAILS */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-12">
            {/* SERVICE REQUEST FORM */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm sm:p-8 lg:col-span-7">
              <h2 className="text-xl font-bold tracking-tight text-[#071a38] sm:text-2xl">
                Submit a service request
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Provide your order serial number and pickup address for fast service resolution.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900 space-y-3 animate-in fade-in">
                  <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                  <h3 className="text-base font-bold">Request Logged Successfully!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Your request for serial <span className="font-mono font-bold">{formData.serialNumber}</span> has been saved for review by our Vaishali Service Team.
                  </p>
                  <p className="text-xs text-emerald-700">Reference: <span className="font-mono font-bold">{reference}</span></p>
                  <p className="text-xs text-emerald-700">
                    {confirmationSent
                      ? `A confirmation email has been sent to ${formData.email}.`
                      : "Your request is saved, but we could not send your confirmation email. Please keep your reference number."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", serialNumber: "", requestType: "Replacement (Within 7 Days)", issueDetails: "", address: "" });
                    }}
                    className="mt-2 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="repair-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address *</label>
                    <input
                      id="repair-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition"
                    />
                    <p className="mt-1 text-xs text-slate-500">We will send your request confirmation to this address.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ankit Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Serial Number (S/N) *</label>
                      <input
                        type="text"
                        required
                        placeholder="XE-9812301"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Request Type</label>
                      <select
                        value={formData.requestType}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition"
                      >
                        <option value="Replacement (Within 7 Days)">7-Day Replacement</option>
                        <option value="Warranty Repair">Warranty Repair</option>
                        <option value="Out of Warranty Repair">Out-of-Warranty Repair</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Pickup Address</label>
                    <input
                      type="text"
                      placeholder="Complete street address with pincode for doorstep pickup..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Issue Description *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe the issue with display, audio, HDMI, or power..."
                      value={formData.issueDetails}
                      onChange={(e) => setFormData({ ...formData, issueDetails: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-xs outline-none focus:border-[#0a7ae6] transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-8 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Wrench className="size-4" />
                    {isSubmitting ? "Submitting..." : "Submit Repair Request"}
                  </button>
                </form>
              )}
            </div>

            {/* AUTHORIZED SERVICE CENTER SIDEBAR */}
            <div className="space-y-6 lg:col-span-5">
              <aside aria-labelledby="service-center-title" className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-[#ffffff] shadow-[0_8px_28px_-16px_rgba(7,26,56,0.15)]">
                <div className="border-t-4 border-[#0a7ae6] p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0a7ae6]">Main service hub</span>
                    <span className="rounded-full border border-[#dbeafe] bg-[#edf7ff] px-2.5 py-1 text-[10px] font-semibold text-[#0a7ae6]">Vaishali</span>
                  </div>
                  <h3 id="service-center-title" className="mt-3 text-xl font-bold tracking-tight text-[#071a38] sm:text-2xl">XElectron Service Center</h3>

                  <div className="mt-6 flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf7ff] text-[#0a7ae6]"><MapPin aria-hidden="true" className="size-4" /></div>
                    <div className="space-y-2">
                      <p className="text-sm leading-6 text-[#475569]">Plot No.626, Ground Floor, Sector - 5,<br />Vaishali, Ghaziabad, UP. PIN - 201010</p>
                      <p className="text-xs leading-5 text-[#64748b]">In front of Ram Prashtha Green Colony, near Mohan Dhaba.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3 border-t border-[#dbe4f0] pt-5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf7ff] text-[#0a7ae6]"><Phone aria-hidden="true" className="size-4" /></div>
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Call our service team</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-[#071a38]">
                        <a href="tel:01204213337" className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a7ae6]">0120-4213337</a>
                        <span aria-hidden="true" className="text-[#94a3b8]">/</span>
                        <a href="tel:+919311136520" className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a7ae6]">9311136520</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-[#dbe4f0] bg-[#f0f7ff] px-6 py-4 text-xs text-[#475569] sm:px-7">
                  <Clock aria-hidden="true" className="size-4 shrink-0 text-[#0a7ae6]" />
                  <p><span className="font-semibold">Mon–Sat</span><span className="mx-2 text-[#94a3b8]">·</span>10:00 AM – 6:00 PM</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
