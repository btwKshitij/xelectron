import "dotenv/config";
import { createPrismaClient } from "../lib/db";
const prisma = createPrismaClient();
prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "support_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)`.then(() => console.log("Support request inbox ready.")).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
