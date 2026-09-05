import PolicyPage from "@/components/legal/policy-page";

export default function PrivacyChoicesPage() {
  return <PolicyPage eyebrow="Privacy" title="Your privacy choices" intro="Understand the choices available to you when you use the XElectron website and contact our team." sections={[
    { title: "Marketing communications", content: "You can opt out of promotional emails at any time by using the unsubscribe link in the email or by contacting Customer Care. We may still send important service, order, and account messages." },
    { title: "Cookies and browser controls", content: "Your browser lets you block or delete cookies. Some website features may not work as expected if you disable cookies that are needed for shopping, account access, or security." },
    { title: "Access or update your information", content: "You can ask us to review, correct, or update personal information you have shared with XElectron. Include the contact details you used with us so we can verify the request." },
    { title: "Contact us", content: "For a privacy request, email customercare@xelectron.com with the subject line Privacy Request. We will respond after verifying your identity where required." },
  ]} />;
}
