import Link from "next/link";
import { LOCATIONS } from "@/lib/shared/locations";
import { ArrowRight, Clock3, MapPin, Navigation, Phone, ShieldCheck, Mail, Check, Headphones } from "lucide-react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

export const metadata = {
  title: "Authorised Service Centers | XElectron",
  description: "Find XElectron service center details, opening hours, directions, and repair support.",
};

export default function ServiceCentersPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <section className="relative overflow-hidden border-b border-blue-100 bg-[#f0f6fd]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-52 size-[600px] rounded-full border-[80px] border-white/50" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link href="/" className="hover:text-blue-600">Home</Link><span aria-hidden="true">/</span><span>Support</span><span aria-hidden="true">/</span><span aria-current="page">Service centers</span></nav>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0876d5]"><ShieldCheck aria-hidden="true" className="size-4" />Experience & service hubs</div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-[44px]">Visit an XElectron hub.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">Find our corporate office, explore products at our retail store, or visit our authorised service center for repairs.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0876d5]">Visit us</p><h2 className="text-2xl font-semibold tracking-tight">Our locations</h2></div><span className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin aria-hidden="true" className="size-4" />3 locations in Noida & Ghaziabad</span></div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {LOCATIONS.map(location => {
              const Icon = location.icon;
              return (
                <article key={location.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
                    <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${location.iconBg}`}><Icon className="size-5" /></span>
                    <div className="min-w-0"><p className="mb-1 text-xs font-medium text-slate-500">{location.badge}</p><h3 className="text-lg font-semibold tracking-tight">{location.name}</h3></div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex gap-3"><MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#0a7ae6]" /><div><h4 className="text-sm font-semibold">Address</h4><address className="mt-1 text-sm not-italic leading-6 text-slate-600">{location.address}</address><p className="mt-1 text-xs leading-6 text-slate-500">Landmark: {location.landmark}</p></div></div>
                    <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      <div className="flex gap-3"><Clock3 aria-hidden="true" className="size-5 shrink-0 text-[#0a7ae6]" /><div><h4 className="text-sm font-semibold">Hours</h4><p className="mt-2 text-sm leading-6 text-slate-600">{location.timing}</p></div></div>
                      <div className="flex gap-3"><Phone aria-hidden="true" className="size-5 shrink-0 text-[#0a7ae6]" /><div><h4 className="text-sm font-semibold">Call this location</h4>{location.phones.map(phone => <a key={phone} href={`tel:${phone.replace(/^\+91 0/, "+91 ").replace(/[^+0-9]/g, "")}`} className="block min-h-11 py-2.5 sm:min-h-0 sm:py-1 text-sm font-medium text-[#0876d5] hover:underline">{phone}</a>)}</div></div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <a href={`mailto:${location.email}`} className="flex min-h-11 items-center gap-3 text-sm font-medium text-[#0876d5] hover:underline"><Mail aria-hidden="true" className="size-5 shrink-0" /><span className="min-w-0 break-all">{location.email}</span></a>
                    <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#0a7ae6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0868c4] sm:w-auto sm:shrink-0"><Navigation aria-hidden="true" className="size-4" />Get directions<span className="sr-only"> to {location.name} (opens Google Maps in a new tab)</span><ArrowRight aria-hidden="true" className="size-4" /></a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-lg font-semibold tracking-tight">Planning a repair visit?</h2><p className="mt-2 text-sm leading-6 text-slate-500">For repairs, visit our Vaishali service center. Call ahead and keep these details handy.</p>
            <ul className="mt-4 space-y-3">{[["Your device", "Bring the product that needs attention."], ["Proof of purchase", "Keep your invoice or order details ready."], ["Model & serial number", "Find these on your product label."]].map(([title, description]) => <li key={title} className="flex gap-3"><span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0876d5]"><Check className="size-3" /></span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-6 text-slate-500">{description}</p></div></li>)}</ul>
            <Link href="/terms-policy" className="mt-4 inline-flex items-center gap-2 border-t border-slate-200 pt-4 text-sm font-medium text-[#0876d5]">Read warranty terms<ArrowRight aria-hidden="true" className="size-4" /></Link>
          </aside>
        </div>
        <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-blue-100 bg-[#f0f6fd] p-6 sm:p-8 lg:flex-row lg:items-center"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0a7ae6]"><Headphones className="size-6" /></span><div className="flex-1"><h2 className="text-lg font-semibold tracking-tight">Can&apos;t make it to the center?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Request a repair or replacement to check whether your product is eligible for doorstep pickup.</p></div><Link prefetch={false} href="/repair-replacement" className="inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-lg bg-[#0a7ae6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0868c4] lg:self-center">Submit a service request<ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link></div>
      </section>
      <Footer />
    </main>
  );
}
