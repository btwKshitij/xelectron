import { db } from "@/lib/db";

export async function getLatestLaunchIds(): Promise<string[] | null> {
  const rows: { productIds: string[] }[] = await db.$queryRaw`
    SELECT "product_ids" AS "productIds" FROM "latest_launch_settings" WHERE "id" = 'default'
  `;
  return rows[0]?.productIds ?? null;
}

export async function saveLatestLaunchIds(ids: string[]): Promise<void> {
  await db.$executeRaw`
    INSERT INTO "latest_launch_settings" ("id", "product_ids") VALUES ('default', ${JSON.stringify(ids)}::jsonb)
    ON CONFLICT ("id") DO UPDATE SET "product_ids" = EXCLUDED."product_ids"
  `;
}
