import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Image from "next/image";
import {
  MapPin,
  Store,
  Building2,
  Wrench,
  Phone,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface StoreItem {
  id: string;
  badge: string;
  name: string;
  shortName: string;
  subtitle: string;
  address: string;
  landmark: string;
  phones: string[];
  timing: string;
  openDays: string;
  mapUrl: string;
  tags: string[];
  image: string;
  imageAlt: string;
  icon: typeof Store;
}

const STORES: StoreItem[] = [
  {
    id: "experience-center",
    badge: "Flagship Retail Showroom",
    name: "XElectron Experience Center",
    shortName: "Experience Center (Noida)",
    subtitle: "Showroom & 4K Cinema Demo Lounge",
    address: "LGF-22, Spectrum Metro Mall, Sector-75, Noida, Uttar Pradesh – 201307",
    landmark: "Near Sector 50 Metro Station (Aqua Line) / Lower Ground Floor Central Atrium",
    phones: ["+91 98702 93008"],
    timing: "01:00 PM – 09:00 PM",
    openDays: "Open Daily (7 Days)",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Spectrum+Metro+Mall+Sector+75+Noida",
    tags: ["Live 4K Laser Projector Demos", "ALR Ambient Light Screens", "Surround Sound Lounge", "Instant On-site Purchases"],
    image: "/stores/experience-center.jpg",
    imageAlt: "XElectron Flagship Home Cinema Experience Center and Showroom",
    icon: Store,
  },
  {
    id: "corporate-hq",
    badge: "Corporate Headquarters",
    name: "XElectron Technologies Pvt. Ltd.",
    shortName: "Corporate Office (Noida)",
    subtitle: "Corporate Administrative Office & B2B Desk",
    address: "2417, Tower A, The Corenthum, Sector-62, Noida, Uttar Pradesh – 201301",
    landmark: "Directly Opposite Noida Electronic City Metro Station (Blue Line)",
    phones: ["+91 120 4550655", "+91 98913 32304"],
    timing: "10:00 AM – 06:00 PM",
    openDays: "Monday to Saturday",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Corenthum+Sector+62+Noida",
    tags: ["B2B & Institutional Sales", "Authorized Dealership Inquiries", "Corporate Desk", "Administrative Offices"],
    image: "/stores/corporate-hq.jpg",
    imageAlt: "XElectron Corporate Headquarters in Sector 62 Noida",
    icon: Building2,
  },
  {
    id: "service-center",
    badge: "Authorized Technical Lab",
    name: "XElectron Technical Service Center",
    shortName: "Service & Repairs (Vaishali)",
    subtitle: "Official Diagnostics, Repairs & Warranty Hub",
    address: "Plot No. 626, Ground Floor, Sector-5, Vaishali, Ghaziabad, UP – 201010",
    landmark: "In front of Ramprastha Greens, Near Mohan Dhaba (7 min from Vaishali Metro)",
    phones: ["0120-4213337", "+91 96508 36754"],
    timing: "10:00 AM – 06:00 PM",
    openDays: "Monday to Saturday",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sector+5+Vaishali+Ghaziabad+Ram+Prashtha+Green",
    tags: ["Same-Day Diagnostics", "Official Warranty Claims", "Genuine Replacement Spares", "Firmware & Optical Care"],
    image: "/stores/service-center.jpg",
    imageAlt: "XElectron Authorized Technical Repair Center and Workshop",
    icon: Wrench,
  },
];

export default function FindAStorePage() {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <Navbar />

      {/* Header (Cohesive with Legal/Policy Page design) */}
      <section className="border-b border-[#0a7ae6]/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a7ae6]">
            <MapPin className="size-3.5" /> LOCATIONS & SERVICE HUBS
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[#071a38] sm:text-4xl">
            Choose the right XElectron location
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Visit our Noida experience centre for hands-on 4K projector demos, or get trusted help from our corporate headquarters and authorized service teams across Delhi-NCR.
          </p>
          <p className="mt-5 text-xs font-medium text-slate-400">
            Delhi-NCR Network • 3 Dedicated Locations • Mon – Sun Operating
          </p>
        </div>
      </section>

      {/* Main Section with Sticky Sidebar and Structured Cards */}
      <section className="mx-auto grid max-w-5xl gap-7 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sticky Left Navigation */}
        <aside className="lg:sticky lg:top-28 lg:h-fit space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0a7ae6]">
              On this page
            </p>
            <nav className="mt-3 grid gap-1">
              {STORES.map((store) => (
                <a
                  key={store.id}
                  href={`#${store.id}`}
                  className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#edf7ff] hover:text-[#0a7ae6]"
                >
                  {store.shortName}
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Help Card */}
          <div className="rounded-2xl border border-blue-100 bg-[#edf7ff]/70 p-4 shadow-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0a7ae6]">
              Need Directions?
            </p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Call our central helpline or connect on WhatsApp before your visit.
            </p>
            <div className="mt-3 space-y-2 border-t border-blue-200/50 pt-3 text-xs">
              <a
                href="tel:01204550655"
                className="flex items-center gap-2 font-bold text-[#071a38] transition hover:text-[#0a7ae6]"
              >
                <Phone className="size-3.5 text-[#0a7ae6]" />
                <span>0120-4550655</span>
              </a>
              <a
                href="https://wa.me/919870293008?text=Hi%20XElectron,%20I%20need%20store%20directions."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-emerald-700 transition hover:text-emerald-800"
              >
                <MessageSquare className="size-3.5 text-emerald-600" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Right Column: Structured Cards */}
        <div className="grid gap-6">
          {STORES.map((store) => {
            const StoreIcon = store.icon;

            return (
              <article
                key={store.id}
                id={store.id}
                className="scroll-mt-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300"
              >
                {/* Photo Showcase */}
                <div className="relative aspect-[16/8] w-full overflow-hidden bg-slate-900 sm:aspect-[16/7]">
                  <Image
                    src={store.image}
                    alt={store.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 720px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071a38]/80 via-[#071a38]/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs backdrop-blur-md">
                      <StoreIcon className="size-3 text-[#0a7ae6]" />
                      {store.badge}
                    </span>
                  </div>

                  {/* Open Days Pill */}
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3 py-1 text-[10px] font-bold text-white shadow-xs">
                      <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      {store.openDays}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-7">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0a7ae6]">
                      {store.subtitle}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#071a38] sm:text-2xl">
                      {store.name}
                    </h2>
                  </div>

                  {/* Key Fact Rows */}
                  <div className="mt-5 divide-y divide-slate-100 border-t border-b border-slate-100 text-xs sm:text-sm">
                    {/* Address Row */}
                    <div className="grid py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Address
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          {store.address}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {store.landmark}
                        </p>
                      </div>
                    </div>

                    {/* Operating Hours Row */}
                    <div className="grid py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Hours
                      </span>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="size-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {store.timing} ({store.openDays})
                        </span>
                      </div>
                    </div>

                    {/* Contact Row */}
                    <div className="grid py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        Contact
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <Phone className="size-3.5 text-[#0a7ae6] shrink-0" />
                        {store.phones.map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                            className="font-bold text-[#071a38] transition hover:text-[#0a7ae6]"
                          >
                            {phone}
                            {idx < store.phones.length - 1 && (
                              <span className="ml-2 text-slate-300">/</span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Services On-Site Row */}
                    <div className="grid py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                        On-Site
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {store.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#071a38] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0a7ae6]"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                    <a
                      href={`tel:${store.phones[0].replace(/[^+\d]/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Phone className="size-3.5 text-slate-500" />
                      <span>Call Center</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Bottom Assistance Banner (Matches Legal/Policy page footer) */}
          <div className="rounded-2xl bg-[#071a38] p-6 text-white sm:p-8">
            <p className="text-base font-bold sm:text-lg">
              Questions before visiting or want a virtual demo?
            </p>
            <p className="mt-1.5 text-xs sm:text-sm leading-6 text-slate-300">
              Contact XElectron Customer Care at{" "}
              <a
                href="mailto:customercare@xelectron.com"
                className="font-semibold text-sky-300 hover:text-white"
              >
                customercare@xelectron.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:01204550655"
                className="font-semibold text-sky-300 hover:text-white"
              >
                0120-4550655
              </a>
              . You can also chat directly with our specialists on{" "}
              <a
                href="https://wa.me/919870293008?text=Hi%20XElectron,%20I%20would%20like%20to%20know%20more%20about%20store%20visits."
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-300 hover:text-white underline underline-offset-2"
              >
                WhatsApp (+91 98702 93008)
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
