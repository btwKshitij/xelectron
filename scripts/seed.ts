import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── Category Mappings ───────────────────────────────────────────────────────

const CATEGORIES = [
  { title: "Home Speaker", slug: "speakers", description: "Premium Wireless Speakers", image: "/category-speaker.png" },
  { title: "Audio", slug: "headphones", description: "Wireless Earbuds, Soundbars & Headphones", image: "/category-headphones.png" },
  { title: "Cameras", slug: "cameras", description: "Smart 4K Dash Cameras & Action Cams", image: "/category-camera.png" },
  { title: "Smartphones", slug: "smartphones", description: "Flagship Smartphones", image: "/category-smartphone.png" },
  { title: "Smart TVs", slug: "tv", description: "High definition 4K and Smart LED Televisions", image: "/category-tv.png" },
  { title: "Projectors", slug: "projectors", description: "Portable Android & HD Cinema Projectors", image: "/category-projector.png" },
  { title: "Digital Photo Frames", slug: "digital-photo-frames", description: "WiFi & IPS Digital Photo Frames", image: "/category-frame.png" },
];

// ─── Product Data ───────────────────────────────────────────────────────────
//
// Products are created through the dashboard. Keep the seed catalog empty so it
// never repopulates sample products after the catalog is cleared.
const PRODUCTS: [] = [];


// ─── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create categories
  console.log("📁 Creating categories...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { title: cat.title, description: cat.description, image: cat.image },
      create: { title: cat.title, slug: cat.slug, description: cat.description, image: cat.image, visible: true },
    });
    console.log(`  ✅ ${cat.title} (${cat.slug})`);
  }

  // 2. Products are intentionally not seeded. Add them dynamically from the dashboard.
  console.log("\n📦 Skipping product seed — products are managed dynamically.");

  // 3. Update category product counts
  console.log("\n📊 Updating category product counts...");
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const count = await prisma.product.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { productCount: count } });
    console.log(`  ✅ ${cat.title}: ${count} products`);
  }

  // 4. Create default users (Admin & Customer)
  console.log("\n👤 Creating default users...");
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const customerPasswordHash = await bcrypt.hash("userpassword123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@xelectron.com" },
    update: { role: UserRole.ADMIN },
    create: {
      name: "Admin User",
      email: "admin@xelectron.com",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`  ✅ Admin User: ${adminUser.email} (Role: ${adminUser.role})`);

  // 5. Seed Brand Platforms Marquee
  console.log("\n🚀 Seeding Brand Platforms Marquee...");
  const BRAND_PLATFORMS = [
    { name: "Amazon", logoUrl: "/brands/amazon.svg", color: "#FF9900", linkUrl: "https://www.amazon.in", sortOrder: 0, isActive: true },
    { name: "Flipkart", logoUrl: "/brands/flipkart.svg", color: "#2874F0", linkUrl: "https://www.flipkart.com", sortOrder: 1, isActive: true },
    { name: "Myntra", logoUrl: "/brands/myntra.svg", color: "#FF3F6C", linkUrl: "https://www.myntra.com", sortOrder: 2, isActive: true },
    { name: "Croma", logoUrl: "/brands/croma.svg", color: "#0F7C4F", linkUrl: "https://www.croma.com", sortOrder: 3, isActive: true },
    { name: "Reliance Digital", logoUrl: "/brands/reliance-digital.svg", color: "#0033A0", linkUrl: "https://www.reliancedigital.in", sortOrder: 4, isActive: true },
    { name: "JioMart", logoUrl: "/brands/jiomart.svg", color: "#0A3D8F", linkUrl: "https://www.jiomart.com", sortOrder: 5, isActive: true },
    { name: "Meesho", logoUrl: "/brands/meesho.svg", color: "#570A57", linkUrl: "https://www.meesho.com", sortOrder: 6, isActive: true },
    { name: "Snapdeal", logoUrl: "/brands/snapdeal.svg", color: "#E40046", linkUrl: "https://www.snapdeal.com", sortOrder: 7, isActive: true },
    { name: "Tata CLiQ", logoUrl: "/brands/tata-cliq.svg", color: "#5C2D91", linkUrl: "https://www.tatacliq.com", sortOrder: 8, isActive: true },
    { name: "Nykaa", logoUrl: "/brands/nykaa.svg", color: "#FC2779", linkUrl: "https://www.nykaa.com", sortOrder: 9, isActive: true },
  ];

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "brand_marquee_items" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo_url" TEXT,
        "color" TEXT NOT NULL DEFAULT '#000000',
        "link_url" TEXT,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "brand_marquee_items" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;`);
    await prisma.$executeRawUnsafe(`DELETE FROM "brand_marquee_items"`);

    for (const b of BRAND_PLATFORMS) {
      await (prisma as any).brandMarqueeItem.create({
        data: b,
      });
    }
    console.log(`  ✅ Seeded ${BRAND_PLATFORMS.length} brand platforms`);
  } catch (err: any) {
    console.log(`  ⚠️ Brand platforms seed notice: ${err?.message || err}`);
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
