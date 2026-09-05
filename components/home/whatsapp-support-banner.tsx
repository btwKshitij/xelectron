"use client";

export default function WhatsAppSupportBanner() {
  return (
    <section className="w-full bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-[440px] sm:max-w-[1400px]">
        <div className="group relative flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-5 sm:gap-6 rounded-[30px] sm:rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-5 sm:px-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] hover:border-emerald-200 transition-all duration-500">
          {/* LEFT / CENTER: ICON + TEXT */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-4.5 w-full sm:w-auto">
            {/* WHATSAPP APP ICON WITH ANIMATED LIVE RADAR DOT */}
            <div className="relative flex size-16 sm:size-13 shrink-0 items-center justify-center rounded-[22px] sm:rounded-2xl bg-[#25D366] text-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
              <svg className="size-8 sm:size-7 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              {/* LIVE RADAR GREEN DOT */}
              <span className="absolute -bottom-0.5 -right-0.5 flex size-4 sm:size-3.5 items-center justify-center rounded-full bg-white shadow-xs">
                <span className="absolute size-3 rounded-full bg-[#10b981] opacity-75 animate-ping" />
                <span className="relative size-2.5 sm:size-2 rounded-full bg-[#10b981]" />
              </span>
            </div>

            {/* TEXT LABELS */}
            <div>
              <h3 className="text-lg sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                <span className="block sm:inline">Have a question?</span>{" "}
                <span className="block sm:inline">Chat with us</span>
              </h3>
              <div className="mt-2 sm:mt-0.5 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 text-xs text-slate-500">
                <span className="font-extrabold text-[11px] uppercase text-[#10b981] tracking-wider">
                  LIVE
                </span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span>Chat support</span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span>Average reply in 30 mins</span>
              </div>
            </div>
          </div>

          {/* RIGHT / BOTTOM: MESSAGE SUPPORT CTA BUTTON */}
          <a
            href="https://wa.me/918527312304?text=Hi%20XElectron%2C%20I%20have%20a%20question%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto max-w-[240px] sm:max-w-none shrink-0 items-center justify-center rounded-full bg-[#27834e] hover:bg-[#1f6d40] px-7 py-3 sm:py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Message Support
          </a>
        </div>
      </div>
    </section>
  );
}

