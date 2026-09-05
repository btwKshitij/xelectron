import PolicyPage from "@/components/legal/policy-page";

export default function TermsOfUsePage() {
  return <PolicyPage eyebrow="Legal" title="Terms of use" intro="These terms apply to your use of the XElectron website, its content, and the services made available through it." sections={[
    { title: "Using this website", content: "Use this website only for lawful purposes and provide accurate information when you create an account, place an order, or submit a support request. Do not interfere with the website or attempt unauthorised access." },
    { title: "Products and availability", content: "Product information, prices, offers, and availability may change without notice. We work to keep information accurate, but errors may occasionally occur. We may correct an error or cancel an affected order where permitted." },
    { title: "Orders and payments", content: "An order is accepted only after we confirm it. Payment processing is handled through our approved providers. Delivery timelines and charges, where applicable, are shown during checkout or communicated with your order." },
    { title: "Content and intellectual property", content: "The XElectron name, logos, product content, images, and website materials belong to XElectron or its licensors. You may not copy, reuse, or distribute them without written permission." },
    { title: "Support and warranty", content: "Warranty and repair services are governed by the applicable product warranty terms. These website terms do not replace the written warranty supplied with an eligible product." },
  ]} />;
}
