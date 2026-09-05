import PolicyPage from "@/components/legal/policy-page";

export default function WarrantyTermsPage() {
  return <PolicyPage eyebrow="Warranty" title="Warranty terms & conditions" intro="A clear summary of XElectron product coverage, replacements, and authorised repair support." sections={[
    { title: "Warranty coverage", content: "Eligible XElectron products include a one-year manufacturer warranty from the date of purchase. Keep your invoice and product serial number available whenever you contact us." },
    { title: "7-day replacement", content: "For verified transit damage or hardware defects reported within seven days of delivery, we assess the request and arrange a replacement or pickup where applicable." },
    { title: "Authorised repairs", content: "During the warranty period, authorised technical repairs and eligible replacement parts are provided after product assessment. Service availability may depend on the product, location, and reported issue." },
    { title: "What is not covered", content: "The warranty does not cover accidental damage, liquid exposure, misuse, unauthorised repairs, altered serial numbers, normal cosmetic wear, or use outside product instructions." },
    { title: "Your responsibilities", content: "Provide accurate ownership and purchase details, back up personal content before handing over a device, and remove accessories that are not required for diagnosis or repair." },
  ]} />;
}
