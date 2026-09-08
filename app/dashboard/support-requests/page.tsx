import { db } from "@/lib/db";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";
export default async function Page() {
  const requests = await db.supportRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return <TooltipProvider><SidebarProvider><AppSidebar /><SidebarInset><div className="mx-auto w-full max-w-5xl p-6"><h1 className="text-2xl font-semibold">Support requests</h1><p className="mt-2 text-sm text-slate-500">Latest 200 warranty registrations, complaints, and inquiries. Saved independently of email delivery.</p><div className="mt-6 space-y-4">{requests.length === 0 && <p>No requests received yet.</p>}{requests.map((request: { id: string; kind: string; createdAt: Date; details: Record<string, string> }) => <details key={request.id} className="rounded-xl border bg-white p-5"><summary className="cursor-pointer text-sm font-semibold">{request.kind} ? {request.details.name} ? {request.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</summary><p className="mt-3 text-xs text-slate-500">Reference: {request.id}</p><dl className="mt-4 space-y-3">{Object.entries(request.details).map(([key, value]) => <div key={key}><dt className="text-xs font-semibold capitalize text-slate-500">{key}</dt><dd className="whitespace-pre-wrap break-words text-sm">{value}</dd></div>)}</dl></details>)}</div></div></SidebarInset></SidebarProvider></TooltipProvider>;
}
