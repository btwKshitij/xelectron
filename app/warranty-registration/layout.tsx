import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Product Warranty | XElectron",
  description: "Register your XElectron product warranty online with your purchase and product details.",
  alternates: { canonical: "/warranty-registration" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
