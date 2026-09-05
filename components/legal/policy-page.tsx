import { CheckCircle2, FileText } from "lucide-react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

export type PolicySection = {
  title: string;
  content: string;
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: PolicySection[];
};

export default function PolicyPage({ eyebrow, title, intro, sections }: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <Navbar />

      <section className="border-b border-[#0a7ae6]/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a7ae6]">
            <FileText className="size-3.5" /> {eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[#071a38] sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{intro}</p>
          <p className="mt-5 text-xs font-medium text-slate-400">Last updated: 31 August 2026</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-7 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0a7ae6]">On this page</p>
            <nav className="mt-3 grid gap-1">
              {sections.map((section) => (
                <a key={section.title} href={`#${section.title.replaceAll(" ", "-").toLowerCase()}`} className="rounded-lg px-2.5 py-2 text-sm text-slate-600 transition hover:bg-[#edf7ff] hover:text-[#0a7ae6]">
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="grid gap-4">
          {sections.map((section) => (
            <article key={section.title} id={section.title.replaceAll(" ", "-").toLowerCase()} className="scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#edf7ff] text-[#0a7ae6]"><CheckCircle2 className="size-4" /></span>
                <div>
                  <h2 className="text-base font-bold text-[#071a38]">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.content}</p>
                </div>
              </div>
            </article>
          ))}
          <div className="rounded-2xl bg-[#071a38] p-6 text-white sm:p-7">
            <p className="text-base font-bold">Questions about this policy?</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">Contact XElectron Customer Care at <a href="mailto:customercare@xelectron.com" className="font-semibold text-sky-300 hover:text-white">customercare@xelectron.com</a> or call <a href="tel:8527312304" className="font-semibold text-sky-300 hover:text-white">8527312304</a>.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
