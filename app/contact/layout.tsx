import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Customer Support | XElectron",
  description: "Contact XElectron for product questions, customer support, warranty assistance and business enquiries. Find the right team and contact details.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
