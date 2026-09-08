import { connection } from "next/server";
import TroubleshootingContentView from "@/components/troubleshooting/troubleshooting-content";
import { getTroubleshootingContent } from "@/lib/server/dal/troubleshooting.dal";

export default async function TroubleshootingPage() {
  await connection();
  return <TroubleshootingContentView content={await getTroubleshootingContent()} />;
}
