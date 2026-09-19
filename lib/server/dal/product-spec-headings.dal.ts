import { db } from "@/lib/db";
import { DEFAULT_SPEC_HEADINGS, type SpecHeadings } from "@/lib/product-spec-headings";

export async function getSpecHeadings(): Promise<SpecHeadings> {
  // Tagged queries also work with clients cached before this model was generated.
  const settings: SpecHeadings[] = await db.$queryRaw`
    SELECT "design_heading" AS "designHeading", "connectivity_heading" AS "connectivityHeading"
    FROM "product_spec_settings" WHERE "id" = 'default'
  `;
  return settings[0] ?? DEFAULT_SPEC_HEADINGS;
}

export async function saveSpecHeadings(changes: Partial<SpecHeadings>) {
  if (!Object.keys(changes).length) return;
  await db.$executeRaw`
    INSERT INTO "product_spec_settings" ("id", "design_heading", "connectivity_heading")
    VALUES ('default',
      ${changes.designHeading ?? DEFAULT_SPEC_HEADINGS.designHeading},
      ${changes.connectivityHeading ?? DEFAULT_SPEC_HEADINGS.connectivityHeading})
    ON CONFLICT ("id") DO UPDATE SET
      "design_heading" = COALESCE(${changes.designHeading ?? null}::text, "product_spec_settings"."design_heading"),
      "connectivity_heading" = COALESCE(${changes.connectivityHeading ?? null}::text, "product_spec_settings"."connectivity_heading")
  `;
}
