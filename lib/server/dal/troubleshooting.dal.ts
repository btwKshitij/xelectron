import "server-only";
import { db } from "@/lib/db";
import { defaultTroubleshootingContent, troubleshootingSchema } from "@/lib/shared/troubleshooting";

export async function getTroubleshootingContent() {
  const page = await db.troubleshootingPage.findUnique({ where: { id: "default" } });
  return page ? troubleshootingSchema.parse(page.content) : defaultTroubleshootingContent;
}
