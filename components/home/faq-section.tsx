const faqs = [
  {
    question: "Which products are covered by warranty?",
    answer:
      "Most XElectron products include a manufacturer warranty. The exact coverage depends on the category, so check the product page or invoice for the warranty period.",
  },
  {
    question: "Do the products support easy returns?",
    answer:
      "Return eligibility depends on the seller policy and the item condition. If you receive a damaged or incorrect product, contact support with your order details as soon as possible.",
  },
  {
    question: "Can I connect these products to my phone or TV?",
    answer:
      "Yes. The featured products are built for simple connectivity across Bluetooth, Wi-Fi, USB, and HDMI depending on the model. Check the product specs for the exact connection options.",
  },
  {
    question: "How do I choose the right product for my setup?",
    answer:
      "Start with the space you have and the job you want the product to do. Use the product cards above to compare display size, brightness, audio, and connectivity before buying.",
  },
  {
    question: "Where can I get help after purchase?",
    answer:
      "You can use the support links in the navigation and footer, or reach out through the contact options on the site for warranty, setup, and service help.",
  },
];

export default function FaqSection() {
  return (
    <section className="bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,0.5fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="text-[13px] leading-6 text-slate-500 md:text-[15px]">
              Got questions?
              <br />
              Say less, we’ve got answers!
            </p>
          </div>

          <div className="text-left lg:text-right">
            <div className="inline-flex items-baseline gap-2 text-slate-900">
              <span className="font-serif text-[clamp(2.3rem,4.6vw,4.3rem)] leading-none tracking-[-0.08em]">
                FAQ’s
              </span>
              <span className="text-[clamp(1.3rem,2.4vw,2rem)] leading-none">↗</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group border-b border-slate-200"
              open={false}
            >
              <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-4 outline-none md:py-5 lg:py-5.5">
                <span className="text-left text-[clamp(0.9rem,1.35vw,1.3rem)] font-medium uppercase leading-[1.08] tracking-[-0.03em] text-slate-900 md:max-w-4xl">
                  {faq.question}
                </span>
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center text-slate-900 md:h-8 md:w-8">
                  <span className="text-[1.6rem] leading-none group-open:hidden">+</span>
                  <span className="hidden text-[1.6rem] leading-none group-open:inline">×</span>
                </span>
              </summary>
              <div className="pb-5 md:pb-6">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)]">
                  <div />
                  <p className="max-w-xl text-[14px] leading-7 text-slate-600 md:text-[15px] md:leading-8 lg:justify-self-end lg:text-[16px]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

