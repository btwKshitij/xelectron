import Link from "next/link";

export type FooterLink = {
  label: string;
  href: string;
};

// Easily add, modify, or remove links as per your convenience
export const productLinks: FooterLink[] = [
  { label: "Speaker", href: "/shop" },
  { label: "Home Speaker", href: "/shop" },
  { label: "Sound Bar", href: "/shop" },
  { label: "Portable PA", href: "/shop" },
];

export const customerServiceLinks: FooterLink[] = [
  { label: "Troubleshooting", href: "/troubleshooting" },
  { label: "Repair & Replacement", href: "/repair-replacement" },
  { label: "Order Tracking", href: "/orders" },
  { label: "Warranty Registration", href: "/warranty" },
  { label: "Warranty Terms & Conditions", href: "/warranty-terms" },
  { label: "Contact Us", href: "/contact" },
];

export const companyLinks: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Find a Store", href: "/find-a-store" },
  { label: "Careers", href: "/careers" },
];

export const policyLinks: FooterLink[] = [
  { label: "Your privacy choices", href: "/privacy-choices" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Warranty Terms & Conditions", href: "/warranty-terms" },
];

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: FooterLink[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.05em] text-white">
        {title}
      </h3>
      <ul className="mt-3.5 space-y-2 text-xs sm:text-sm uppercase leading-5 tracking-[0.01em] text-white/90 font-normal sm:mt-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-white hover:underline underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-transparent px-0 sm:px-[20px] pt-0 sm:pt-4 pb-0 w-full overflow-hidden">
      {/* CHARCOAL DARK GRAY FOOTER CARD WITH TOP ROUNDED CORNERS ON DESKTOP */}
      <div className="mx-auto flex max-w-[1600px] flex-col rounded-none sm:rounded-t-[20px] bg-[#18191c] border-t sm:border-x border-slate-800/60 px-4 pt-8 pb-6 text-white shadow-2xl sm:px-8 sm:pt-10 sm:pb-8 lg:px-12 lg:pt-12 lg:pb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-8 lg:flex lg:gap-16 xl:gap-20">
            <FooterColumn title="Product" links={productLinks} className="col-span-1" />
            <FooterColumn title="Our Company" links={companyLinks} className="col-span-1 sm:order-3" />
            <FooterColumn title="Customer Service" links={customerServiceLinks} className="col-span-2 sm:col-span-1 sm:order-2" />
          </div>

          {/* Official Contact Info */}
          <div className="text-xs sm:text-sm text-white/90 space-y-2 border-t lg:border-t-0 border-slate-800/80 pt-5 lg:pt-0 max-w-md font-normal">
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.05em] text-white">
              XElectron Technologies Pvt. Ltd.
            </h3>
            <p className="leading-relaxed text-white/90">
              2417, Tower A, The Corenthum, Sector – 62, Noida – 201301.
            </p>
            <p>
              <span className="text-white font-medium">Customer Care:</span>{" "}
              <a href="tel:8527312304" className="text-white/90 hover:text-white transition underline-offset-2 hover:underline">8527312304</a> /{" "}
              <a href="tel:01204550655" className="text-white/90 hover:text-white transition underline-offset-2 hover:underline">0120-4550655</a>
            </p>
            <p>
              <span className="text-white font-medium">Sales:</span>{" "}
              <a href="tel:9870293008" className="text-white/90 hover:text-white transition underline-offset-2 hover:underline">9870293008</a>
            </p>
            <p>
              <span className="text-white font-medium">Email:</span>{" "}
              <a href="mailto:customercare@xelectron.com" className="text-white/90 hover:text-white transition underline-offset-2 hover:underline">customercare@xelectron.com</a>
            </p>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR (WHITE BACKGROUND WITH CLEAN REDUCED FONT WEIGHT) */}
        <div className="order-2 mt-7 flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-xl sm:rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm sm:px-6 sm:py-3.5 lg:px-8 lg:order-3 text-center sm:text-left">
          <div className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 sm:text-[18px] lg:text-[22px]">
            XElectron
          </div>
          <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 sm:text-[10px] lg:text-[11px]">
            © MADE BY XELECTRON 2026
          </p>
        </div>

        {/* POLICY LINKS WITH FLEX-WRAP TO PREVENT HORIZONTAL CUTOFF ON PHONES */}
        <ul className="order-3 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[10px] sm:text-[11px] lg:text-[12px] font-medium uppercase tracking-[0.02em] text-white/80 sm:mt-4 sm:gap-x-6 lg:order-2 lg:mt-6 lg:justify-end lg:pr-2">
          {policyLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="transition-colors hover:text-white hover:underline underline-offset-2">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
