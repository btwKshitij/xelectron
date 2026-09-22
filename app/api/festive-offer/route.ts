import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFestivePopupSettings } from "@/lib/server/controllers/festive-popup.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getFestivePopupSettings();
    return NextResponse.json({
      success: true,
      settings: {
        isActive: settings.isActive,
        imageUrl: settings.imageUrl,
        badgeTitle: settings.badgeTitle,
        heading: settings.heading,
        offerText: settings.offerText,
        subtext: settings.subtext,
        buttonText: settings.buttonText,
        discountCode: settings.discountCode,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("Failed to load festive popup settings for storefront:", err);
    return NextResponse.json({
      success: true,
      settings: {
        isActive: false,
        imageUrl: "/ganesh-chaturthi-popup-clean.png",
        badgeTitle: "GANESH CHATURTHI SPECIAL",
        heading: "BRING HOME MORE JOY",
        offerText: "GET 5% OFF",
        subtext: "Sign up and receive your festive offer by email.",
        buttonText: "UNLOCK MY 5% OFF",
        discountCode: "GANESH5",
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const settings = await getFestivePopupSettings();
    const discountCode = settings?.discountCode || "GANESH5";
    const campaign = settings?.badgeTitle || "Festive Special";

    // Record lead in database
    try {
      if (db && (db as any).supportRequest) {
        await (db as any).supportRequest.create({
          data: {
            kind: "FESTIVE_LEAD",
            details: {
              email,
              campaign,
              discountCode,
              offerText: settings?.offerText || "GET 5% OFF",
              submittedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("Could not save festive lead to db:", dbErr);
    }

    return NextResponse.json({
      success: true,
      discountCode,
      message: `Festive offer unlocked! Use coupon ${discountCode} at checkout.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
