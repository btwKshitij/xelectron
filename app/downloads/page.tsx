import ResourcePage from "@/components/support/resource-page";

export const metadata = {
  alternates: { canonical: "/downloads" }, title: "Downloads & Manuals | XElectron", description: "Get product documentation and manual support for your XElectron device." };

export default function Page() {
  return <ResourcePage kind="manuals" />;
}
