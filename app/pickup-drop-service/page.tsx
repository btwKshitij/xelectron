import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Truck,
  PhoneCall,
  Laptop,
  Wrench,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  FileText,
  Box,
  Hash,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Video,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Free Pickup & Drop Service | XElectron Warranty Support",
  description:
    "Enjoy hassle-free doorstep warranty service for all XElectron products. Learn the 6-step warranty service process, packaging guidelines, and doorstep pickup coverage.",
};

const STEPS = [
  {
    number: "01",
    title: "Contact Customer Care",
    icon: PhoneCall,
    description:
      "If you face any issue with your product, connect with our support team directly. We are available Monday to Saturday, 10:00 AM to 6:00 PM.",
    contacts: [
      { label: "Helpline", value: "+91 120-4550655", href: "tel:01204550655" },
      { label: "WhatsApp", value: "+91 8527312304", href: "https://wa.me/918527312304" },
      { label: "Email", value: "customercare@xelectron.com", href: "mailto:customercare@xelectron.com" },
    ],
  },
  {
    number: "02",
    title: "Remote Assistance",
    icon: Laptop,
    description:
      "Our Customer Care team will assist you over the phone, WhatsApp, or email. In many cases, product-related issues can be resolved remotely without requiring the product to be sent to our Service Center.",
  },
  {
    number: "03",
    title: "Doorstep Pickup",
    icon: Truck,
    description:
      "If the issue cannot be resolved remotely, you will be asked to provide your address and other required details to our Customer Care Executive. A reverse pickup will then be arranged by XElectron on your behalf.",
  },
  {
    number: "04",
    title: "Service / Replacement",
    icon: Wrench,
    description:
      "Once the product reaches our Service Center, it will be inspected. Depending on the nature of the issue and the applicable warranty terms, the product will be repaired or replaced.",
  },
  {
    number: "05",
    title: "Quality Check",
    icon: CheckCircle2,
    description:
      "After the issue has been resolved, the product will undergo a thorough quality check to ensure proper functioning and minimize the possibility of recurring issues.",
  },
  {
    number: "06",
    title: "Return Delivery",
    icon: PackageCheck,
    description:
      "Once the service process and quality check are completed, the product will be shipped back to you through one of our logistics partners. The complete process generally takes 7–14 working days.",
  },
];

const ESSENTIALS = [
  {
    icon: FileText,
    title: "Invoice / Bill",
    desc: "Original or digital copy of your purchase invoice showing order details and date.",
  },
  {
    icon: Box,
    title: "XElectron Product Box",
    desc: "Preferred, as it is custom-molded to provide the best protection during transit.",
  },
  {
    icon: Hash,
    title: "Serial Number / IMEI",
    desc: "Product Serial Number or IMEI Number, wherever applicable on device label.",
  },
  {
    icon: AlertCircle,
    title: "Written Problem Note",
    desc: "A brief handwritten or printed note describing the exact issue, placed inside the box.",
  },
];

export default function PickupDropServicePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="w-full">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#f4f9ff] via-[#fafcff] to-white py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[#0a7ae6] transition-colors">
                Home
              </Link>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-slate-500">Support & Service</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">Free Pickup & Drop Service</span>
            </nav>

            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-[#edf7ff] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
                  <Truck className="size-3.5" /> Doorstep Warranty Service
                </span>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Free Pickup & Drop Service
                </h1>

                <p className="mt-4 text-base font-normal leading-relaxed text-slate-700 sm:text-lg">
                  Now you don’t need to take the effort of visiting a service center—we’ll arrange to have your product picked up from your doorstep!
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  A transaction is incomplete if it does not take into account the after-sales service. At XElectron, we believe in providing the best possible service to our customers. That is why we offer Free Pickup & Drop Warranty Service for all our products.
                </p>

                {/* Quick CTA Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/repair-replacement"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a7ae6] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#0868c4] active:scale-95"
                  >
                    Submit Service Request <ArrowRight className="size-3.5" />
                  </Link>

                  <a
                    href="https://wa.me/918527312304"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-800 shadow-2xs transition hover:border-[#0a7ae6] hover:text-[#0a7ae6]"
                  >
                    WhatsApp Support: 8527312304
                  </a>
                </div>
              </div>

              {/* Turnaround & Service Highlights Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0a7ae6]">
                    Service Highlights
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf7ff] text-[#0a7ae6]">
                        <Clock className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">7–14 Working Days</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Average turnaround time from doorstep pickup to return delivery.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <MapPin className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">All India Coverage</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Available across all PIN codes, subject to logistics partner serviceability.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Official Brand Warranty</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Inspected, serviced, and tested by certified XElectron technicians.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    Need fast help? Call helpline{" "}
                    <a href="tel:01204550655" className="font-semibold text-slate-800 hover:text-[#0a7ae6]">
                      0120-4550655
                    </a>{" "}
                    (10:00 AM – 6:00 PM).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6-STEP WARRANTY SERVICE PROCESS */}
        <section className="border-b border-slate-100 bg-white py-14 sm:py-18">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0a7ae6]">
                How It Works
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Warranty Service Process
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Follow these simple 6 steps from reporting an issue to getting your serviced product back at your doorstep.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.number}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#edf7ff] text-[#0a7ae6] transition group-hover:bg-[#0a7ae6] group-hover:text-white">
                          <IconComponent className="size-5" />
                        </div>
                        <span className="font-mono text-xl font-semibold text-slate-300 group-hover:text-[#0a7ae6]">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-slate-900">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {step.description}
                      </p>

                      {step.contacts && (
                        <div className="mt-4 space-y-1.5 rounded-xl border border-slate-200/60 bg-white p-3 text-xs">
                          {step.contacts.map((c) => (
                            <div key={c.label} className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">{c.label}:</span>
                              <a
                                href={c.href}
                                target={c.href.startsWith("http") ? "_blank" : undefined}
                                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="font-medium text-[#0a7ae6] hover:underline"
                              >
                                {c.value}
                              </a>
                            </div>
                          ))}
                          <p className="pt-1 text-[11px] text-slate-400 border-t border-slate-100">
                            Timings: 10:00 AM to 6:00 PM
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Important Note Callout */}
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Important Note
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900">
                    If the product is inspected and found to have no fault or defect, the customer may be required to bear the applicable logistics and shipping charges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESSENTIALS REQUIRED */}
        <section className="border-b border-slate-100 bg-[#f8fafc] py-14 sm:py-18">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0a7ae6]">
                Checklist
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Essentials Required for Warranty Service
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Please keep the following items and details ready before dispatching your product:
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ESSENTIALS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#edf7ff] text-[#0a7ae6]">
                      <IconComponent className="size-5" />
                    </div>
                    <h3 className="mt-3.5 text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PACKAGING INSTRUCTIONS & TRANSIT DAMAGE */}
        <section className="border-b border-slate-100 bg-white py-14 sm:py-18">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Packaging Instructions */}
              <div className="lg:col-span-7">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0a7ae6]">
                  Safe Transportation
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Packaging Instructions
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  To ensure the safe transportation of your XElectron product, please follow these instructions carefully:
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                    <p className="text-xs leading-relaxed text-slate-700">
                      Pack the product in the original XElectron product box (preferred) or another sturdy, hard cardboard box.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                    <p className="text-xs leading-relaxed text-slate-700">
                      The box should not be significantly larger than the product. This helps prevent the product from moving or shaking inside the package during transit.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                    <p className="text-xs leading-relaxed text-slate-700">
                      Properly cushion and protect the product using at least two layers of bubble wrap or thermocol.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7ae6]" />
                    <p className="text-xs leading-relaxed text-slate-700">
                      Make sure the product is securely packed and cannot move freely inside the box.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 border border-slate-200/60">
                  <span className="font-semibold text-slate-800">Customer Responsibility:</span> Proper packaging is essential to ensure the safe transit of your product. Any damage caused during transportation due to inadequate or improper packaging will not be covered under the company warranty. The responsibility for properly packaging the product rests with the customer.
                </div>
              </div>

              {/* Transit Damage & Accessories Alert Sidebars */}
              <div className="space-y-6 lg:col-span-5">
                {/* Transit Damage Warning */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                      <ShieldAlert className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-rose-900">
                        Important: Transit Damage
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-rose-800">
                        Please note that if the product is found to be damaged, broken, liquid-damaged, or burnt during inspection, such damage will not be covered under the company warranty.
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-rose-800">
                    In such cases, the applicable pickup and return courier charges will be payable by the customer.
                  </p>

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200/80 bg-white p-3 text-xs text-rose-950 font-medium">
                    <Video className="mt-0.5 size-4 shrink-0 text-rose-600" />
                    <span>
                      We strongly recommend recording a short video while packing the product to confirm secure packaging prior to courier dispatch.
                    </span>
                  </div>
                </div>

                {/* Accessories Policy Warning */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900">
                        Accessories Notice
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-amber-800">
                        Please do not send any accessories along with the product unless specifically requested by our Customer Care team.
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-amber-800">
                    XElectron requires only the product for servicing. If any accessories are sent along with the product without prior instruction, XElectron will not be responsible for returning those accessories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DOORSTEP AVAILABILITY & DIRECT SHIPPING */}
        <section className="border-b border-slate-100 bg-[#f8fafc] py-14 sm:py-18">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#edf7ff] text-[#0a7ae6]">
                  <Truck className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Doorstep Pickup & Drop Availability
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Doorstep Pickup & Drop service is available across all PIN codes across India, subject to logistics partner serviceability in your area.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a7ae6]">
                  Full PAN-India Serviceable Network
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <MapPin className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Direct Service Center Shipment / Visit
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Customers may also choose to ship the product directly to our central Service Center or walk in if they prefer:
                </p>
                <address className="mt-3 text-xs not-italic leading-relaxed text-slate-700 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-900">XElectron Service Center</span><br />
                  Plot No.626, Ground Floor, Sector - 5, Vaishali, Ghaziabad, UP. PIN - 201010<br />
                  <span className="text-slate-500">Contact: 0120-4213337 / 9311136520</span>
                </address>
              </div>
            </div>

            {/* BOTTOM CALLOUT ACTION */}
            <div className="mt-10 rounded-2xl bg-[#071a38] p-8 text-white sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                    Get Started Today
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl text-white">
                    Need your product serviced or replaced?
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Submit your service request online with your serial number and pickup address, or reach out to our Customer Care team.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/repair-replacement"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0a7ae6] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-blue-600 active:scale-95"
                  >
                    Submit Service Request <ChevronRight className="size-3.5" />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition hover:bg-white/20"
                  >
                    Contact Support
                  </Link>
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
