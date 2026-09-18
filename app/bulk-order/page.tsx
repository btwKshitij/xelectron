"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Building2,
  Hotel,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Percent,
  Headphones,
  ChevronDown,
  Gift,
  Briefcase,
  Tv,
  Monitor,
  Send,
  HelpCircle,
  Receipt,
  Layers,
  MapPin,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { orderedTopics } from "@/lib/shared/category-order";
import { resolveCategoryImage } from "@/lib/shared/category-utils";

type CategoryImage = {
  title: string;
  slug: string;
  image: string | null;
  products?: { mainImage: string | null }[];
};

// Core Institutional Categories
const CATEGORY_CARDS = [
  {
    id: "projectors",
    name: "Smart Projectors",
    tag: "Boardrooms & Education",
    desc: "Full HD & 4K Android projectors with high ANSI brightness for conference rooms, auditoriums & classrooms.",
    image: "/category-projector.png",
    moq: "From 5 Units",
  },
  {
    id: "photo-frames",
    name: "Digital Photo Frames",
    tag: "Corporate Gifting Favorite",
    desc: "WiFi Cloud & IPS digital frames with custom boot screens & laser branding, ideal for festive & executive rewards.",
    image: "/category-frame.png",
    moq: "From 5 Units",
  },
  {
    id: "monitors",
    name: "Portable Monitors",
    tag: "Workforce Mobility",
    desc: "Ultra-slim 15.6\" & 16.1\" USB-C dual-screen displays for mobile workforce, developers & sales teams.",
    image: "/category-monitor.png",
    moq: "From 5 Units",
  },
  {
    id: "tvs",
    name: "LED Televisions",
    tag: "Commercial Displays",
    desc: "Vivid 4K UHD smart screens with surround audio for lobbies, executive lounges & hospitality setups.",
    image: "/category-tv.png",
    moq: "From 3 Units",
  },
];

const QUANTITY_TIERS = [
  { label: "5 – 10 Units", badge: "Starter Tier", perk: "10% Wholesale Pricing" },
  { label: "11 – 25 Units", badge: "Business Tier", perk: "15% Off + Free Freight" },
  { label: "26 – 50 Units", badge: "Enterprise Tier", perk: "20% Off + Logo Customization" },
  { label: "51 – 100+ Units", badge: "Direct OEM Slabs", perk: "Bespoke Packaging & Terms" },
];

const PURPOSE_OPTIONS = [
  { id: "gifting", label: "Corporate Gifting", icon: Gift },
  { id: "office", label: "Office & Conference", icon: Briefcase },
  { id: "education", label: "School / Coaching", icon: Building2 },
  { id: "reseller", label: "Reselling / Retail", icon: Layers },
  { id: "other", label: "Hospitality & Other", icon: Hotel },
];

const ADVANTAGES = [
  {
    icon: Percent,
    title: "Direct Wholesale Pricing",
    desc: "Direct-from-manufacturer bulk rates without distributor or middleman markups.",
  },
  {
    icon: Receipt,
    title: "18% GST Input Credit",
    desc: "Official B2B invoices with your company GSTIN for maximum tax deductions.",
  },
  {
    icon: Gift,
    title: "Custom Branding & Packaging",
    desc: "Custom logo printing, bespoke gift packaging, and personalized startup screens available.",
  },
  {
    icon: Truck,
    title: "Pan-India Express Logistics",
    desc: "Fast dispatch across 19,000+ PIN codes with transit insurance and live dispatch tracking.",
  },
  {
    icon: ShieldCheck,
    title: "1-Year Official Warranty",
    desc: "Genuine manufacturer replacement warranty with priority corporate depot support.",
  },
  {
    icon: Headphones,
    title: "Dedicated Account Manager",
    desc: "Single point of contact for quotations, sample units, demo scheduling, and reorders.",
  },
];

const FAQS = [
  {
    q: "What is the Minimum Order Quantity (MOQ) for bulk orders?",
    a: "Our corporate wholesale pricing begins from as low as 5 units for most product lines. Custom logo laser engraving and OEM packaging typically start at 25–50 units.",
  },
  {
    q: "Can we request an evaluation / sample unit before large orders?",
    a: "Yes! You can order a single sample unit at corporate pricing (the sample premium is credited back against your final bulk PO), or visit our Experience Center in Noida for live projection and display demos.",
  },
  {
    q: "How does the GST invoicing and input tax credit work?",
    a: "All commercial orders receive a compliant GST B2B tax invoice reflecting your corporate name, billing address, and GSTIN, enabling your accounts department to claim the full 18% Input Tax Credit.",
  },
  {
    q: "What are the accepted institutional payment modes?",
    a: "We support RTGS / NEFT bank wire, corporate credit cards, UPI, and formal Purchase Orders (PO) with standard enterprise terms for approved corporate entities and government institutions.",
  },
  {
    q: "What is the typical shipping and delivery timeframe?",
    a: "Ready inventory dispatches within 24–48 hours. Metro deliveries arrive in 2–4 business days, while non-metro hubs arrive in 4–6 business days via dedicated freight partners (Delhivery, Blue Dart).",
  },
];

export default function BulkOrderPage() {
  const [categoryCards, setCategoryCards] = useState(CATEGORY_CARDS);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategoryImages() {
      try {
        const response = await fetch("/api/categories", { signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) return;
        const categories: CategoryImage[] = result.data;
        setCategoryCards(CATEGORY_CARDS.map((card) => {
          const topic = orderedTopics.find((topic) => topic.matches.test(card.name));
          const category = categories.find((category) =>
            topic?.matches.test(`${category.title} ${category.slug}`),
          );
          return category
            ? { ...card, image: resolveCategoryImage(category.image || category.products?.[0]?.mainImage, category.slug, category.title) }
            : card;
        }));
      } catch {
        // Keep the local category images if the catalog is unavailable.
      }
    }
    void loadCategoryImages();
    return () => controller.abort();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    productCategory: "Smart Projectors",
    quantity: "5 – 10 Units",
    requirementType: "Corporate Gifting",
    deliveryLocation: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error("Please fill in all mandatory fields (Name, Email, Phone, and Requirements).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bulk-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry. Please try again.");
      }

      setSubmittedReference(data.reference);
      toast.success("Bulk order inquiry sent directly to Corporate Sales (sales@xelectron.com)!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please contact our corporate desk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      productCategory: "Smart Projectors",
      quantity: "5 – 10 Units",
      requirementType: "Corporate Gifting",
      deliveryLocation: "",
      message: "",
    });
    setSubmittedReference(null);
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 selection:bg-[#0a7ae6] selection:text-white">
      <Navbar />

      <main className="w-full">
        {/* PREMIUM LIGHT HERO SECTION */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-white pt-10 pb-16 sm:pt-16 sm:pb-24">
          {/* Subtle geometric background accents */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0a7ae6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035]" />
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* LEFT COLUMN: HEADLINE & TRUST PROOF */}
              <div className="text-center lg:col-span-7 lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0a7ae6] shadow-sm">
                  <Building2 className="size-3.5" />
                  <span>XElectron For Business</span>
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.15] lg:text-6xl">
                  Bulk Procurement &{" "}
                  <span className="text-[#0a7ae6]">Corporate Gifting</span>
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
                  Equip your organization with India&apos;s leading Android Projectors, Digital Photo Frames, Commercial TVs and Portable Monitors at direct manufacturer rates.
                </p>

                {/* TRUST CHIPS */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    18% GST Input Credit
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                    <CheckCircle2 className="size-3.5 text-blue-600" />
                    MOQ From 5 Units
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                    <CheckCircle2 className="size-3.5 text-purple-600" />
                    Custom Logo Branding
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                    <CheckCircle2 className="size-3.5 text-amber-600" />
                    Pan-India Express Delivery
                  </span>
                </div>

                {/* CTA BUTTONS */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
                  <a
                    href="#inquiry-section"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-6 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#0867c2] active:scale-95"
                  >
                    <span>Request Custom Quote</span>
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="https://wa.me/919870293008?text=Hello%20XElectron%20Corporate%20Sales,%20I%20am%20interested%20in%20a%20bulk%20order%20quotation."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-xs transition hover:border-[#25D366] hover:bg-emerald-50/50 hover:text-emerald-700"
                  >
                    <span className="size-2 rounded-full bg-[#25D366]" />
                    <span>WhatsApp Sales Desk</span>
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE B2B PRODUCT SHOWCASE BENTO */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#0a7ae6]">
                        Institutional Portfolio
                      </p>
                      <h3 className="text-sm font-bold text-slate-900">
                        Top Categories for Business
                      </h3>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Tier Slabs Active
                    </span>
                  </div>

                  {/* 2x2 PRODUCT SHOWCASE GRID */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {categoryCards.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, productCategory: item.name }));
                          const el = document.getElementById("inquiry-section");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#f8fafc] p-3 transition-all hover:border-[#0a7ae6] hover:bg-white hover:shadow-md cursor-pointer"
                      >
                        <div className="relative mx-auto size-24 shrink-0 sm:size-28">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            onError={() => {
                              const fallback = CATEGORY_CARDS.find((card) => card.id === item.id)?.image;
                              if (fallback && item.image !== fallback) {
                                setCategoryCards((cards) => cards.map((card) =>
                                  card.id === item.id ? { ...card, image: fallback } : card,
                                ));
                              }
                            }}
                            sizes="120px"
                            className="object-contain p-1 transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <span className="inline-block text-[10px] font-medium text-slate-500">
                            {item.tag}
                          </span>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#0a7ae6] truncate">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-center text-xs text-slate-700">
                    Need customized models or special software integration?{" "}
                    <a
                      href="tel:9870293008"
                      className="font-bold text-[#0a7ae6] hover:underline"
                    >
                      Call +91 9870293008
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VOLUME TIERS / DISCOUNT SLABS STRIP */}
        <section className="border-b border-slate-100 bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0a7ae6]">
                  Volume Discount Tiers
                </p>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Transparent Bulk Pricing Slabs
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Discounts automatically calculated based on cumulative order units
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {QUANTITY_TIERS.map((tier, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-xs transition hover:border-[#0a7ae6] hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0a7ae6]">
                      {tier.badge}
                    </span>
                    <Flame className="size-3.5 text-amber-500" />
                  </div>
                  <p className="mt-2.5 text-base font-semibold text-slate-900">{tier.label}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">{tier.perk}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 VALUE PROPOSITIONS */}
        <section className="bg-slate-50/50 py-14 sm:py-20 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0a7ae6]">
                XElectron Enterprise Advantages
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                The Preferred Choice for Corporate Buyers
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Trusted by 500+ Indian corporations, educational institutions, luxury resorts, and government organizations.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ADVANTAGES.map((adv, idx) => {
                const Icon = adv.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-[#0a7ae6] hover:shadow-md"
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">{adv.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{adv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INQUIRY SECTION (FORM + DIRECT SALES DESK) */}
        <section id="inquiry-section" className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12">
              {/* LEFT: INTERACTIVE QUOTATION FORM */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 sm:p-9">
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0a7ae6]">
                        Official Quotation Form
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <Mail className="size-3 text-emerald-600" />
                        Dispatches directly to: sales@xelectron.com
                      </span>
                    </div>
                    <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Request Commercial Quotation
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      Fill in your institutional requirements. Your request is sent directly to our Sales Desk at <a href="mailto:sales@xelectron.com" className="font-semibold text-[#0a7ae6] hover:underline">sales@xelectron.com</a> with a guaranteed formal quote within 2–4 hours.
                    </p>
                  </div>

                  {submittedReference ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-emerald-950">
                        Inquiry Sent to Sales Desk!
                      </h3>
                      <p className="mt-2 text-xs text-emerald-800 sm:text-sm">
                        Your commercial inquiry has been routed directly to <strong>sales@xelectron.com</strong> under reference:
                      </p>
                      <div className="mx-auto mt-3 inline-block rounded-xl border border-emerald-300 bg-white px-5 py-2.5 font-mono text-sm font-semibold text-emerald-900 shadow-xs">
                        #{submittedReference.slice(-8).toUpperCase()}
                      </div>
                      <p className="mt-3.5 text-xs text-emerald-700">
                        A lead copy has been dispatched to <strong>sales@xelectron.com</strong>, and a confirmation email was sent to <strong>{formData.email}</strong>. Our dedicated account specialist will call you directly.
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <a
                          href={`https://wa.me/919870293008?text=${encodeURIComponent(
                            `Hi XElectron Team, I just submitted quotation request #${submittedReference.slice(-8).toUpperCase()} for ${formData.quantity} of ${formData.productCategory}. Could we discuss live pricing?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#20bd5a] transition"
                        >
                          Chat on WhatsApp for Instant Quote
                        </a>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Submit Another Inquiry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      {/* PURPOSE SELECTOR PILLS */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Requirement Purpose
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {PURPOSE_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = formData.requirementType === opt.label;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, requirementType: opt.label })}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center text-xs font-semibold transition cursor-pointer ${
                                  isSelected
                                    ? "border-[#0a7ae6] bg-blue-50/80 text-[#0a7ae6] shadow-xs"
                                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-white"
                                }`}
                              >
                                <Icon className="size-4" />
                                <span className="text-[11px] leading-tight">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* NAME & COMPANY */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Contact Person Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Vikram Verma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Company / Organization
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Reliance / Wipro / School"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>

                      {/* EMAIL & PHONE */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Work Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="vikram@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Mobile / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>

                      {/* CATEGORY & QUANTITY */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Product Category
                          </label>
                          <select
                            value={formData.productCategory}
                            onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10 cursor-pointer"
                          >
                            <option value="Smart Projectors">Smart Projectors (Android / 4K / FHD)</option>
                            <option value="Digital Photo Frames">Digital Photo Frames (WiFi / IPS)</option>
                            <option value="LED Televisions">LED Televisions (4K Smart Displays)</option>
                            <option value="Portable Monitors">Portable Monitors (15.6\" & 16.1\")</option>
                            <option value="Multiple Products">Multiple / Assorted Products</option>
                            <option value="Custom Requirement">Other Custom Specifications</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Estimated Quantity
                          </label>
                          <select
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10 cursor-pointer"
                          >
                            {QUANTITY_TIERS.map((t, idx) => (
                              <option key={idx} value={t.label}>
                                {t.label} ({t.badge})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* DELIVERY CITY */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Delivery City & PIN Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mumbai - 400001, Maharashtra"
                          value={formData.deliveryLocation}
                          onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                        />
                      </div>

                      {/* MESSAGE */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Detailed Specifications / Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Mention specific model numbers, delivery deadlines, custom boot-screen logo requirements, or budget criteria..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-sm text-slate-900 outline-none transition focus:border-[#0a7ae6] focus:bg-white focus:ring-3 focus:ring-blue-500/10"
                        />
                      </div>

                      {/* SUBMIT BUTTON */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-6 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-[#0867c2] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Submitting Quotation Request...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            <span>Send Request to Sales Desk (sales@xelectron.com)</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* RIGHT: DIRECT CORPORATE SALES DESK CARD */}
              <div className="space-y-6 lg:col-span-5">
                {/* DIRECT DESK */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#0a7ae6]">
                      <Headphones className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-950">Direct Corporate Sales Desk</h3>
                      <p className="text-xs text-slate-500">Need an immediate price quote or tender specs?</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3.5 border-t border-slate-100 pt-5 text-xs">
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 size-4 text-[#0a7ae6] shrink-0" />
                      <div>
                        <p className="text-slate-500 font-medium">Direct Sales Hotline</p>
                        <a href="tel:9870293008" className="text-sm font-bold text-slate-900 hover:text-[#0a7ae6] transition">
                          +91 9870293008
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 size-4 text-[#0a7ae6] shrink-0" />
                      <div>
                        <p className="text-slate-500 font-medium">Institutional Email</p>
                        <a href="mailto:sales@xelectron.com" className="text-sm font-bold text-[#0a7ae6] hover:underline transition">
                          sales@xelectron.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 size-4 text-[#0a7ae6] shrink-0" />
                      <div>
                        <p className="text-slate-500 font-medium">Business Desk Hours</p>
                        <p className="text-sm font-semibold text-slate-800">Mon – Sat: 10:00 AM – 06:00 PM</p>
                      </div>
                    </div>
                  </div>

                  {/* WHATSAPP ACTION */}
                  <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Instant WhatsApp Quotes</span>
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="mt-1 text-xs text-emerald-800/90 leading-relaxed">
                      Connect directly with an authorized Key Account Manager for rapid model selection and invoice samples.
                    </p>
                    <a
                      href="https://wa.me/919870293008?text=Hello%20XElectron%20Corporate%20Sales,%20I%20am%20interested%20in%20a%20bulk%20order%20quotation."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#20bd5a] active:scale-[0.99]"
                    >
                      <span>Chat on WhatsApp Now</span>
                    </a>
                  </div>
                </div>

                {/* EXPERIENCE CENTER CARD */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a7ae6]">
                    <MapPin className="size-4" />
                    <span>Live Product Experience Center</span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-900">
                    Schedule an On-Premise Demo
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Evaluate 4K projection throw distance, optical clarity, and build quality in person before submitting commercial purchase orders.
                  </p>
                  <div className="mt-3.5 rounded-xl border border-slate-100 bg-[#f8fafc] p-3 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">XElectron Experience Lounge:</p>
                    <p className="mt-0.5 text-slate-600">LGF-22, Spectrum Metro Mall, Sector-75, Noida, UP 201301</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">Open Daily: 01:00 PM – 09:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="border-t border-slate-100 bg-slate-50/50 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a7ae6]">
                Frequently Asked Questions
              </span>
              <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Commercial Procurement FAQs
              </h2>
            </div>

            <div className="mt-8 space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-slate-900 transition hover:text-[#0a7ae6] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-slate-400 transition-transform duration-200 ${
                        activeFaq === idx ? "rotate-180 text-[#0a7ae6]" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="border-t border-slate-100 px-5 pb-4.5 pt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
