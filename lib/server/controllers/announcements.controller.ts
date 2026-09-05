import { db } from "@/lib/db";

export type AnnouncementItem = {
  id: string;
  prefix: string | null;
  action: string;
  href: string;
  discountCode: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AnnouncementSettingsItem = {
  id: string;
  tickerEnabled: boolean;
  updatedAt: Date;
};

export function normalizeAnnouncementHref(value: unknown) {
  const href = typeof value === "string" ? value.trim() : "";
  if (!href) return "/";
  if (href.startsWith("/")) return href;

  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {}

  throw new Error("Link must begin with / or use a valid http(s) URL.");
}

function cleanText(value: unknown, field: string, required = false) {
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new Error(`${field} is required.`);
  if (text.length > 140) throw new Error(`${field} must be 140 characters or fewer.`);
  return text;
}

async function resolveDiscountCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!code) return null;
  if (!/^[A-Z0-9_-]{2,64}$/.test(code)) {
    throw new Error("Discount codes can only use letters, numbers, hyphens, and underscores.");
  }

  const discount = await db.discount.findUnique({ where: { code } });
  const now = new Date();
  const isAvailable =
    discount &&
    discount.isActive &&
    (!discount.startDate || discount.startDate <= now) &&
    (!discount.endDate || discount.endDate >= now);

  if (!isAvailable) {
    throw new Error(`“${code}” is not an active discount. Create or activate it in Discounts first.`);
  }

  return code;
}

export async function listAnnouncements(activeOnly = false): Promise<AnnouncementItem[]> {
  return db.announcement.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAnnouncementSettings(): Promise<AnnouncementSettingsItem> {
  return db.announcementSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", tickerEnabled: true },
  });
}

export async function setAnnouncementTickerEnabled(value: unknown): Promise<AnnouncementSettingsItem> {
  if (typeof value !== "boolean") throw new Error("Ticker motion must be on or off.");

  return db.announcementSettings.upsert({
    where: { id: "default" },
    update: { tickerEnabled: value },
    create: { id: "default", tickerEnabled: value },
  });
}

export async function createAnnouncement(data: Record<string, unknown>) {
  const existing = await listAnnouncements();
  return db.announcement.create({
    data: {
      prefix: cleanText(data.prefix, "Lead text") || null,
      action: cleanText(data.action, "Offer text", true),
      href: normalizeAnnouncementHref(data.href),
      discountCode: await resolveDiscountCode(data.discountCode),
      isActive: data.isActive !== false,
      sortOrder: existing.length,
    },
  });
}

export async function updateAnnouncement(id: string, data: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  if ("prefix" in data) update.prefix = cleanText(data.prefix, "Lead text") || null;
  if ("action" in data) update.action = cleanText(data.action, "Offer text", true);
  if ("href" in data) update.href = normalizeAnnouncementHref(data.href);
  if ("discountCode" in data) update.discountCode = await resolveDiscountCode(data.discountCode);
  if ("isActive" in data) update.isActive = Boolean(data.isActive);
  if ("sortOrder" in data) {
    const sortOrder = Number(data.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("Invalid display position.");
    update.sortOrder = sortOrder;
  }
  return db.announcement.update({ where: { id }, data: update });
}

export async function deleteAnnouncement(id: string) {
  const deleted = await db.announcement.delete({ where: { id } });
  const remaining = await db.announcement.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  await Promise.all(
    remaining.map((announcement: AnnouncementItem, sortOrder: number) =>
      announcement.sortOrder === sortOrder
        ? undefined
        : db.announcement.update({ where: { id: announcement.id }, data: { sortOrder } })
    )
  );

  return deleted;
}
