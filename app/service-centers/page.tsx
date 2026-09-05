import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Navigation, Phone, ShieldCheck, Wrench } from "lucide-react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

const serviceCenter = {
  name: "XElectron Service Center",
  address: "Plot No. 626, Ground Floor, Sector 5, Vaishali, Ghaziabad, Uttar Pradesh 201010",
  landmark: "In front of Ram Prashtha Green Colony, near Mohan Dhaba.",
  phone: "0120-4213337 / 9650836754",
  hours: "10:00 AM to 06:00 PM (Monday–Saturday)",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Plot+No+626+Ground+Floor+Sector+5+Vaishali+Ghaziabad+201010",
};

export default function ServiceCentersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a7ae6]">
            <ShieldCheck className="size-3.5" /> Official service network
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Authorised service centers</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Visit an authorised XElectron technician for product assessment, warranty support, and repair assistance. Doorstep pickup is available for eligible requests.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#0a7ae6] text-white"><Wrench className="size-4" /></span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{serviceCenter.name}</p>
                  <p className="text-xs text-emerald-600">Authorised service hub</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Open Mon–Sat</span>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
              <div className="space-y-5">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#0a7ae6]" />
                  <div><p className="text-sm font-bold">Address</p><p className="mt-1 text-sm leading-6 text-slate-600">{serviceCenter.address}</p><p className="mt-2 text-xs italic text-slate-500">Landmark: {serviceCenter.landmark}</p></div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-[#0a7ae6]" />
                  <div><p className="text-sm font-bold">Call the center</p><a href="tel:01204213337" className="mt-1 inline-block text-sm font-semibold text-[#0a7ae6] hover:underline">{serviceCenter.phone}</a></div>
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 size-5 shrink-0 text-[#0a7ae6]" />
                  <div><p className="text-sm font-bold">Service hours</p><p className="mt-1 text-sm text-slate-600">{serviceCenter.hours}</p></div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-6 text-white">
                <Navigation className="size-6 text-sky-300" />
                <h2 className="mt-6 text-xl font-bold">Plan your visit</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Bring the product, proof of purchase, and serial number. Calling first helps the team prepare for your visit.</p>
                <a href={serviceCenter.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-50">
                  Get directions <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </article>

          <aside className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
            <ShieldCheck className="size-6 text-[#0a7ae6]" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">Can&apos;t visit us?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Submit a repair or replacement request to check whether your product is eligible for doorstep pickup.</p>
            <Link prefetch={false} href="/repair-replacement" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a7ae6] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600">
              Submit a service request <ArrowRight className="size-4" />
            </Link>
            <Link prefetch={false} href="/terms-policy" className="mt-3 block text-center text-sm font-semibold text-[#0a7ae6] hover:underline">Read warranty terms</Link>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
