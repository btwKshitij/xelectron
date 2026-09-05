import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Leaf,
  GraduationCap,
  Briefcase,
  Home,
  Building2,
  Layers,
  Compass,
  Zap,
  TrendingUp,
  Globe2,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | XElectron Official Company Profile",
  description:
    "Founded in 2011, XElectron is one of India's fastest-growing homegrown consumer electronics brands, bringing world-class projectors, smart TVs, digital frames, and display solutions to Indian homes and businesses.",
};

const STATS = [
  { value: "2011", label: "Founded in India", description: "14+ Years of Innovation" },
  { value: "100+", label: "Products Launched", description: "Across Consumer Tech Categories" },
  { value: "1st", label: "Touch & Wi-Fi Photo Frame", description: "Pioneered in Indian Market" },
  { value: "Pan-India", label: "Trusted Presence", description: "Homes, Classrooms & Offices" },
];

const PRODUCT_CATEGORIES = [
  {
    title: "Smart Projectors",
    subtitle: "Android & Google TV Cinema Projectors",
    description: "Immersive 4K-supported theater projection with auto-focus, keystone correction, and smart OS for living rooms, offices, and classrooms.",
    image: "/category-projector.png",
    tag: "Flagship Category",
    slug: "projectors",
  },
  {
    title: "Digital Photo Frames",
    subtitle: "Touch Screen, Wi-Fi & IPS Displays",
    description: "India's first smart cloud frames enabling families across the world to share and preserve memories in real time.",
    image: "/category-frame.png",
    tag: "Pioneering Innovation",
    slug: "digital-photo-frames",
  },
  {
    title: "LED Televisions & Smart Displays",
    subtitle: "Vibrant Visuals & Smart OS",
    description: "Cinema-grade 4K UHD and Full HD smart TVs engineered for rich contrast, immersive audio, and seamless streaming.",
    image: "/category-tv.png",
    tag: "Home Entertainment",
    slug: "tv",
  },
  {
    title: "Portable Monitors & Accessories",
    subtitle: "Flexible Displays for Modern Workflows",
    description: "Ultra-slim plug-and-play USB-C monitors & display solutions empowering professionals, coders, and creators on the move.",
    image: "/category-monitor.png",
    tag: "Workplace & Productivity",
    slug: "portable-monitors",
  },
];

const PHILOSOPHY_POINTS = [
  {
    title: "User-Friendly Design",
    desc: "Intuitive technology that feels natural from the very first interaction without unnecessary complexity.",
  },
  {
    title: "Reliable Performance",
    desc: "Engineered with high-grade components tested for dependable long-term everyday performance.",
  },
  {
    title: "Contemporary Aesthetics",
    desc: "Sleek, modern styling that seamlessly complements modern Indian homes, studios, and offices.",
  },
  {
    title: "Smart Convenience",
    desc: "Connected features like Wi-Fi, wireless casting, Android OS, and motion sensors that simplify daily life.",
  },
  {
    title: "Affordable Pricing",
    desc: "Delivering international quality standards at fair, accessible pricing without compromising quality.",
  },
  {
    title: "Long-Term Value",
    desc: "Energy-efficient architectures and robust build quality ensuring lasting customer satisfaction and durability.",
  },
];

const DESIGNED_FOR_INDIA_PILLARS = [
  {
    icon: Zap,
    title: "Power & Energy Efficiency",
    description: "Engineered to withstand fluctuating power environments while optimizing electricity consumption.",
  },
  {
    icon: ShieldCheck,
    title: "Built-In Durability",
    description: "Rugged internal components and robust thermal management suited for Indian ambient operating conditions.",
  },
  {
    icon: Globe2,
    title: "Ease of Use & Connectivity",
    description: "Hassle-free setup, versatile multi-port inputs, wireless casting, and multilingual intuitive interfaces.",
  },
  {
    icon: TrendingUp,
    title: "Accessible Affordability",
    description: "Eliminating the premium price barrier to make cutting-edge consumer electronics available for everyone.",
  },
];

const AUDIENCE_SECTORS = [
  {
    icon: Home,
    title: "Families & Homes",
    description:
      "Transforming living rooms into private theaters with immersive projectors & smart TVs, and preserving precious memories through cloud-connected digital photo frames.",
  },
  {
    icon: Briefcase,
    title: "Professionals & Creators",
    description:
      "Empowering remote workers, creators, coders, and corporate teams with flexible dual-screen portable monitors and presentation solutions.",
  },
  {
    icon: GraduationCap,
    title: "Education & Institutions",
    description:
      "Supporting modern interactive learning environments with high-lumen, dependable classroom projection displays and visual solutions.",
  },
  {
    icon: Building2,
    title: "Businesses & Enterprises",
    description:
      "Leveraging high-reliability displays and projectors for dynamic boardroom presentations, digital signage, collaboration, and client engagement.",
  },
];

const BRAND_PROMISES = [
  { label: "Innovation with Purpose", desc: "Every product begins with how technology can genuinely improve everyday life." },
  { label: "Customer-First Thinking", desc: "Active listening, feedback loops, and customer insights shape our product roadmap." },
  { label: "Quality You Can Trust", desc: "Stringent testing benchmarks and months of refinement before reaching consumers." },
  { label: "Technology Made Accessible", desc: "Bridging cutting-edge global innovation with Indian affordability." },
  { label: "Value Without Compromise", desc: "Fair pricing paired with uncompromising build quality and performance." },
  { label: "Continuous Improvement", desc: "Constantly enhancing features, design, and after-sales customer experiences." },
  { label: "Responsible Growth", desc: "Energy-efficient architectures and sustainable design for future generations." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-[#0a7ae6] selection:text-white">
      <Navbar />

      {/* HERO SECTION WITH TECHNICAL GRID */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-16 sm:pt-24 sm:pb-24">
        {/* Technical Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_60%,transparent_100%)] pointer-events-none opacity-80" />
        
        {/* Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(10,122,230,0.08),transparent_70%)] pointer-events-none" />

        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0a7ae6] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#0a7ae6]" />
              </span>
              <span>Founded in 2011 • 14+ Years of Tech Excellence</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.15]">
              Making Global Innovation <br className="hidden sm:inline" />
              <span className="text-[#0a7ae6]">Accessible & Relevant</span> for India
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Technology has become an integral part of the way we live, work, learn, and connect. At XElectron, we believe innovation should not be a privilege reserved for a few—it should be accessible to everyone. Since 2011, we have engineered world-class consumer electronics combining advanced technology, dependable quality, and exceptional value.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-xs font-semibold text-white transition hover:bg-[#0a7ae6] shadow-xs active:scale-95"
              >
                Explore Product Ecosystem <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 shadow-2xs"
              >
                Connect With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-10 sm:py-12">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-2xl sm:text-3xl font-bold text-[#0a7ae6] tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-900">{stat.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY & JOURNEY */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                <Compass className="size-3.5" /> Our Journey
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
                Bridging the Gap Between Cutting-Edge Technology & Indian Affordability
              </h2>
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Every great journey begins with a challenge. For us, that challenge was the gap between cutting-edge technology and affordability. While premium global products often remained beyond the reach of many Indian consumers, there was an increasing demand for innovative electronics that offered quality without compromising on value.
                </p>
                <p>
                  Recognising this opportunity, XElectron set out to create products that delivered international standards while addressing the unique needs of Indian users. From the very beginning, our focus has been on understanding consumer behaviour, anticipating technological trends, and developing products that make everyday experiences more connected, convenient, and enjoyable.
                </p>
                <p>
                  Over the last 14 years, XElectron has grown from a homegrown technology venture into one of India’s fastest-growing consumer electronics brands, introducing more than 100 products across diverse categories and earning the trust of thousands of customers nationwide.
                </p>
              </div>

              {/* Local Understanding Highlights */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Quality Without Compromise</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Rigorous multi-stage component testing & quality benchmarks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <HeartHandshake className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Customer-First Philosophy</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Real user insights directly influence future product roadmaps.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Landmark Milestone Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
                {/* Subtle light effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(10,122,230,0.2),transparent_70%)] pointer-events-none" />

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a7ae6]/20 border border-[#0a7ae6]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  <Sparkles className="size-3" /> Defining Milestone
                </span>

                <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white leading-snug">
                  India&apos;s First Smart Digital Photo Frame
                </h3>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  One of the hallmark milestones in our innovation roadmap was introducing India’s first Touch Screen Digital Photo Frame with Wi-Fi connectivity, Motion Sensors, and vibrant IPS Display technology—a product that reimagined how families preserve and share memories in the digital age.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#0a7ae6] shrink-0" />
                    <span>Instant Cloud Sharing & Family Memory Preservation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#0a7ae6] shrink-0" />
                    <span>Intelligent Motion Sensor Energy Saving</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-[#0a7ae6] shrink-0" />
                    <span>Intuitive Multi-Touch Interface with IPS Clarity</span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Reimagining connected living</span>
                  <span className="font-bold text-sky-400">XElectron Innovation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND MANIFESTO CALLOUT (PURPOSE-DRIVEN EMBEDDED STATEMENT) */}
      <section className="py-12 sm:py-16 bg-slate-50/70 border-y border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 lg:p-14 shadow-xs overflow-hidden">
            {/* Subtle decorative quote background */}
            <Quote className="absolute -bottom-6 -right-6 size-48 text-slate-100/70 pointer-events-none rotate-12" />
            
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0a7ae6] mb-5">
                <Sparkles className="size-3.5" /> Our Mission & Purpose
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-[1.25]">
                &ldquo;We don&apos;t just build electronics—we create technology that fits seamlessly into modern lives, empowers everyday moments, and helps shape a smarter tomorrow.&rdquo;
              </h2>
              
              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                At XElectron, technology is more than just hardware and circuits. It is about creating smarter, intuitive experiences that enrich lives, connect families across distances, foster creativity, and make the benefits of global technology accessible to every Indian home and business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGNED FOR INDIA SECTION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <Globe2 className="size-3.5" /> Tailored For Indian Needs
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Designed for India
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              India is one of the world&apos;s fastest-growing digital economies. Indian users seek performance, durability, simplicity, and affordability simultaneously. XElectron is proudly built around these expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESIGNED_FOR_INDIA_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-2xs hover:shadow-md hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6] shadow-2xs mb-4">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{pillar.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT ECOSYSTEM & PORTFOLIO */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-y border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <Layers className="size-3.5" /> Product Portfolio
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              A Growing Portfolio for Modern Lifestyles
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Serving diverse personal, professional, and institutional requirements across Smart Projectors, Android & Google TV Projectors, Digital Photo Frames, Portable Monitors, and Smart LED Displays.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <div>
                  {/* Category Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                    />
                  </div>

                  <span className="mt-4 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {cat.tag}
                  </span>

                  <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#0a7ae6] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#0a7ae6] mt-0.5">{cat.subtitle}</p>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    href={`/shop?filter=${encodeURIComponent(cat.slug)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-[#0a7ae6] transition group/link"
                  >
                    <span>Explore Models</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT DEVELOPMENT PHILOSOPHY */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <Cpu className="size-3.5" /> Development Philosophy
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Innovation That Makes Everyday Better
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Innovation at XElectron is never pursued for its own sake. Every product begins with a simple question: How can technology improve everyday life?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PHILOSOPHY_POINTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6] shadow-2xs">
                  <CheckCircle2 className="size-4.5" />
                </div>
                <h3 className="mt-4 text-sm sm:text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY & CUSTOMER FIRST DUO SECTION */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quality Box */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0a7ae6] shadow-2xs mb-5">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Quality Without Compromise
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Quality is not just a manufacturing standard—it is a commitment we make to every customer. From product design and sourcing to testing and after-sales support, every stage follows stringent quality benchmarks.
                </p>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every product launch represents months of product refinement, rigorous testing, and quality validation before reaching consumers.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#0a7ae6]">
                <CheckCircle2 className="size-4" /> Dependable Long-Term Performance
              </div>
            </div>

            {/* Customer First Box */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-2xs mb-5">
                  <HeartHandshake className="size-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Customer First, Always
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Technology succeeds only when it genuinely improves people&apos;s lives. We actively listen to customer feedback, monitor market trends, and continuously enhance our products based on real user experiences.
                </p>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Beyond the product itself, we remain committed to delivering dependable after-sales support, creating positive ownership experiences, and building lasting relationships.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-4" /> Pan-India Service & Responsiveness
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EMPOWERING HOMES, BUSINESSES & INSTITUTIONS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <Users className="size-3.5" /> Pan-India Impact
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Empowering Homes, Businesses & Institutions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Addressing the technology requirements across personal entertainment, professional workflows, learning environments, and commercial enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {AUDIENCE_SECTORS.map((sector) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.title}
                  className="flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-slate-50/40 p-7 shadow-2xs hover:shadow-md hover:bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                    <Icon className="size-6 text-[#0a7ae6]" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{sector.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{sector.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY & RESPONSIBLE INNOVATION */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0a7ae6] via-[#075eb2] to-[#043d78] p-8 sm:p-12 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
            {/* Background lighting accents */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                <Leaf className="size-3.5 text-emerald-300" /> Sustainability Through Responsible Innovation
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Responsible Engineering for a Sustainable Future
              </h2>
              <p className="text-xs sm:text-sm text-blue-50/90 leading-relaxed">
                As technology advances, environmental responsibility becomes increasingly important. At XElectron, we recognise that innovation must go hand in hand with sustainability. We strive to develop products that are energy-efficient, durable, and designed for long-term use, helping customers reduce energy consumption without compromising on performance.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/15 backdrop-blur-xs">
                  <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                  <span className="font-medium">Energy-Efficient Architectures</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/15 backdrop-blur-xs">
                  <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                  <span className="font-medium">Extended Product Lifecycles</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/15 backdrop-blur-xs">
                  <CheckCircle2 className="size-4 text-emerald-300 shrink-0" />
                  <span className="font-medium">Smart Low-Power Modes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VISION FOR THE FUTURE */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                <TrendingUp className="size-3.5" /> Looking Ahead
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Our Vision for the Future
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The consumer electronics landscape is evolving faster than ever before. Artificial intelligence, smart connectivity, immersive displays, and intelligent ecosystems are transforming how people interact with technology.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                At XElectron, we see these changes as opportunities to innovate further. We will continue investing in research, product development, and emerging technologies that enhance everyday experiences while maintaining the affordability that defines our brand.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6] mb-3">
                  <Cpu className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">AI & Smart Ecosystems</h4>
                <p className="mt-1 text-xs text-slate-500">Integrating smart OS, voice controls, and automated calibration across devices.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6] mb-3">
                  <Sparkles className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Immersive Next-Gen Displays</h4>
                <p className="mt-1 text-xs text-slate-500">Pushing the boundaries of 4K projection, high-contrast IPS panels, and color accuracy.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6] mb-3">
                  <Globe2 className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Democratizing Global Tech</h4>
                <p className="mt-1 text-xs text-slate-500">Ensuring cutting-edge innovations are immediately accessible to Indian consumers.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 shadow-2xs">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6] mb-3">
                  <Award className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Trusted Indian Brand</h4>
                <p className="mt-1 text-xs text-slate-500">Aspiring to inspire confidence through consistent product reliability and support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE XELECTRON PROMISE */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
              <Award className="size-3.5" /> Our Guiding Principles
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              The XElectron Promise
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Every XElectron product reflects the foundational values that have guided our growth since 2011.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {BRAND_PROMISES.map((promise) => (
              <div
                key={promise.label}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 text-[#0a7ae6] flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#0a7ae6] shrink-0" />
                  {promise.label}
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{promise.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLEAN & ELEGANT BOTTOM CTA CONTAINER */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/60 p-8 sm:p-14 text-center shadow-xs overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(10,122,230,0.06),transparent_70%)] pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <Sparkles className="size-3.5 text-[#0a7ae6]" /> Explore the Ecosystem
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                Experience Smarter Technology for Modern Living
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Discover our full lineup of Smart Projectors, Digital Photo Frames, Portable Monitors, and Smart TVs backed by Pan-India warranty and dedicated service support.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-xs font-bold text-white transition hover:bg-[#0a7ae6] shadow-xs active:scale-95"
                >
                  Browse All Products <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-2xs"
                >
                  Visit Experience Centers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
