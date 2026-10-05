"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function PasswordRecoveryForm({ mode }: { mode: "request" | "reset" }) {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const isReset = mode === "reset";
  const invalidLink = isReset && !/^[a-f0-9]{64}$/.test(token);
  const field = "w-full rounded-none border border-slate-900 bg-white px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-60";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (isReset && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${isReset ? "reset-password" : "forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReset ? { token, password } : { email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to complete your request.");
      setDone(true);
      setPassword("");
      setConfirmation("");
      if (isReset) window.history.replaceState(null, "", "/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-16 sm:py-24">
      <Link href="/login" className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-black">? Back to sign in</Link>
      <h1 className="mt-8 text-2xl font-semibold uppercase tracking-wide text-slate-900 sm:text-3xl">
        {done ? (isReset ? "Password updated" : "Check your email") : isReset ? "Set a new password" : "Forgot your password?"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        {done
          ? isReset ? "Your password has been changed and your previous sessions have been signed out. Sign in with your new password." : "If an account exists for this email, you will receive a reset link. Check your inbox and spam folder. The link expires in 30 minutes."
          : isReset ? "Choose a new password with 8?72 characters." : "Enter your account email and we?ll send you a link to reset your password."}
      </p>
      {done ? (
        <div role="status" className="mt-8 space-y-6">
          <CheckCircle2 className="size-9 text-emerald-600" aria-hidden="true" />
          {isReset ? <a href="/login" className="block bg-black px-6 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white">Sign in</a> : <button type="button" onClick={() => setDone(false)} className="text-sm underline underline-offset-4">Try again or use another email</button>}
        </div>
      ) : invalidLink ? (
        <div role="alert" className="mt-8 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          This reset link is invalid. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-6" aria-busy={busy}>
          {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {!isReset ? (
            <div>
              <label htmlFor="recovery-email" className="mb-2 block text-xs font-bold uppercase tracking-wider">Email address</label>
              <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="new-password" className="mb-2 block text-xs font-bold uppercase tracking-wider">New password</label>
                <div className="relative">
                  <input id="new-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} className={`${field} pr-12`} />
                  <button type="button" aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 px-3 text-slate-500">{visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-xs font-bold uppercase tracking-wider">Confirm new password</label>
                <input id="confirm-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} disabled={busy} onChange={(e) => setConfirmation(e.target.value)} className={field} />
              </div>
            </>
          )}
          <button type="submit" disabled={busy} className="flex w-full items-center justify-between bg-black px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-slate-800 disabled:opacity-60">
            {busy ? (isReset ? "Updating password?" : "Sending link?") : isReset ? "Update password" : "Send reset link"}
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
          </button>
          {isReset && <Link href="/forgot-password" className="block text-center text-sm text-slate-500 underline underline-offset-4">Request a new reset link</Link>}
        </form>
      )}
    </section>
  );
}
