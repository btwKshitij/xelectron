"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Briefcase,
  Users,
  Sparkles,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const OPENINGS = [
  {
    title: "Senior Hardware Service Engineer",
    department: "Technical Operations",
    location: "Vaishali, Ghaziabad",
    type: "Full-Time",
    experience: "2-4 Years",
    description: "Responsible for chip-level repair, motherboard diagnostics, and optics assembly for Smart Projectors and LED TVs.",
  },
  {
    title: "Retail Sales Executive (Showroom)",
    department: "Sales & Retail",
    location: "Spectrum Metro Mall, Noida Sec-75",
    type: "Full-Time",
    experience: "1-3 Years",
    description: "Engage with customers, demonstrate 4K projectors & home theater audio systems, and manage showroom inquiries.",
  },
  {
    title: "Customer Support & Escalations Lead",
    department: "Customer Success",
    location: "Sector 62, Noida (Corporate Office)",
    type: "Full-Time",
    experience: "2+ Years",
    description: "Manage inbound phone & WhatsApp customer support, track warranty tickets, and ensure high customer satisfaction.",
  },
];

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "Senior Hardware Service Engineer",
    portfolioUrl: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Job application submitted successfully!");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900">
      <Navbar />

      {/* HERO HEADER */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-[#38bdf8] backdrop-blur-md">
            <Briefcase className="h-3.5 w-3.5" /> Join Our Team
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Build the Future of Smart Home Theater
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-300">
            Join XElectron and help us bring cinema-grade display and sound innovations into millions of homes across India.
          </p>
        </div>
      </section>

      {/* OPEN POSITIONS & APPLICATION FORM */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* OPEN POSITIONS */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#0a7ae6]">Current Openings</span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Work With Us</h2>
              </div>

              <div className="space-y-4">
                {OPENINGS.map((job) => (
                  <div key={job.title} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-[#0a7ae6]/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-50 text-[#0a7ae6] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                        {job.department}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{job.type}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{job.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{job.description}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-[#0a7ae6]" /> {job.location}</span>
                      <span>Exp: {job.experience}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLICATION FORM */}
            <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Submit Your Application</h2>
              <p className="mt-1 text-xs text-slate-500">Apply for any open position or send your CV for future roles.</p>

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900 space-y-3 animate-in fade-in">
                  <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                  <h3 className="text-base font-bold">Application Received!</h3>
                  <p className="text-xs text-emerald-700">
                    Thank you, {formData.name}. Our HR team will review your profile and contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Target Role</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white transition"
                    >
                      {OPENINGS.map((o) => (
                        <option key={o.title} value={o.title}>{o.title}</option>
                      ))}
                      <option value="General Application">General Application (Other Roles)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Resume / LinkedIn / Drive Link</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile or Google Drive link"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs outline-none focus:border-[#0a7ae6] focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-8 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-600 transition shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-4" />
                    {isSubmitting ? "Submitting..." : "Apply Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
