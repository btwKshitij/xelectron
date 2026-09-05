import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

type RuntimeModel = {
  fields?: { name?: string }[];
};

function hasGeneratedProductField(client: PrismaClient, fieldName: string) {
  const runtimeDataModel = (client as unknown as {
    _runtimeDataModel?: { models?: Record<string, RuntimeModel> };
  })._runtimeDataModel;

  return runtimeDataModel?.models?.Product?.fields?.some((field) => field.name === fieldName) ?? false;
}

function getDatabaseUrl() {
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  // Replace legacy/aliased sslmode with explicit sslmode=verify-full to suppress pg-connection-string warnings
  if (databaseUrl.includes("sslmode=require")) {
    databaseUrl = databaseUrl.replace("sslmode=require", "sslmode=verify-full");
  } else if (databaseUrl.includes("sslmode=prefer")) {
    databaseUrl = databaseUrl.replace("sslmode=prefer", "sslmode=verify-full");
  } else if (databaseUrl.includes("sslmode=verify-ca")) {
    databaseUrl = databaseUrl.replace("sslmode=verify-ca", "sslmode=verify-full");
  }
  return databaseUrl;
}

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getDbInstance(): PrismaClient {
  if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
    if (
      typeof (globalForPrisma.prisma as any).heroBanner === "undefined" ||
      typeof (globalForPrisma.prisma as any).announcement === "undefined" ||
      typeof (globalForPrisma.prisma as any).announcementSettings === "undefined" ||
      typeof (globalForPrisma.prisma as any).creatorVideo === "undefined" ||
      typeof (globalForPrisma.prisma as any).productFaq === "undefined" ||
      typeof (globalForPrisma.prisma as any).productBanner === "undefined" ||
      typeof (globalForPrisma.prisma as any).productReview === "undefined" ||
      typeof (globalForPrisma.prisma as any).productVariant === "undefined" ||
      typeof (globalForPrisma.prisma as any).blogPost === "undefined" ||
      typeof (globalForPrisma.prisma as any).draftOrder === "undefined" ||
      typeof (globalForPrisma.prisma as any).brandShowcaseItem === "undefined" ||
      typeof (globalForPrisma.prisma as any).brandMarqueeItem === "undefined" ||
      !hasGeneratedProductField(globalForPrisma.prisma, "showInNavbar") ||
      !hasGeneratedProductField(globalForPrisma.prisma, "showInWarrantyMenu")
    ) {
      globalForPrisma.prisma = undefined;
    }
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const db: any = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDbInstance();
    const value = (instance as any)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
  has(_target, prop) {
    const instance = getDbInstance();
    return prop in instance;
  },
});
