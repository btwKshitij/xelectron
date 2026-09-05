import PolicyPage from "@/components/legal/policy-page";

export default function PrivacyPolicyPage() {
  return <PolicyPage eyebrow="Privacy" title="Privacy policy" intro="This policy explains how XElectron collects, uses, and protects information when you visit our website, make a purchase, or request support." sections={[
    { title: "Information we collect", content: "We collect details you provide, such as your name, phone number, email address, delivery address, order details, and service-request information. We may also collect basic technical information needed to operate and secure the website." },
    { title: "How we use information", content: "We use your information to process orders, deliver products, provide repairs and warranty support, respond to enquiries, prevent fraud, and improve our products and services." },
    { title: "When information is shared", content: "We share information only when needed to provide a service, such as with delivery partners, payment providers, authorised service teams, or where required by law. We do not sell personal information." },
    { title: "Security and retention", content: "We use reasonable safeguards to protect information and keep it only for as long as needed for the purposes described in this policy, including legal, accounting, and service obligations." },
    { title: "Your rights", content: "You may contact us to request access to, correction of, or deletion of eligible personal information. Some records may need to be retained where required by law or for legitimate business purposes." },
  ]} />;
}
