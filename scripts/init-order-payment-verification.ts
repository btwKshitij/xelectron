import "dotenv/config";
import { createPrismaClient } from "../lib/db";
const prisma = createPrismaClient();
prisma.$executeRaw`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_verified" BOOLEAN NOT NULL DEFAULT false`
  .then(() => console.log("Payment verification field ready. Historical payments require reconciliation."))
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
