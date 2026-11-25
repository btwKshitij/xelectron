export const metadata = {
  title: "Projector Troubleshooting & Setup Help | XElectron",
  description: "Troubleshoot XElectron projector HDMI signal, Wi-Fi, sound, remote control, focus and keystone issues with our support guides.",
  alternates: { canonical: "/troubleshooting" },
};

import { connection } from "next/server";
import TroubleshootingContentView from "@/components/troubleshooting/troubleshooting-content";
import { getTroubleshootingContent } from "@/lib/server/dal/troubleshooting.dal";

export default async function TroubleshootingPage() {
  await connection();
  return <TroubleshootingContentView content={await getTroubleshootingContent()} />;
}
