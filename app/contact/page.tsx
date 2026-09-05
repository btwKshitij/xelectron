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
  Building2,
  Store,
  Wrench,
  CheckCircle2,
  User,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Headphones,
} from "lucide-react";
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

const LOCATIONS = [
  {
    icon: Building2,
    badge: "Corporate Office",
    name: "XElectron Technologies Pvt. Ltd.",
    address: "2417, Tower A, The Corenthum, Sector – 62, Noida – 201301, UP.",
    landmark: "The Corenthum IT Hub, Sec-62",
    phones: ["+91 0120-4550655", "+91 8527312304"],
    timing: "Mon – Sat: 10:00 AM – 6:00 PM",
    email: "info@xelectron.com",
    mapUrl: "https://www.google.com/maps/place/XElectron+Technologies+Pvt+Ltd/@28.6270372,77.3689222,17z/data=!3m2!4b1!5s0x390ce55763f582bf:0x16d32f448de111e8!4m6!3m5!1s0x390cfad7e2c0b2b7:0xa963d077ab3281b6!8m2!3d28.6270373!4d77.3737931!16s%2Fg%2F11bxg5y7ws?entry=ttu&g_ep=EgoyMDI2MDgxMS4wIKXMDSoASAFQAw%3D%3D",
    badgeStyle: "bg-blue-50 text-[#0a7ae6] border-blue-200/80",
    iconBg: "bg-blue-50 text-[#0a7ae6]",
  },
  {
    icon: Store,
    badge: "Retail Store",
    name: "XElectron Experience Center",
    address: "LGF-22, Spectrum Metro Mall, Sector-75, Noida, UP – 201307.",
    landmark: "Lower Ground Floor, Spectrum Metro",
    phones: ["+91 9870293008"],
    timing: "Open daily: 01:00 PM – 09:00 PM",
    email: "sales@xelectron.com",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Spectrum%20Metro%20Mall%20Sector%2075%20Noida",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80",
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    icon: Wrench,
    badge: "Authorized Service Center",
    name: "XElectron Service Center",
    address: "Plot No.626, Ground Floor, Sector - 5, Vaishali, Ghaziabad, UP – 201010.",
    landmark: "Opp. Ram Prashtha Green Colony",
    phones: ["0120-4213337", "+91 9650836754"],
    timing: "Mon – Sat: 10:00 AM – 06:00 PM",
    email: "kapil@xelectron.com",
    mapUrl: "https://www.google.com/maps/place/@28.6466486,77.3479808,17z/data=!3m1!4b1!4m3!3m2!1s0x390cfacf66414da5:0xc2a2a28ae60610c8!12e1?entry=ttu&g_ep=EgoyMDI2MDgxMS4wIKXMDSoASAFQAw%3D%3D",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200/80",
    iconBg: "bg-amber-50 text-amber-700",
  },
];

const DEPARTMENTS = [
  {
    label: "Sales Department",
    value: "Sales Department",
    email: "sales@xelectron.com",
    desc: "For sales inquiries, corporate & bulk orders",
  },
  {
    label: "Customer Help Desk",
    value: "Customer Help Desk",
    email: "customercare@xelectron.com",
    desc: "For general customer support & warranty claims",
  },
  {
    label: "Service Center (Vaishali, Ghaziabad)",
    value: "Service Center (Vaishali, Ghaziabad)",
    email: "kapil@xelectron.com",
    desc: "For technical service, repairs & hardware replacements",
  },
  {
    label: "Spectrum Metro Store",
    value: "Spectrum Metro Store",
    email: "sales@xelectron.com",
    desc: "For showroom demos & retail store purchases",
  },
  {
    label: "Corporate Office",
    value: "Corporate Office",
    email: "info@xelectron.com",
    desc: "For administrative & corporate office correspondence",
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
      "Visit our authorized Service Center at Sector-5, Vaishali, Ghaziabad (Opp. Ram Prashtha Green Colony, Near Mohan Dhaba). Call 0120-4213337 or 9650836754, or email kapil@xelectron.com for repair assistance.",
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
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const selectedDepartmentInfo =
    DEPARTMENTS.find((d) => d.value === formData.department) || DEPARTMENTS[0];

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
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        toast.success(`Thank you! Your message has been sent to ${selectedDepartmentInfo.email}.`);
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
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  {/* Card Header & Contact Details */}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${dept.iconBg} shadow-2xs`}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug whitespace-nowrap truncate">{dept.title}</h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">{dept.hours}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${dept.tagColor}`}>
                        {dept.badge}
                      </span>
                    </div>

                    {/* Direct Contact Channels */}
                    <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-xs">
                      {/* Call Row */}
                      <div className="flex items-center justify-between py-1 whitespace-nowrap">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <Phone className="size-4 text-slate-400 shrink-0" /> Call
                        </span>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          {dept.phones.map((phone, idx) => (
                            <span key={phone.value} className="flex items-center gap-2">
                              {idx > 0 && <span className="text-slate-300 font-normal">/</span>}
                              <a href={phone.href} className="hover:text-[#0a7ae6] transition">
                                {phone.value}
                              </a>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Email Row */}
                      <div className="flex items-center justify-between py-1 border-t border-slate-100/70 whitespace-nowrap">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <Mail className="size-4 text-slate-400 shrink-0" /> Email
                        </span>
                        <a
                          href={`mailto:${dept.email}`}
                          className="font-semibold text-slate-800 hover:text-[#0a7ae6] transition"
                        >
                          {dept.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={`https://wa.me/91${dept.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 py-2.5 px-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition group cursor-pointer shadow-2xs whitespace-nowrap"
                    >
                      <MessageCircle className="size-4 text-emerald-600 fill-emerald-600 transition-transform group-hover:scale-110 shrink-0" />
                      <span>Chat on WhatsApp (+91 {dept.whatsapp})</span>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                      <div className="flex items-center justify-between text-slate-800 font-medium">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Phone className="size-3.5 text-slate-400" /> Contact
                        </span>
                        <span className="font-semibold text-slate-900">{loc.phones.join(" / ")}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Clock className="size-3.5 text-slate-400" /> Hours
                        </span>
                        <span className="font-medium text-slate-700">{loc.timing}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3.5 text-slate-400" /> Email
                        </span>
                        <a href={`mailto:${loc.email}`} className="font-semibold text-[#0a7ae6] hover:underline">
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
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center text-emerald-900 space-y-3 animate-in fade-in">
                  <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                  <h3 className="text-base font-bold">Inquiry Sent Successfully</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold">{formData.name}</span>. Your inquiry has been routed to{" "}
                    <span className="font-semibold text-emerald-900 underline">{selectedDepartmentInfo.email}</span>. Our team will reach out within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", department: "Sales Department", message: "" });
                    }}
                    className="mt-2 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
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
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination Email Indicator Badge */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="size-3.5 text-[#0a7ae6]" />
                      <span className="text-[11px]">Direct recipient email:</span>
                    </div>
                    <span className="font-mono font-bold text-[#0a7ae6] text-[11px]">
                      {selectedDepartmentInfo.email}
                    </span>
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
