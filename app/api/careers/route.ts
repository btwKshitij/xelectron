import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { OPENINGS } from "@/lib/careers";
import { sendEmail } from "@/lib/server/mail";

export const runtime = "nodejs";

const positions = new Set([...OPENINGS.map((job) => job.title), "General Application"]);
const applicationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).regex(/^\+?[\d\s().-]+$/).refine((value) => value.replace(/\D/g, "").length >= 7),
  position: z.string().refine((value) => positions.has(value)),
  portfolioUrl: z.union([z.literal(""), z.url().max(2000).refine((value) => /^https?:\/\//i.test(value))]).default(""),
  coverLetter: z.string().trim().max(5000).default(""),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Check your name, email, phone, role, and resume link. Resume links must start with https:// or http://." }, { status: 400 });
  }

  const inbox = process.env.CAREERS_EMAIL?.trim() || process.env.SMTP_USER?.trim();
  if (!inbox || !z.email().safeParse(inbox).success) {
    return NextResponse.json({ success: false, error: "Applications are temporarily unavailable. Please try again later." }, { status: 503 });
  }

  try {
    const application = parsed.data;
    const saved = await db.supportRequest.create({ data: { kind: "CAREER_APPLICATION", details: application } });
    const summary = [
      `Reference: ${saved.id}`,
      `Name: ${application.name}`,
      `Email: ${application.email}`,
      `Phone: ${application.phone}`,
      `Role: ${application.position}`,
      `Resume / profile: ${application.portfolioUrl || "Not provided"}`,
      ...(application.coverLetter ? ["", application.coverLetter] : []),
    ].join("\n");

    // Each notification is independent; a mail failure must not discard a saved application.
    const results = await Promise.allSettled([
      sendEmail({ to: inbox, replyTo: application.email, subject: `Job application: ${application.position} [${saved.id}]`, text: `New XElectron job application\n\n${summary}` }),
      sendEmail({ to: application.email, replyTo: inbox, subject: `XElectron application received [${saved.id}]`, text: `Hi ${application.name},\n\nThank you for applying to XElectron. Your application has been saved. Our team will review your profile and contact you if there is a suitable match.\n\n${summary}\n\nXElectron Hiring Team` }),
    ]);
    const sent = results.map((result) => result.status === "fulfilled" && result.value.success);
    if (sent.some((success) => !success)) {
      console.error("Career application notification failed", { reference: saved.id, adminSent: sent[0], confirmationSent: sent[1] });
    }
    return NextResponse.json({ success: true, reference: saved.id, confirmationSent: sent[1] });
  } catch {
    console.error("Career application could not be saved.");
    return NextResponse.json({ success: false, error: "Your application could not be saved. Please try again." }, { status: 500 });
  }
}
