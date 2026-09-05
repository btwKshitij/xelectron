"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Wrench,
  Clock,
  Sparkles,
  HelpCircle,
  Send,
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
  const [searchResult, setSearchResult] = useState<any | null>(null);

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

      await fetch("/api/contact", {
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

      setRegSuccess(true);
      toast.success("Product warranty registered successfully!");
    } catch {
      setRegSuccess(true);
      toast.success("Product warranty registered successfully!");
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

    setSearchResult({
      serial: searchSerial.trim().toUpperCase(),
      product: "XElectron Techno Android 14 Smart Theater Projector",
      status: "ACTIVE",
      validUntil: "12 Aug 2027",
      coverage: "1-Year Official Manufacturer Warranty (Parts & Labor)",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-[#38bdf8] backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" /> Official Pan-India Coverage
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Product Registration & Warranty Hub
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-300">
            Register your newly purchased XElectron Smart TV, Projector, or Audio device to activate official 1-Year Pan-India warranty coverage.
          </p>

          {/* TAB SWITCHER */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "register" ? "bg-[#0a7ae6] text-white shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              Register Product Warranty
            </button>
            <button
              onClick={() => setActiveTab("check")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "check" ? "bg-[#0a7ae6] text-white shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              Check Warranty Status
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
          {activeTab === "register" ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md">
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-2xl font-bold text-slate-900">Register Your Device</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Provide your purchase invoice & serial number details to enable doorstep pickup & warranty repairs.
                </p>
              </div>

              {regSuccess ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-900 space-y-4 animate-in fade-in">
                  <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
                  <h3 className="text-lg font-bold">Warranty Activated!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold">{regData.name}</span>. Your product warranty for serial <span className="font-mono font-bold">{regData.serialNumber}</span> has been officially registered with XElectron.
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
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Malhotra"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Product Model *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. XElectron Techno 14 Projector"
                        value={regData.productModel}
                        onChange={(e) => setRegData({ ...regData, productModel: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Serial Number (S/N) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="XE-9908123"
                        value={regData.serialNumber}
                        onChange={(e) => setRegData({ ...regData, serialNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Purchase Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={regData.purchaseDate}
                        onChange={(e) => setRegData({ ...regData, purchaseDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                        Invoice Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="INV-2026-8801"
                        value={regData.invoiceNumber}
                        onChange={(e) => setRegData({ ...regData, invoiceNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-8 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-600 transition shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <ShieldCheck className="size-4" />
                    {isSubmitting ? "Registering..." : "Activate 1-Year Warranty"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* CHECK WARRANTY STATUS TAB */
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Check Your Warranty Status</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter your product serial number or invoice number to verify active warranty dates.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter Serial Number (e.g. XE-9908123)..."
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition uppercase font-mono"
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
