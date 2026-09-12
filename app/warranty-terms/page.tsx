import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  PhoneCall,
  Mail,
  MapPin,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Tv,
  Projector,
  Monitor,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Warranty Terms & Conditions | XElectron Official Policy",
  description:
    "Comprehensive warranty policy, coverage details, 7-day replacement terms, exclusions, and doorstep service guidelines for all XElectron devices.",
};

const STATS = [
  {
    icon: ShieldCheck,
    title: "1-Year Standard Warranty",
    desc: "Comprehensive manufacturer warranty covering internal hardware and defective parts across all devices.",
    badge: "100% Genuine",
    bg: "bg-blue-50/80 text-[#0a7ae6] border-blue-100",
  },
  {
    icon: RotateCcw,
    title: "7-Day Replacement",
    desc: "Hassle-free replacement for transit damage or hardware defects reported within 7 days of delivery.",
    badge: "DOA Guarantee",
    bg: "bg-emerald-50/80 text-emerald-600 border-emerald-100",
  },
  {
    icon: Truck,
    title: "Free Pickup & Drop",
    desc: "Zero travel required—we arrange doorstep courier reverse pickup across all serviceable PIN codes.",
    badge: "PAN India",
    bg: "bg-purple-50/80 text-purple-600 border-purple-100",
  },
  {
    icon: Wrench,
    title: "Certified Tech Support",
    desc: "Repairs performed exclusively by trained technicians with genuine original equipment parts.",
    badge: "Official Lab",
    bg: "bg-amber-50/80 text-amber-600 border-amber-100",
  },
];

const CATEGORY_MATRIX = [
  {
    category: "Smart Projectors",
    icon: Projector,
    period: "1 Year",
    coverage: "Optical Engine, Mainboard, Power Supply, Internal Speakers, Cooling Fan",
    replacement: "7-Day Replacement for DOA / Transit Damage",
  },
  {
    category: "Smart LED TVs",
    icon: Tv,
    period: "1 Year",
    coverage: "Display Panel (Functional Defects), Logic Board, Power Board, Remote",
    replacement: "7-Day Replacement for Screen Defect on Arrival",
  },
  {
    category: "Portable Monitors",
    icon: Monitor,
    period: "1 Year",
    coverage: "IPS Panel, Type-C Controller, HDMI Board, Integrated Audio",
    replacement: "7-Day Replacement for Port / Display Failure",
  },
  {
    category: "Digital Photo Frames",
    icon: ImageIcon,
    period: "1 Year",
    coverage: "Display Screen, Wi-Fi Module, Internal Memory, Power Adapter",
    replacement: "7-Day Replacement for Booting / Screen Issues",
  },
  {
    category: "Accessories & Cables",
    icon: Wrench,
    period: "3 Months",
    coverage: "Original Power Adapters, Standard Remote Controllers, Connecting Cables",
    replacement: "Direct Replacement for Manufacturing Faults",
  },
];

const INCLUSIONS = [
  "Internal electronic component failures (Motherboard, Logic Board, Power PCB).",
  "Display panel manufacturing defects (lines, color bleeding without physical crack).",
  "Optical engine or LED light source failure on Projectors during normal use.",
  "Internal audio, speaker, and acoustic hardware malfunctioning.",
  "Dead-on-Arrival (DOA) units verified within 7 days of delivery.",
  "Certified replacement parts and labor during the active warranty period.",
];

const EXCLUSIONS = [
  "Physical breakage, cracked screens, heavy impact dents, or bent frames.",
  "Liquid ingress, water splashes, chemical corrosion, or moisture damage.",
  "Burnt components or electrical short circuits caused by voltage spikes or lightning.",
  "Unauthorized repairs, tampering, or broken factory warranty seals.",
  "Normal cosmetic wear-and-tear, scratches, paint chipping, and casing aging.",
  "Products with missing, altered, defaced, or illegible serial numbers / IMEI.",
  "Usage of improper power adapters or non-compatible third-party accessories.",
];

export default function WarrantyTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      <Navbar />

      <main className="w-full">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[#0a7ae6] transition-colors">
                Home
              </Link>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-slate-500">Warranty</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">Warranty Terms & Conditions</span>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-[#edf7ff] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                  <ShieldCheck className="size-3.5" /> Official Warranty Policy
                </span>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Warranty Terms &amp; Conditions
                </h1>

                <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
                  A transparent, comprehensive summary of XElectron product warranty coverage, 7-day replacement policies, exclusions, and nationwide repair support.
                </p>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  Policy Version 2026.1 · Applicable across all genuine XElectron purchases in India
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/warranty"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0a7ae6] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#0868c4] active:scale-95"
                >
                  Register Warranty <ArrowRight className="size-3.5" />
                </Link>

                <Link
                  href="/pickup-drop-service"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-800 shadow-2xs transition hover:border-[#0a7ae6] hover:text-[#0a7ae6]"
                >
                  Free Pickup & Drop Service
                </Link>
              </div>
            </div>

            {/* 4 HIGHLIGHT CARDS */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className={`flex size-10 items-center justify-center rounded-xl border ${stat.bg}`}>
                          <IconComponent className="size-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {stat.badge}
                        </span>
                      </div>
                      <h2 className="mt-4 text-sm font-semibold text-slate-900">
                        {stat.title}
                      </h2>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {stat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN BODY: STICKY TOC + DETAILED SECTIONS */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
              {/* STICKY SIDEBAR TABLE OF CONTENTS */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                      Table of Contents
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Jump to any policy section
                    </p>
                  </div>

                  <nav className="space-y-1">
                    {[
                      { title: "Standard Coverage", href: "#standard-coverage" },
                      { title: "Category Coverage Matrix", href: "#category-matrix" },
                      { title: "What is Covered", href: "#inclusions" },
                      { title: "What is NOT Covered", href: "#exclusions" },
                      { title: "7-Day Replacement Policy", href: "#replacement-policy" },
                      { title: "Free Pickup & Drop Service", href: "#pickup-drop" },
                      { title: "Customer Responsibilities", href: "#responsibilities" },
                      { title: "How to File a Claim", href: "#file-a-claim" },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-[#edf7ff] hover:text-[#0a7ae6]"
                      >
                        <span>{link.title}</span>
                        <ChevronRight className="size-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </a>
                    ))}
                  </nav>

                  {/* Sidebar Support Box */}
                  <div className="rounded-xl border border-blue-100 bg-[#f4f9ff] p-4 text-xs">
                    <p className="font-semibold text-slate-900">Have Questions?</p>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      Our customer care executive will verify your coverage within minutes.
                    </p>
                    <a
                      href="tel:01204550655"
                      className="mt-3 block font-semibold text-[#0a7ae6] hover:underline"
                    >
                      Helpline: 0120-4550655
                    </a>
                    <a
                      href="https://wa.me/918527312304"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-[11px] text-emerald-600 font-medium hover:underline"
                    >
                      WhatsApp: +91 8527312304
                    </a>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT PILLARS */}
              <div className="space-y-12 min-w-0">
                {/* SECTION 1: STANDARD COVERAGE */}
                <article id="standard-coverage" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                    <ShieldCheck className="size-4" /> Section 01
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Standard Manufacturer Warranty Scope
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                    XElectron Technologies Pvt. Ltd. warrants to the original end-user purchaser that genuine XElectron hardware products will be free from defects in material and workmanship under normal use for a period of <strong className="font-semibold text-slate-900">one (1) year</strong> from the date of original purchase, unless explicitly specified otherwise.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <h4 className="text-xs font-semibold text-slate-900">Proof of Purchase</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Warranty is authenticated using your official tax invoice from an authorized seller (Website, Amazon, Flipkart, or authorized dealer).
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <h4 className="text-xs font-semibold text-slate-900">Non-Transferable</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        This warranty is valid solely for the original buyer and cannot be transferred to subsequent owners without written authorization.
                      </p>
                    </div>
                  </div>
                </article>

                {/* SECTION 2: CATEGORY MATRIX TABLE */}
                <article id="category-matrix" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                    <FileText className="size-4" /> Section 02
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Category Coverage Matrix
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">
                    Specific warranty duration and covered hardware parts broken down by product line:
                  </p>

                  <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                        <tr>
                          <th className="px-4 py-3.5 sm:px-6">Product Category</th>
                          <th className="px-4 py-3.5 sm:px-6">Duration</th>
                          <th className="px-4 py-3.5 sm:px-6">Covered Components</th>
                          <th className="px-4 py-3.5 sm:px-6">DOA Terms</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {CATEGORY_MATRIX.map((row) => {
                          const IconComp = row.icon;
                          return (
                            <tr key={row.category} className="transition hover:bg-slate-50/50">
                              <td className="px-4 py-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#edf7ff] text-[#0a7ae6]">
                                    <IconComp className="size-3.5" />
                                  </span>
                                  {row.category}
                                </div>
                              </td>
                              <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                                <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-[#0a7ae6]">
                                  {row.period}
                                </span>
                              </td>
                              <td className="px-4 py-4 sm:px-6 leading-relaxed max-w-xs">
                                {row.coverage}
                              </td>
                              <td className="px-4 py-4 sm:px-6 text-slate-500 leading-relaxed">
                                {row.replacement}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>

                {/* SECTION 3: INCLUSIONS VS EXCLUSIONS */}
                <article id="inclusions" className="scroll-mt-28 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* WHAT IS COVERED */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-6 shadow-2xs sm:p-8">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        <CheckCircle2 className="size-4" /> Section 03A
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                        What is Covered (Inclusions)
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Eligible hardware failures covered under genuine warranty:
                      </p>

                      <ul className="mt-5 space-y-3">
                        {INCLUSIONS.map((inc) => (
                          <li key={inc} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="size-2.5" />
                            </span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* WHAT IS NOT COVERED */}
                    <div id="exclusions" className="scroll-mt-28 rounded-2xl border border-rose-200/80 bg-rose-50/20 p-6 shadow-2xs sm:p-8">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
                        <ShieldAlert className="size-4" /> Section 03B
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                        What is NOT Covered (Exclusions)
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Conditions and damages that void warranty coverage:
                      </p>

                      <ul className="mt-5 space-y-3">
                        {EXCLUSIONS.map((exc) => (
                          <li key={exc} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                              <X className="size-2.5" />
                            </span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>

                {/* SECTION 4: 7-DAY REPLACEMENT */}
                <article id="replacement-policy" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                    <RotateCcw className="size-4" /> Section 04
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    7-Day Hassle-Free Replacement Guarantee
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                    If your product arrives with verified transit damage, missing accessories, or hardware dead-on-arrival (DOA) defects, XElectron will provide a complimentary replacement.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">7-Day Window:</strong> Notice must be submitted within 7 calendar days of courier delivery confirmation.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">Unboxing Video Recommended:</strong> For transit damage or physical defects, a brief unboxing video or photographs help expedite immediate replacement approval.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">Original Packaging:</strong> The unit must be returned with its original box, invoice, and all included accessories intact.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href="/repair-replacement"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a7ae6] hover:underline"
                    >
                      Submit a Replacement Request <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>

                {/* SECTION 5: FREE PICKUP & DROP SERVICE */}
                <article id="pickup-drop" className="scroll-mt-28 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-[#f4f9ff] to-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                      <Truck className="size-4" /> Section 05
                    </div>
                    <span className="rounded-full bg-[#0a7ae6] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Doorstep Service
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Free Pickup &amp; Drop Warranty Service
                  </h2>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                    Now you don’t need to take the effort of visiting a service center—we’ll arrange to have your product picked up from your doorstep!
                  </p>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    At XElectron, we believe after-sales care is essential. Our 6-step warranty process covers remote assistance, doorstep reverse pickup, authorized technician service, thorough quality testing, and safe return delivery within 7–14 working days.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-blue-100 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Coverage</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900">All India PIN Codes</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Subject to courier serviceability</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Turnaround</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900">7–14 Working Days</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Pickup to doorstep return</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cost</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-600">100% Free Service</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Under valid warranty conditions</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-blue-100/80 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600">
                      Learn the 6 steps, packaging requirements, and transit precautions.
                    </span>
                    <Link
                      href="/pickup-drop-service"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0868c4] transition"
                    >
                      Read Full Pickup & Drop Guide <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>

                {/* SECTION 6: CUSTOMER RESPONSIBILITIES */}
                <article id="responsibilities" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                    <Clock className="size-4" /> Section 06
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    Customer Responsibilities
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">
                    To ensure smooth processing of warranty repairs and protect your equipment:
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">Proper Packaging:</strong> Products must be securely packed in the original box (or hard cardboard) cushioned with at least 2 layers of bubble wrap. Any transit damage due to improper customer packaging is not covered.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">Exclude Accessories:</strong> Do not send unnecessary accessories (remotes, adapters, cables) unless specifically requested by customer care.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="font-semibold text-slate-900">Data Backup:</strong> Back up all personal files, credentials, or custom app configurations before sending smart projectors or Android devices.
                      </p>
                    </div>
                  </div>
                </article>

                {/* SECTION 7: HOW TO FILE A CLAIM */}
                <article id="file-a-claim" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                    <PhoneCall className="size-4" /> Section 07
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                    How to File a Warranty Claim
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">
                    Follow these 3 simple steps to initiate service:
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                      <div className="font-mono text-xl font-semibold text-[#0a7ae6]">01</div>
                      <h4 className="mt-2 text-sm font-semibold text-slate-900">Prepare Details</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Locate your purchase tax invoice and device serial number (S/N label on back).
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                      <div className="font-mono text-xl font-semibold text-[#0a7ae6]">02</div>
                      <h4 className="mt-2 text-sm font-semibold text-slate-900">Submit Request</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Fill out our online service request form or message Customer Support via WhatsApp.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                      <div className="font-mono text-xl font-semibold text-[#0a7ae6]">03</div>
                      <h4 className="mt-2 text-sm font-semibold text-slate-900">Doorstep Pickup</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Hand over the securely packed parcel to our logistics partner when they arrive.
                      </p>
                    </div>
                  </div>
                </article>

                {/* BOTTOM CONTACT CALLOUT BANNER */}
                <div className="rounded-2xl bg-[#071a38] p-8 text-white sm:p-10 shadow-lg">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                        Dedicated Customer Support
                      </span>
                      <h3 className="mt-2 text-2xl font-semibold text-white tracking-tight">
                        Need assistance with a warranty claim?
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        Our service executives in Vaishali, Ghaziabad are available Monday to Saturday (10:00 AM – 6:00 PM) to help you.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href="/repair-replacement"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0a7ae6] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-blue-600 active:scale-95"
                      >
                        Submit Service Request <ChevronRight className="size-3.5" />
                      </Link>

                      <a
                        href="https://wa.me/918527312304"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition hover:bg-white/20"
                      >
                        WhatsApp Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
