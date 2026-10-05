"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, Loader2, Mail, ShieldCheck, RefreshCw } from "lucide-react";

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
  const [notRegistered, setNotRegistered] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const isReset = mode === "reset";
  const invalidLink = isReset && !/^[a-f0-9]{64}$/.test(token);
  const field = "w-full rounded-none border border-slate-900 bg-white py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all disabled:bg-slate-50 disabled:text-slate-500";
  const primary = "group relative flex w-full items-center justify-center gap-3 rounded-none bg-black py-3.5 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send(resend = false) {
    if (busy || (resend && cooldown > 0)) return;
    setError("");
    setNotRegistered(false);
    if (isReset && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${isReset ? "reset-password" : "forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReset ? { token, password } : { email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.code === "ACCOUNT_NOT_REGISTERED") {
          setNotRegistered(true);
          setDone(false);
        }
        if (response.status === 429) setCooldown(Number(response.headers.get("Retry-After")) || 60);
        throw new Error(data.error || "Unable to complete your request. Please try again.");
      }
      setDone(true);
      setResent(resend);
      setPassword("");
      setConfirmation("");
      if (!isReset) setCooldown(60);
      if (isReset) window.history.replaceState(null, "", "/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  return (
    <div className="w-full flex-1 flex bg-white">
      <div className="grid w-full min-h-[calc(100vh-70px)] lg:grid-cols-12">
        <aside className="relative hidden lg:block lg:col-span-6 bg-slate-100 min-h-[650px] lg:min-h-full overflow-hidden">
          <Image src="/auth-editorial.png" alt="XElectron Editorial Lifestyle" fill priority unoptimized sizes="50vw" className="object-cover object-center" />
        </aside>
        <section aria-labelledby="recovery-title" className="lg:col-span-6 min-h-[650px] lg:min-h-full flex flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-white">
          <div className="w-full max-w-[480px] my-auto py-4">
          <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 hover:text-slate-900"><ArrowLeft className="size-3.5" /> Back to sign in</Link>
          <h1 id="recovery-title" className="text-xl sm:text-2xl font-medium uppercase tracking-wider text-slate-900">
            {done ? (isReset ? "Password updated" : "Check your email") : isReset ? "Set a new password" : "Forgot your password?"}
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-normal">
            {done ? isReset ? "Your password is updated. Your previous sessions have been signed out." : "Your reset email has been accepted for sending to:" : isReset ? "Choose a password you have not used before. Use 8 to 72 characters." : "It happens. Enter your account email and we will help you get back in."}
          </p>
          {notRegistered ? (
            <p id="recovery-email-error" role="alert" className="mt-4 text-xs leading-6 text-rose-600">
              This email is not registered.{" "}
              <Link href={`/login?mode=signup&email=${encodeURIComponent(email.trim())}`} className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600">
                Create an account
              </Link>
            </p>
          ) : error ? <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">{error}</p> : null}
          {done ? (
            <div className="mt-6 space-y-5" aria-live="polite" aria-busy={busy}>
              {isReset ? <a href="/login" className={primary}>Sign in with your new password <ArrowUpRight className="absolute right-5 size-4 shrink-0" /></a> : <>
                <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3.5 py-3"><Mail className="size-4 shrink-0 text-slate-400" /><span className="break-all text-xs font-medium text-slate-800">{email.trim()}</span></div>
                <p className="text-xs leading-relaxed text-slate-500">Check your inbox and spam folder. Your reset link expires in 30 minutes and can only be used once.</p>
                {resent && <p role="status" className="text-xs text-emerald-700">Another reset link has been requested.</p>}
                <button type="button" onClick={() => void send(true)} disabled={busy || cooldown > 0} className={primary}>
                  {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <RefreshCw className="size-4" />}
                  {busy ? "Sending..." : cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend reset link"}
                </button>
                <button type="button" disabled={busy} onClick={() => { setDone(false); setError(""); setResent(false); }} className="w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-900 underline-offset-4 hover:underline">Use a different email</button>
              </>}
            </div>
          ) : invalidLink ? (
            <div role="alert" className="mt-6 border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">This reset link is missing or invalid. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link> to continue.</div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4 sm:space-y-5" aria-busy={busy}>
              {!isReset ? <div>
                <label htmlFor="recovery-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-900">Email address</label>
                <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} aria-invalid={notRegistered} aria-describedby={notRegistered ? "recovery-email-error" : undefined} onChange={(e) => { setEmail(e.target.value); setNotRegistered(false); setError(""); }} placeholder="you@example.com" className={field} />
              </div> : <>
                <div>
                  <label htmlFor="new-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-900">New password</label>
                  <div className="relative">
                    <input id="new-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} className={`${field} pr-12`} />
                    <button type="button" aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 px-4 text-slate-500 focus-visible:outline-2 focus-visible:outline-slate-900">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-900">Confirm password</label>
                  <input id="confirm-password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} disabled={busy} onChange={(e) => setConfirmation(e.target.value)} className={field} />
                </div>
              </>}
              <button type="submit" disabled={busy} className={primary}>{busy ? (isReset ? "Updating password..." : "Sending reset link...") : isReset ? "Update password" : "Send reset link"}{busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <ArrowUpRight className="absolute right-5 size-4 shrink-0" />}</button>
              {isReset && <Link href="/forgot-password" className="block text-center text-xs text-slate-500 underline underline-offset-4">Request a new reset link</Link>}
            </form>
          )}
          <div className="mt-8 border-t border-slate-100 pt-4 text-center">
            <p className="flex items-center justify-center gap-2 text-[11px] leading-relaxed text-slate-500"><ShieldCheck className="size-3.5 shrink-0" /> {done && isReset ? "Your account is ready. Sign in to continue." : "A reset request will not change your password."}</p>
            <p className="mt-3 text-xs text-slate-500">Need help? <Link href="/contact-us" className="ml-1 font-bold uppercase tracking-wider text-slate-900 hover:underline">Contact us</Link></p>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}
