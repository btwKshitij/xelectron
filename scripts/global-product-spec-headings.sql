-- Keep this setup repeatable for both existing and fresh databases.
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "design_heading" TEXT,
  ADD COLUMN IF NOT EXISTS "connectivity_heading" TEXT;

ALTER TABLE "product_specs"
  ADD COLUMN IF NOT EXISTS "section" TEXT;

CREATE TABLE IF NOT EXISTS "product_spec_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "design_heading" TEXT NOT NULL,
  "connectivity_heading" TEXT NOT NULL
);

INSERT INTO "product_spec_settings" ("id", "design_heading", "connectivity_heading")
VALUES (
  'default',
  COALESCE((SELECT NULLIF(TRIM("design_heading"), '') FROM "products" WHERE NULLIF(TRIM("design_heading"), '') IS NOT NULL ORDER BY "updated_at" DESC, "id" LIMIT 1), 'Design, Display & Performance'),
  COALESCE((SELECT NULLIF(TRIM("connectivity_heading"), '') FROM "products" WHERE NULLIF(TRIM("connectivity_heading"), '') IS NOT NULL ORDER BY "updated_at" DESC, "id" LIMIT 1), 'Connectivity, Battery & Smart Features')
)
ON CONFLICT ("id") DO NOTHING;
