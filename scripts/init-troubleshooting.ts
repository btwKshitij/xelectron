import "dotenv/config";
import { createPrismaClient } from "../lib/db";
import { defaultTroubleshootingContent } from "../lib/shared/troubleshooting";

const prisma = createPrismaClient();

async function main() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "troubleshooting_pages" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" JSONB NOT NULL,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await prisma.troubleshootingPage.upsert({
    where: { id: "default" },
    create: { id: "default", content: defaultTroubleshootingContent },
    update: {},
  });
  console.log("Troubleshooting content ready. Existing edits preserved.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
