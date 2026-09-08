"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState<"register" | "check">("register");

  // Registration Form State
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    productModel: "",
    serialNumber: "",
    purchaseDate: "",
    invoiceNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Check Status State
  const [searchSerial, setSearchSerial] = useState("");
  const [searchResult, setSearchResult] = useState<{ product: string; status: string; serial: string; validUntil: string; coverage: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.serialNumber || !regData.invoiceNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const message = `Warranty Registration Details:
Product Model: ${regData.productModel || "N/A"}
Serial Number: ${regData.serialNumber}
Invoice Number: ${regData.invoiceNumber}
Purchase Date: ${regData.purchaseDate || "N/A"}`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regData.name,
          email: regData.email,
          phone: regData.phone,
          department: "Warranty & Service Department",
          message,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to register. Please try again.");
      setRegSuccess(true);
      toast.success("Warranty request received for review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSerial.trim()) {
      toast.error("Enter a valid Serial Number or Invoice Number.");
      return;
    }

    setSearchResult(null);
    toast.info("Contact customercare@xelectron.com with your serial or invoice number to confirm warranty status.");
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="border-b border-blue-100 bg-[#f0f6fd] py-9 sm:py-12">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-slate-500"><Link href="/" className="hover:text-blue-600">Home</Link><span aria-hidden="true">/</span><span>Support</span><span aria-hidden="true">/</span><span aria-current="page">Warranty</span></nav>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0876d5]">
            <ShieldCheck className="h-3.5 w-3.5" /> Product care & support
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[42px] text-slate-950">
            Register your XElectron.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Keep your purchase details in one place. Submit your device information for warranty review or get help checking your coverage.
          </p>

          {/* TAB SWITCHER */}
          <div className="mt-6 inline-flex w-full max-w-md rounded-xl border border-blue-100 bg-white p-1">
            <button
              aria-pressed={activeTab === "register"}
              onClick={() => setActiveTab("register")}
              className={`flex-1 px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "register" ? "bg-[#0a7ae6] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Register a device
            </button>
            <button
              aria-pressed={activeTab === "check"}
              onClick={() => setActiveTab("check")}
              className={`flex-1 px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "check" ? "bg-[#0a7ae6] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Warranty status
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto grid max-w-[1200px] items-start gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          {activeTab === "register" ? (
            <div className="min-w-0 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Device registration</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Have your invoice and serial number ready. All fields below are required.
                </p>
              </div>

              {regSuccess ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-900 space-y-4 animate-in fade-in">
                  <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
                  <h3 className="text-lg font-bold">Warranty Request Received</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold">{regData.name}</span>. Your product warranty for serial <span className="font-mono font-bold">{regData.serialNumber}</span> has been received for review by XElectron.
                  </p>
                  <button
                    onClick={() => {
                      setRegSuccess(false);
                      setRegData({ name: "", email: "", phone: "", productModel: "", serialNumber: "", purchaseDate: "", invoiceNumber: "" });
                    }}
                    className="mt-2 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Register Another Device
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="warranty-name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input id="warranty-name"
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="warranty-email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input id="warranty-email"
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="warranty-phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number *
                      </label>
                      <input id="warranty-phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="warranty-productModel" className="block text-sm font-medium text-slate-700 mb-2">
                        Product Model *
                      </label>
                      <input id="warranty-productModel"
                        type="text"
                        required
                        placeholder="e.g. XElectron Techno 14 Projector"
                        value={regData.productModel}
                        onChange={(e) => setRegData({ ...regData, productModel: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="warranty-serialNumber" className="block text-sm font-medium text-slate-700 mb-2">
                        Serial Number (S/N) *
                      </label>
                      <input id="warranty-serialNumber"
                        type="text"
                        required
                        placeholder="XE-9908123"
                        value={regData.serialNumber}
                        onChange={(e) => setRegData({ ...regData, serialNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="warranty-purchaseDate" className="block text-sm font-medium text-slate-700 mb-2">
                        Purchase Date *
                      </label>
                      <input id="warranty-purchaseDate"
                        type="date"
                        required
                        value={regData.purchaseDate}
                        onChange={(e) => setRegData({ ...regData, purchaseDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="warranty-invoiceNumber" className="block text-sm font-medium text-slate-700 mb-2">
                        Invoice Number *
                      </label>
                      <input id="warranty-invoiceNumber"
                        type="text"
                        required
                        placeholder="INV-2026-8801"
                        value={regData.invoiceNumber}
                        onChange={(e) => setRegData({ ...regData, invoiceNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-8 text-sm font-semibold text-white hover:bg-blue-600 transition shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <ShieldCheck className="size-4" />
                    {isSubmitting ? "Registering..." : "Submit registration"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* CHECK WARRANTY STATUS TAB */
            <div className="min-w-0 bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Check Your Warranty Status</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your serial or invoice number to get guidance on confirming coverage with our support team.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  required
                  placeholder="Enter Serial Number (e.g. XE-9908123)..."
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-base sm:text-sm outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition uppercase font-mono"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-[#0a7ae6] transition cursor-pointer"
                >
                  <Search className="size-4" /> Search
                </button>
              </form>

              {searchResult && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{searchResult.product}</span>
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {searchResult.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-blue-100">
                    <p><span className="font-semibold text-slate-800">Serial Number:</span> <span className="font-mono">{searchResult.serial}</span></p>
                    <p><span className="font-semibold text-slate-800">Valid Until:</span> {searchResult.validUntil}</p>
                    <p><span className="font-semibold text-slate-800">Coverage:</span> {searchResult.coverage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <aside className="rounded-2xl bg-slate-50 p-6">
            <FileText aria-hidden="true" className="mb-4 size-6 text-[#0a7ae6]" />
            <h2 className="text-base font-semibold">Before you start</h2>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li><span className="block font-medium text-slate-900">Purchase invoice</span><span className="mt-1 block text-xs leading-6">Use the invoice number and date from your proof of purchase.</span></li>
              <li><span className="block font-medium text-slate-900">Product details</span><span className="mt-1 block text-xs leading-6">Find the model and serial number on your device or packaging.</span></li>
              <li><span className="block font-medium text-slate-900">What happens next?</span><span className="mt-1 block text-xs leading-6">Our team reviews your registration and purchase details to confirm coverage.</span></li>
            </ul>
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-5"><Link href="/warranty-terms" className="block text-sm font-medium text-[#0876d5] hover:underline">Read warranty terms</Link><Link href="/contact" className="block text-sm font-medium text-[#0876d5] hover:underline">Need help? Contact support</Link></div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
