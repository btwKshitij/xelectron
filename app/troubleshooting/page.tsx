"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Wrench,
  Search,
  Tv,
  Wifi,
  Volume2,
  Sliders,
  ChevronDown,
  HelpCircle,
  PhoneCall,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { id: "projectors", name: "Smart Projectors", icon: Tv },
  { id: "tvs", name: "Smart TVs", icon: Tv },
  { id: "audio", name: "Soundbars & Speakers", icon: Volume2 },
  { id: "wifi", name: "WiFi & Bluetooth", icon: Wifi },
];

const GUIDES = [
  {
    category: "projectors",
    title: "Projector Displaying 'No Signal' via HDMI",
    steps: [
      "Ensure the HDMI cable is firmly connected to both the Projector and your Laptop/Console.",
      "Press the 'Source / Input' button on your XElectron remote and select HDMI 1 or HDMI 2.",
      "Check that your Laptop display settings are set to 'Duplicate' or 'Extend' (Windows Key + P).",
      "Restart the projector if the source signal is not detected automatically.",
    ],
  },
  {
    category: "projectors",
    title: "How to Adjust Auto-Focus & Keystone Correction",
    steps: [
      "Press the dedicated 'Focus' keys (+ / -) on the XElectron Bluetooth remote for razor-sharp clarity.",
      "Navigate to Settings > Projection Settings > Auto Keystone and enable 4D Automatic Keystone.",
      "Ensure the projector lens is free from dust or fingerprint smudges.",
    ],
  },
  {
    category: "wifi",
    title: "Projector or TV Cannot Connect to Home WiFi Network",
    steps: [
      "Go to Settings > Network & Internet and turn Wi-Fi OFF and back ON.",
      "Ensure your router is broadcasting on 2.4GHz or 5GHz band with standard WPA2 encryption.",
      "Forget the network and re-enter your Wi-Fi password carefully.",
      "If the issue persists, reboot your Wi-Fi router and XElectron device.",
    ],
  },
  {
    category: "audio",
    title: "No Sound Coming From Audio Speaker / Soundbar",
    steps: [
      "Verify the volume is turned up on both your Projector/TV and the external soundbar.",
      "If connected via AUX (3.5mm), ensure the cable is pushed in completely until it clicks.",
      "If connected via Optical or ARC, go to TV Sound Settings and switch output to 'PCM' or 'Optical Output'.",
      "Unpair and re-pair Bluetooth devices if audio lag or distortion occurs.",
    ],
  },
  {
    category: "tvs",
    title: "XElectron Remote Control Not Responding",
    steps: [
      "Check and replace the AAA batteries in your remote control.",
      "To pair Bluetooth Remote: Hold down the 'Home' and 'Back' buttons together for 5 seconds near the TV/Projector.",
      "Ensure there are no large physical obstructions in front of the IR sensor.",
    ],
  },
];

export default function TroubleshootingPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [openGuide, setOpenGuide] = useState<number | null>(0);

  const filteredGuides = GUIDES.filter((guide) => {
    const matchesCat = selectedCat === "all" || guide.category === selectedCat;
    const matchesSearch =
      !search.trim() ||
      guide.title.toLowerCase().includes(search.toLowerCase()) ||
      guide.steps.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900">
      <Navbar />

      {/* HERO HEADER */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-[#38bdf8] backdrop-blur-md">
            <Wrench className="h-3.5 w-3.5" /> Self-Service Support
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Troubleshooting & Technical Guide
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-300">
            Find instant step-by-step solutions for HDMI signals, Wi-Fi connectivity, audio settings, and remote pairing.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic (e.g. HDMI, WiFi, Sound, Focus, Remote)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/10 pl-12 pr-4 py-3 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md focus:border-[#38bdf8] focus:bg-white/15 transition"
            />
          </div>
        </div>
      </section>

      {/* GUIDES SECTION */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          {/* CATEGORY FILTER PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCat === "all" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              All Topics
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCat === cat.id ? "bg-[#0a7ae6] text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* GUIDES ACCORDION */}
          <div className="space-y-4">
            {filteredGuides.map((guide, index) => {
              const isOpen = openGuide === index;
              return (
                <div
                  key={guide.title}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setOpenGuide(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-[#0a7ae6] transition cursor-pointer"
                  >
                    <span>{guide.title}</span>
                    <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-[#0a7ae6]" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 pt-3 border-t border-slate-100 bg-slate-50/50">
                      <ol className="space-y-3 list-decimal list-inside text-xs text-slate-700 leading-relaxed font-medium">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGuides.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <HelpCircle className="mx-auto size-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No troubleshooting guides found</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or contact our support team.</p>
              </div>
            )}
          </div>

          {/* STILL NEED HELP CALLOUT */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white">Still having trouble with your device?</h3>
              <p className="text-xs text-slate-300 mt-1">Contact our Technical Service Center at Vaishali Ghaziabad or raise a repair request.</p>
            </div>
            <Link prefetch={false}
              href="/repair-replacement"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-xs font-bold text-slate-900 hover:bg-slate-100 transition shrink-0"
            >
              Request Repair / Replacement <ArrowRight className="size-4 text-[#0a7ae6]" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
