import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, FileText, Headphones, Mail, MapPin, Wrench } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

type ResourcePageProps = { kind: "manuals" | "firmware" };

export default function ResourcePage({ kind }: ResourcePageProps) {
  const manuals = kind === "manuals";
  const title = manuals ? "Downloads & manuals" : "Firmware updates";
  const Icon = manuals ? BookOpen : Cpu;
  const subject = manuals ? "Product manual request" : "Firmware support request";
  const body = manuals
    ? "Hello XElectron support, please help me find the manual for my device.\n\nProduct model: \nSerial number: \nWhat I need help with: "
    : "Hello XElectron support, please check whether an update is available for my device.\n\nProduct model: \nSerial number: \nCurrent software version: \nIssue or reason for update: ";
  const emailHref = `mailto:customercare@xelectron.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const preparation = manuals ? [
    ["Find your model", "Check the product label or packaging for the full model name."],
    ["Tell us what you need", "Let support know whether you need setup instructions, connection help, or a replacement manual."],
    ["Contact support", "Send your model details so the team can help you find the right documentation."],
  ] : [
    ["Identify your device", "Note the full model name and serial number from your product label."],
    ["Note your software version", "If your device displays a software version in its settings, include it with your request."],
    ["Request update guidance", "Describe the issue you are experiencing so support can advise on the appropriate next step."],
  ];
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <section className="border-b border-blue-100 bg-[#f0f6fd]">
        <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-xs text-slate-500"><Link href="/" className="hover:text-blue-600">Home</Link><span aria-hidden="true">/</span><span>Support</span><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0876d5]"><Icon className="size-4" aria-hidden="true" />Resources & downloads</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[44px]">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{manuals ? "Get help with setup, connections, and everyday use. Find the right documentation for your XElectron device." : "Get software support for your XElectron device. Check with our team for updates that match your exact model."}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <article className="rounded-2xl border border-slate-200 p-6 sm:p-8">
              <span className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6]"><Icon aria-hidden="true" className="size-6" /></span>
              <h2 className="text-xl font-semibold tracking-tight">{manuals ? "Need a manual for your device?" : "Check for an update"}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{manuals ? "Manuals are not currently listed for download on this page. Send your model details to our support team for help finding the correct guide." : "No firmware packages are currently listed on this page. Contact support to confirm availability and compatibility for your device."}</p>
              <a href={emailHref} className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#0a7ae6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0868c4]"><Mail aria-hidden="true" className="size-4" />{manuals ? "Request a manual" : "Ask about an update"}<ArrowRight aria-hidden="true" className="size-4" /></a>
              <p className="mt-3 text-xs text-slate-500">Opens your email app with a request you can complete.</p>
            </article>
            <div className="mt-9">
              <h2 className="text-lg font-semibold">Before you contact us</h2>
              <ol className="mt-5 space-y-5">
                {preparation.map(([heading, description], index) => <li key={heading} className="flex gap-4"><span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#0876d5]">{index + 1}</span><div><h3 className="text-sm font-semibold">{heading}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div></li>)}
              </ol>
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-6"><Headphones aria-hidden="true" className="mb-4 size-6 text-[#0a7ae6]" /><h2 className="font-semibold">A little help goes a long way.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Our support team can help you identify your device and find your next step.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0876d5]">Contact support<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
            <div className="rounded-2xl border border-slate-200 p-6"><h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">More resources</h2><div className="space-y-1">{[
              { href: "/troubleshooting", label: "Troubleshooting guide", icon: Wrench },
              { href: manuals ? "/firmware-updates" : "/downloads", label: manuals ? "Firmware updates" : "Downloads & manuals", icon: manuals ? Cpu : FileText },
              { href: "/service-centers", label: "Repair center locations", icon: MapPin },
            ].map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg py-3 text-sm text-slate-700 hover:text-[#0876d5]"><item.icon aria-hidden="true" className="size-4 shrink-0" /><span className="flex-1">{item.label}</span><ArrowRight aria-hidden="true" className="size-4" /></Link>)}</div></div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
