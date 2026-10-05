import { Suspense } from "react";
import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = {
  title: "Reset password | XElectron",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return <main className="min-h-screen bg-white"><Suspense fallback={<p role="status" className="p-12 text-center">Loading?</p>}><PasswordRecoveryForm mode="reset" /></Suspense></main>;
}
