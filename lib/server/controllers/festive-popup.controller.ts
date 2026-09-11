import { db } from "@/lib/db";

export type FestivePopupSettingsItem = {
  id: string;
  isActive: boolean;
  imageUrl: string;
  badgeTitle: string;
  heading: string;
  offerText: string;
  subtext: string;
  buttonText: string;
  discountCode: string;
  updatedAt: Date;
};

export const DEFAULT_FESTIVE_SETTINGS: FestivePopupSettingsItem = {
  id: "default",
  isActive: true,
  imageUrl: "/ganesh-chaturthi-popup-clean.png",
  badgeTitle: "GANESH CHATURTHI SPECIAL",
  heading: "BRING HOME MORE JOY",
  offerText: "GET 5% OFF",
  subtext: "Sign up and receive your festive offer by email.",
  buttonText: "UNLOCK MY 5% OFF",
  discountCode: "GANESH5",
  updatedAt: new Date(),
};

export async function getFestivePopupSettings(): Promise<FestivePopupSettingsItem> {
  try {
    // 1. Primary: Use Prisma Model if available on the current Prisma client instance
    if (db?.festivePopupSettings && typeof db.festivePopupSettings.findUnique === "function") {
      const existing = await db.festivePopupSettings.findUnique({
        where: { id: "default" },
      });

      if (existing) {
        return existing;
      }

      return await db.festivePopupSettings.create({
        data: {
          id: DEFAULT_FESTIVE_SETTINGS.id,
          isActive: DEFAULT_FESTIVE_SETTINGS.isActive,
          imageUrl: DEFAULT_FESTIVE_SETTINGS.imageUrl,
          badgeTitle: DEFAULT_FESTIVE_SETTINGS.badgeTitle,
          heading: DEFAULT_FESTIVE_SETTINGS.heading,
          offerText: DEFAULT_FESTIVE_SETTINGS.offerText,
          subtext: DEFAULT_FESTIVE_SETTINGS.subtext,
          buttonText: DEFAULT_FESTIVE_SETTINGS.buttonText,
          discountCode: DEFAULT_FESTIVE_SETTINGS.discountCode,
        },
      });
    }

    // 2. Resilient Fallback: If dev server was started before prisma generate, query table directly
    if (typeof db?.$queryRawUnsafe === "function") {
      const rows: any = await db.$queryRawUnsafe(
        'SELECT id, is_active as "isActive", image_url as "imageUrl", badge_title as "badgeTitle", heading, offer_text as "offerText", subtext, button_text as "buttonText", discount_code as "discountCode", updated_at as "updatedAt" FROM festive_popup_settings WHERE id = \'default\' LIMIT 1'
      );

      if (Array.isArray(rows) && rows.length > 0) {
        return {
          ...DEFAULT_FESTIVE_SETTINGS,
          ...rows[0],
          isActive: Boolean(rows[0].isActive),
        };
      }

      await db.$executeRawUnsafe(
        "INSERT INTO festive_popup_settings (id, is_active, image_url, badge_title, heading, offer_text, subtext, button_text, discount_code, updated_at) VALUES ('default', true, '/ganesh-chaturthi-popup-clean.png', 'GANESH CHATURTHI SPECIAL', 'BRING HOME MORE JOY', 'GET 5% OFF', 'Sign up and receive your festive offer by email.', 'UNLOCK MY 5% OFF', 'GANESH5', NOW()) ON CONFLICT (id) DO NOTHING"
      );
    }

    return {
      ...DEFAULT_FESTIVE_SETTINGS,
      updatedAt: new Date(),
    };
  } catch (err) {
    console.error("Failed to fetch festive popup settings from db:", err);
    return {
      ...DEFAULT_FESTIVE_SETTINGS,
      updatedAt: new Date(),
    };
  }
}

export async function updateFestivePopupSettings(data: Record<string, unknown>): Promise<FestivePopupSettingsItem> {
  const updateData: Record<string, any> = {};

  if ("isActive" in data) {
    updateData.isActive = Boolean(data.isActive);
  }
  if (typeof data.imageUrl === "string" && data.imageUrl.trim()) {
    updateData.imageUrl = data.imageUrl.trim();
  }
  if (typeof data.badgeTitle === "string") {
    updateData.badgeTitle = data.badgeTitle.trim();
  }
  if (typeof data.heading === "string") {
    updateData.heading = data.heading.trim();
  }
  if (typeof data.offerText === "string") {
    updateData.offerText = data.offerText.trim();
  }
  if (typeof data.subtext === "string") {
    updateData.subtext = data.subtext.trim();
  }
  if (typeof data.buttonText === "string") {
    updateData.buttonText = data.buttonText.trim();
  }
  if (typeof data.discountCode === "string" && data.discountCode.trim()) {
    updateData.discountCode = data.discountCode.trim().toUpperCase();
  }

  // 1. Primary: Use Prisma Model if available
  if (db?.festivePopupSettings && typeof db.festivePopupSettings.upsert === "function") {
    return await db.festivePopupSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        isActive: updateData.isActive ?? DEFAULT_FESTIVE_SETTINGS.isActive,
        imageUrl: updateData.imageUrl ?? DEFAULT_FESTIVE_SETTINGS.imageUrl,
        badgeTitle: updateData.badgeTitle ?? DEFAULT_FESTIVE_SETTINGS.badgeTitle,
        heading: updateData.heading ?? DEFAULT_FESTIVE_SETTINGS.heading,
        offerText: updateData.offerText ?? DEFAULT_FESTIVE_SETTINGS.offerText,
        subtext: updateData.subtext ?? DEFAULT_FESTIVE_SETTINGS.subtext,
        buttonText: updateData.buttonText ?? DEFAULT_FESTIVE_SETTINGS.buttonText,
        discountCode: updateData.discountCode ?? DEFAULT_FESTIVE_SETTINGS.discountCode,
      },
    });
  }

  // 2. Resilient Fallback: If dev server was started before prisma generate, update table directly
  if (typeof db?.$executeRawUnsafe === "function") {
    const current = await getFestivePopupSettings();
    const merged = { ...current, ...updateData };

    await db.$executeRawUnsafe(
      `INSERT INTO festive_popup_settings (id, is_active, image_url, badge_title, heading, offer_text, subtext, button_text, discount_code, updated_at) 
       VALUES ('default', ${merged.isActive ? "TRUE" : "FALSE"}, '${merged.imageUrl.replace(/'/g, "''")}', '${merged.badgeTitle.replace(/'/g, "''")}', '${merged.heading.replace(/'/g, "''")}', '${merged.offerText.replace(/'/g, "''")}', '${merged.subtext.replace(/'/g, "''")}', '${merged.buttonText.replace(/'/g, "''")}', '${merged.discountCode.replace(/'/g, "''")}', NOW())
       ON CONFLICT (id) DO UPDATE SET
         is_active = EXCLUDED.is_active,
         image_url = EXCLUDED.image_url,
         badge_title = EXCLUDED.badge_title,
         heading = EXCLUDED.heading,
         offer_text = EXCLUDED.offer_text,
         subtext = EXCLUDED.subtext,
         button_text = EXCLUDED.button_text,
         discount_code = EXCLUDED.discount_code,
         updated_at = NOW()`
    );

    return {
      ...merged,
      updatedAt: new Date(),
    };
  }

  return {
    ...DEFAULT_FESTIVE_SETTINGS,
    ...updateData,
    updatedAt: new Date(),
  };
}
