"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ChevronDown,
  CheckCircle2,
  User,
  ExternalLink,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { LOCATIONS } from "@/lib/shared/locations";
import { CONTACT_DEPARTMENTS } from "@/lib/shared/contact-departments";
import { toast } from "sonner";

const QUICK_CONTACTS = [
  {
    id: "customer-care",
    icon: Headphones,
    badge: "24/7 Assistance",
    title: "Customer Support & Service",
    hours: "Mon – Sat: 10:00 AM – 06:00 PM",
    phones: [
      { label: "Direct", value: "+91 8527312304", href: "tel:8527312304" },
      { label: "Landline", value: "0120-4550655", href: "tel:01204550655" },
    ],
    whatsapp: "8527312304",
    email: "customercare@xelectron.com",
    tagColor: "bg-blue-50 text-[#0a7ae6] border-blue-200/80",
    iconBg: "bg-blue-50 text-[#0a7ae6]",
  },
  {
    id: "sales-inquiries",
    icon: User,
    badge: "Corporate & Bulk Orders",
    title: "Sales Department",
    hours: "Mon – Sat: 10:00 AM – 06:00 PM",
    phones: [
      { label: "Direct", value: "+91 9870293008", href: "tel:9870293008" },
      { label: "Landline", value: "0120-4550655", href: "tel:01204550655" },
    ],
    whatsapp: "9870293008",
    email: "sales@xelectron.com",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
];

const FAQS = [
  {
    question: "How do I register my product for official warranty?",
    answer:
      "Send your purchase invoice and serial number to customercare@xelectron.com or WhatsApp us at 8527312304. Our team will verify and activate your warranty within 24 hours.",
  },
  {
    question: "Where can I get technical service for my XElectron Projector or TV?",
    answer:
      "Visit our authorized Service Center at Sector-5, Vaishali, Ghaziabad (Opp. Ram Prashtha Green Colony, Near Mohan Dhaba). Call 0120-4213337 or 9311136520, or email kapil@xelectron.com for repair assistance.",
  },
  {
    question: "Can I test Projectors & Smart TVs live before buying?",
    answer:
      "Yes! Visit our Retail Store (XElectron Experience Center) at LGF-22, Spectrum Metro Mall, Sector-75, Noida (Open daily: 01:00 PM – 09:00 PM). Experience live 4K projection demos in person. Call 9870293008 for store queries.",
  },
  {
    question: "Who should I contact for corporate or bulk purchases?",
    answer:
      "Contact our Sales Department directly at 9870293008 or email sales@xelectron.com for special corporate discounts and bulk pricing.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Sales Department",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string>("");
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const selectedDepartmentInfo =
    CONTACT_DEPARTMENTS.find((d) => d.value === formData.department) || CONTACT_DEPARTMENTS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetEmail: selectedDepartmentInfo.email,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
        setSentToEmail(json.recipientEmail || selectedDepartmentInfo.email);
        toast.success(`Inquiry sent directly to ${json.recipientEmail || selectedDepartmentInfo.email}`);
      } else {
        toast.error(json.error || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error while sending message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-[#0a7ae6] selection:text-white">
      <Navbar />

      {/* HERO & PRIMARY CONTACT CHANNELS SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-16 sm:pt-24 sm:pb-24">
        {/* Technical Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000_60%,transparent_100%)] pointer-events-none opacity-80" />
        
        {/* Ambient Radial Lighting */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(10,122,230,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06),transparent_70%)] pointer-events-none" />

        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Title & Subtext */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>Customer Care & Helpdesk Online</span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              How can we <span className="text-[#0a7ae6]">help you</span> today?
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Reach our Customer Support Helpdesk, connect with the Sales Department, or visit an authorized Experience & Service Center.
            </p>
          </div>

          {/* Contact Department Cards Grid */}
          <div className="mt-12 sm:mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {QUICK_CONTACTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  {/* Card Header & Contact Details */}
                  <div>
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${dept.iconBg} shadow-2xs`}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">{dept.title}</h2>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-5">{dept.hours}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${dept.tagColor}`}>
                        {dept.badge}
                      </span>
                    </div>

                    {/* Direct Contact Channels */}
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-4 text-sm">
                      {/* Call Row */}
                      <div className="flex flex-col items-start gap-2 py-1">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <Phone className="size-4 text-slate-400 shrink-0" /> Call
                        </span>
                        <div className="grid w-full grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                          {dept.phones.map(phone => (
                            <a key={phone.value} href={phone.href} className="flex min-h-16 min-w-0 flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">
                              <span className="mb-1 text-[11px] font-medium text-slate-500">{phone.label}</span>
                              <span className="whitespace-nowrap text-[13px] font-semibold text-slate-900">{phone.value}</span>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Email Row */}
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <Mail className="size-4 text-slate-400 shrink-0" /> Email
                        </span>
                        <a
                          href={`mailto:${dept.email}`}
                          className="flex min-h-11 max-w-full items-center break-all text-sm font-semibold text-[#0a7ae6] hover:underline underline-offset-4 transition"
                        >
                          {dept.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Action Button */}
                  <div className="mt-4">
                    <a
                      href={`https://wa.me/91${dept.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 min-h-12 py-3 px-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition group cursor-pointer shadow-2xs text-center leading-5"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5 shrink-0 text-emerald-600">
                        <path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.47 0 .11 5.35.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.93 11.93 0 0 0 5.79 1.48h.01c6.58 0 11.94-5.35 11.95-11.94a11.87 11.87 0 0 0-3.48-8.42ZM12.05 21.82a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.88 9.88 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.93-9.92a9.86 9.86 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.97 9.87Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                      </svg>
                      <span>Chat on WhatsApp<span className="sr-only"> with {dept.title} at +91 {dept.whatsapp}</span></span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OFFICIAL LOCATIONS DIRECTORY */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <MapPin className="size-3.5" /> Experience & Service Hubs
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Visit an XElectron Hub
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore our corporate headquarters, experience live 4K projector demos at our retail store, or visit our authorized service center.
            </p>
          </div>

          {/* 3-Column Location Cards Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {LOCATIONS.map((loc) => {
              const Icon = loc.icon;
              return (
                <div
                  key={loc.name}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Header with Icon and Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${loc.iconBg} shadow-2xs`}>
                        <Icon className="size-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${loc.badgeStyle}`}>
                        {loc.badge}
                      </span>
                    </div>

                    {/* Name & Address */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0a7ae6] transition-colors leading-snug">
                        {loc.name}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {loc.address}
                      </p>
                      {loc.landmark && (
                        <p className="mt-1 text-[11px] text-slate-400 font-medium">
                          Near: {loc.landmark}
                        </p>
                      )}
                    </div>

                    {/* Contact, Timings & Email */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                      <div className="flex flex-col items-start gap-1.5 text-slate-800 font-medium">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Phone className="size-3.5 text-slate-400" /> Contact
                        </span>
                        <span className="font-semibold text-slate-900">{loc.phones.join(" / ")}</span>
                      </div>
                      <div className="flex flex-col items-start gap-1.5 text-slate-500">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Clock className="size-3.5 text-slate-400" /> Hours
                        </span>
                        <span className="font-medium text-slate-700">{loc.timing}</span>
                      </div>
                      <div className="flex flex-col items-start gap-1.5 text-slate-500">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3.5 text-slate-400" /> Email
                        </span>
                        <a href={`mailto:${loc.email}`} className="max-w-full break-all font-semibold text-[#0a7ae6] hover:underline">
                          {loc.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Directions Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-900 border border-slate-200/90 hover:border-slate-900 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:text-white transition-all duration-200 group/btn shadow-2xs"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="size-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORM & FAQ SECTION */}
      <section className="py-16 sm:py-20 bg-[#fafafa]">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* INQUIRY FORM */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                Message Us
              </span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                Send an Inquiry
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Choose the relevant department to route your inquiry directly to the right team.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 text-center text-emerald-950 space-y-4 animate-in fade-in">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-2xs">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      ● Inquiry Dispatched
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">Inquiry Routed Successfully</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-900">{formData.name}</strong>. Your message has been routed directly to the designated department inbox:
                    </p>
                  </div>

                  <div className="mx-auto max-w-md rounded-xl border border-emerald-300/80 bg-white p-3.5 shadow-2xs text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">Department:</span>
                      <span className="font-bold text-slate-900">{selectedDepartmentInfo.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                        <Mail className="size-3.5 text-emerald-600" />
                        Routed Mailbox:
                      </span>
                      <span className="font-mono font-bold text-[#0a7ae6]">{sentToEmail || selectedDepartmentInfo.email}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    A confirmation email has also been sent to <strong className="text-slate-700">{formData.email}</strong>. Our team will review your inquiry within 24 business hours.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setSentToEmail("");
                        setFormData({ name: "", email: "", phone: "", department: "Sales Department", message: "" });
                      }}
                      className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0a7ae6] transition cursor-pointer shadow-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 98702 93008"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Department
                      </label>
                      <select
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition"
                      >
                        {CONTACT_DEPARTMENTS.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label} ({dept.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination Email Indicator Badge */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                      <Mail className="size-4 text-[#0a7ae6] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-slate-500 block">Direct recipient mailbox:</span>
                        <span className="text-[11px] text-slate-600 truncate block">{selectedDepartmentInfo.desc}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-auto bg-white border border-blue-200/80 px-2.5 py-1 rounded-lg">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono font-bold text-[#0a7ae6] text-[11px]">
                        {selectedDepartmentInfo.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      placeholder="Enter your message, product model, or inquiry details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white focus:ring-2 focus:ring-[#0a7ae6]/10 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-xs font-bold text-white transition hover:bg-[#0a7ae6] shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                  Common Questions
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                  Support FAQ
                </h2>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = activeFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between p-4.5 text-left text-xs font-bold text-slate-900 hover:text-[#0a7ae6] transition cursor-pointer"
                      >
                        <span className="pr-4 leading-snug">{faq.question}</span>
                        <ChevronDown
                          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0a7ae6]" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4.5 pb-4.5 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0a7ae6]">
                  <ShieldCheck className="size-4" /> Pan-India Customer Support
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Call our care line at <a href="tel:8527312304" className="font-bold text-slate-900 hover:underline">8527312304</a> or email <a href="mailto:customercare@xelectron.com" className="font-bold text-slate-900 hover:underline">customercare@xelectron.com</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
