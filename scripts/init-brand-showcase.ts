import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Creating brand_showcase_items table if not exists...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "brand_showcase_items" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "subtitle" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "link_url" TEXT,
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Table brand_showcase_items verified/created successfully!");

  // Check if items exist, otherwise seed defaults
  const count = await prisma.brandShowcaseItem.count();
  console.log("Current brand showcase count:", count);

  if (count === 0) {
    console.log("Seeding default brand showcase items...");
    const defaults = [
      {
        title: "Smart Home Cinema",
        subtitle: "Up to 300-inch 4K projection for movie nights",
        image: "/banner-projector.png",
        linkUrl: "/shop?filter=projectors",
        sortOrder: 0,
        isActive: true,
      },
      {
        title: "Ultra HD Smart TVs",
        subtitle: "Vivid color clarity and cinematic surround sound",
        image: "/hero-banner-tv.png",
        linkUrl: "/shop?filter=tv",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Portable Projection",
        subtitle: "Rotatable angle, auto keystone & built-in apps",
        image: "/hero-banner-techno-projector.png",
        linkUrl: "/shop?filter=projectors",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "Android C9 Plus Cinema",
        subtitle: "True 1080p FHD with high lumen optical brilliance",
        image: "/hero-banner-projector-c9.png",
        linkUrl: "/shop?filter=projectors",
        sortOrder: 3,
        isActive: true,
      },
    ];

    for (const item of defaults) {
      await prisma.brandShowcaseItem.create({ data: item });
      console.log(`  Created: ${item.title}`);
    }
  }

  console.log("Brand showcase ready!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
