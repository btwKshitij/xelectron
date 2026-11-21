import ResourcePage from "@/components/support/resource-page";

export const metadata = {
  alternates: { canonical: "/firmware-updates" }, title: "Firmware Updates | XElectron", description: "Contact XElectron support for firmware availability and guidance for your device." };

export default function Page() {
  return <ResourcePage kind="firmware" />;
}
