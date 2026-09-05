import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, RotateCcw, ShieldCheck, Wrench } from "lucide-react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

const policySections = [
  {
    title: "Warranty coverage",
    text: "Eligible XElectron products include a one-year manufacturer warranty from the date of purchase. Keep your invoice and product serial number available whenever you contact us.",
  },
  {
    title: "7-day replacement",
    text: "For verified transit damage or hardware defects reported within seven days of delivery, we assess the request and arrange replacement or pickup where applicable.",
  },
  {
    title: "Repairs and service",
    text: "During the warranty period, authorised technical repairs and eligible replacement parts are provided after product assessment. Service availability may depend on the product, location, and reported issue.",
  },
  {
    title: "What is not covered",
    text: "Damage caused by accidents, liquid exposure, misuse, unauthorised repairs, altered serial numbers, normal cosmetic wear, or use outside the product instructions is not covered by the manufacturer warranty.",
  },
  {
    title: "Your responsibilities",
    text: "Provide accurate ownership, purchase, and contact details. Back up personal content before handing over a device, and remove accessories not needed for diagnosis or repair.",
  },
  {
    title: "Policy updates",
    text: "We may update these terms to reflect changes in products, service processes, or applicable requirements. The version shown on this page applies to requests submitted after its update date.",
  },
];

export default function TermsPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fd] text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden bg-[linear-gradient(112deg,#0878e8_0%,#0a7ae6_56%,#0864c5_100%)] text-white">
        <div aria-hidden className="absolute -right-24 -top-28 size-[360px] rounded-full border-[48px] border-white/10" />
        <div aria-hidden className="absolute -bottom-40 right-[26%] size-[300px] rounded-full border border-white/20" />
        <div aria-hidden className="absolute inset-y-0 left-[46%] w-px bg-white/15" />
        <div className="relative mx-auto grid w-full max-w-[1800px] gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(520px,620px)] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#073f8a]/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100">
              <FileText className="size-3.5" /> Warranty & service
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Terms &amp; policy</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              Clear information about XElectron warranty coverage, replacement requests, and authorised service.
            </p>
            <p className="mt-5 text-xs font-medium text-sky-100">Last updated: 31 August 2026</p>
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-white/20 bg-[#0755ad]/60 shadow-2xl shadow-[#0753ad]/30 backdrop-blur-sm lg:block">
            <div className="flex items-center gap-3 px-6 py-5">
              <span className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sky-100"><ShieldCheck className="size-5" /></span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">Warranty support</p>
                <p className="mt-1 text-sm font-semibold text-white">Practical coverage for every XElectron device</p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/15">
              {[
                { icon: ShieldCheck, title: "Coverage", detail: "1-year manufacturer warranty" },
                { icon: RotateCcw, title: "Replacement", detail: "7-day eligible requests" },
                { icon: Wrench, title: "Service", detail: "Authorised repair support" },
              ].map(({ icon: Icon, title, detail }) => (
                <div key={title} className="min-h-32 border-r border-white/15 px-5 py-5 last:border-r-0">
                  <Icon className="size-4 text-sky-200" />
                  <p className="mt-4 text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-sky-100">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1800px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-12 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a7ae6]">On this page</p>
            <nav className="mt-3 grid gap-1">
            {policySections.map((section) => (
              <a key={section.title} href={`#${section.title.replaceAll(" ", "-")}`} className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-[#0a7ae6]">
                {section.title}
              </a>
            ))}
            </nav>
          </div>
        </aside>

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Official coverage", detail: "Product warranty support" },
              { icon: RotateCcw, label: "Replacement help", detail: "For eligible early issues" },
              { icon: Wrench, label: "Authorised repairs", detail: "Trained technical service" },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]"><Icon className="size-4.5" /></span>
                <p className="mt-3 text-sm font-bold text-slate-900">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4">
            {policySections.map((section, index) => (
              <article key={section.title} id={section.title.replaceAll(" ", "-")} className="scroll-mt-40 rounded-2xl border border-blue-100 bg-white px-6 py-6 shadow-sm transition-colors hover:border-[#0a7ae6]/30 sm:px-8 lg:px-10">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0a7ae6]"><CheckCircle2 className="size-4" /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a7ae6]">Policy detail {index + 1}</p>
                    <h2 className="mt-1 text-lg font-bold capitalize text-slate-900">{section.title}</h2>
                    <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-600">{section.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-[#0a7ae6] p-6 text-white shadow-lg shadow-blue-500/20 sm:flex-row sm:items-center sm:p-7">
            <div>
              <p className="text-lg font-bold">Need help with a service request?</p>
              <p className="mt-1 text-sm text-blue-50">Find an authorised center or submit a repair request.</p>
            </div>
            <div className="flex gap-3">
              <Link prefetch={false} href="/service-centers" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0a7ae6] transition hover:bg-blue-50">
                Service centers <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
