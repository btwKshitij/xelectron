"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Auto-redirect if already authenticated
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.user) {
          const paramRedirect = searchParams.get("redirectTo");
          if (paramRedirect) {
            router.replace(paramRedirect);
          } else if (data.user.role === "ADMIN") {
            router.replace("/dashboard");
          } else {
            router.replace("/orders");
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    otp: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const rawPhone = formData.phone.replace(/[^0-9]/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number first.");
      return;
    }

    setErrorMsg(null);
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP. Please try again.");
      }

      setIsOtpSent(true);
      setCountdown(30); // 30 seconds cooldown

      if (data.otp) {
        setDemoOtpHint(data.otp);
        toast.info(`Your OTP is: ${data.otp}`, {
          description: "Use this code to verify your phone number",
          duration: 10000,
        });
      } else {
        toast.success("OTP sent to your phone number!");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP code received on your phone.");
      return;
    }

    setErrorMsg(null);
    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect OTP code. Please check and try again.");
      }

      setIsOtpVerified(true);
      setDemoOtpHint(null);
      toast.success("Phone number verified successfully!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "signup") {
      const rawPhone = formData.phone.replace(/[^0-9]/g, "");
      if (!rawPhone || rawPhone.length < 10) {
        setErrorMsg("Please provide a valid 10-digit phone number.");
        return;
      }

      if (!isOtpVerified) {
        setErrorMsg("Please verify your phone number with the OTP before creating your account.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();

        const paramRedirect = searchParams.get("redirectTo");
        const targetUrl = paramRedirect || data.redirectTo || "/";

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Login failed. Please check your credentials.");
        }

        router.replace(targetUrl);
        router.refresh();
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.fullName,
            phone: formData.phone,
            otp: formData.otp,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();

        const paramRedirect = searchParams.get("redirectTo");
        const targetUrl = paramRedirect || data.redirectTo || "/";

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create account.");
        }

        toast.success("Account created successfully!");
        router.replace(targetUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex bg-white">
      <div className="grid w-full min-h-[calc(100vh-70px)] lg:grid-cols-12">
        {/* Left Side: Editorial Lifestyle Photo (50% Width, 100% Height) */}
        <div className="relative hidden lg:block lg:col-span-6 bg-slate-100 min-h-[650px] lg:min-h-full overflow-hidden">
          <Image
            src="/auth-editorial.png"
            alt="XElectron Editorial Lifestyle"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>

        {/* Right Side: Editorial Form (50% Width, Centered) */}
        <div className="lg:col-span-6 min-h-[650px] lg:min-h-full flex flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-white">
          <div className="w-full max-w-[480px] my-auto py-4">
            {/* Mode Subtitle & Info */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-medium uppercase tracking-wider text-slate-900">
                {mode === "signup" ? "CREATE YOUR ACCOUNT" : "SIGN IN TO YOUR ACCOUNT"}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 font-normal">
                {mode === "signup"
                  ? "Required: Name, Phone (verified by OTP), Email and Password."
                  : "Access your saved products, track your orders, and manage your member profile."}
              </p>

              {errorMsg && (
                <div className="mt-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {mode === "signup" && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                      FULL NAME <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full rounded-none border border-slate-900 bg-white py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  {/* Phone Number + OTP Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900">
                        PHONE NUMBER (CONFIRMED BY OTP) <span className="text-rose-500">*</span>
                      </label>
                      {isOtpVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          <CheckCircle2 className="size-3" /> VERIFIED
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center border border-slate-900 bg-white px-3">
                        <span className="text-xs font-medium text-slate-500 pr-2 border-r border-slate-200 shrink-0">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          disabled={isOtpVerified}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setFormData({ ...formData, phone: val });
                            if (isOtpVerified) setIsOtpVerified(false);
                          }}
                          className="w-full bg-transparent py-2.5 pl-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>

                      {!isOtpVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || countdown > 0 || formData.phone.length < 10}
                          className="shrink-0 bg-slate-900 hover:bg-black text-white px-3.5 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              SENDING...
                            </>
                          ) : countdown > 0 ? (
                            `RESEND (${countdown}S)`
                          ) : isOtpSent ? (
                            "RESEND OTP"
                          ) : (
                            "SEND OTP"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Input Section (Visible when OTP sent and not yet verified) */}
                  {isOtpSent && !isOtpVerified && (
                    <div className="p-3.5 bg-slate-50 border border-slate-300 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          ENTER 6-DIGIT OTP CODE
                        </label>
                        {demoOtpHint && (
                          <span className="text-[10px] font-mono text-[#0a7ae6] bg-blue-50 px-2 py-0.5 border border-blue-200">
                            Demo Code: {demoOtpHint}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={formData.otp}
                          onChange={(e) =>
                            setFormData({ ...formData, otp: e.target.value.replace(/[^0-9]/g, "") })
                          }
                          className="flex-1 border border-slate-900 bg-white py-2 px-3 text-center font-mono text-sm tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || formData.otp.length !== 6}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                        >
                          {isVerifyingOtp ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          VERIFY
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Enter the verification code sent to +91 {formData.phone}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  EMAIL ADDRESS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-none border border-slate-900 bg-white py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                />
              </div>

              {mode === "signup" ? (
                /* 2-Column Password Grid for Signup */
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                      PASSWORD <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="6+ characters"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full rounded-none border border-slate-900 bg-white py-2.5 pl-3.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 truncate">
                      CONFIRM PASSWORD <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full rounded-none border border-slate-900 bg-white py-2.5 pl-3.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Password for Login */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset instructions sent.")}
                      className="text-[11px] font-normal text-slate-500 hover:text-slate-900 underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="6+ characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-none border border-slate-900 bg-white py-2.5 pl-3.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 stroke-[1.8]" />
                      ) : (
                        <Eye className="size-4 stroke-[1.8]" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Checkbox */}
              <div className="pt-1">
                {mode === "signup" ? (
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        setFormData({ ...formData, agreeTerms: e.target.checked })
                      }
                      className="mt-0.5 size-3.5 rounded-none border-slate-900 text-black focus:ring-slate-900"
                    />
                    <span className="text-[11px] leading-snug text-slate-600 font-normal">
                      I agree to the{" "}
                      <span className="text-slate-900 underline cursor-pointer">
                        Terms & Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-slate-900 underline cursor-pointer">
                        Privacy Policy
                      </span>
                      .
                    </span>
                  </label>
                ) : (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({ ...formData, rememberMe: e.target.checked })
                      }
                      className="size-3.5 rounded-none border-slate-900 text-black focus:ring-slate-900"
                    />
                    <span className="text-[11px] text-slate-600 font-normal">
                      Keep me signed in on this device
                    </span>
                  </label>
                )}
              </div>

              {/* Full-width Black Button with Diagonal Arrow */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (mode === "signup" && !isOtpVerified)}
                  className="group relative flex w-full items-center justify-between rounded-none bg-black py-3.5 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mx-auto pl-4">
                    {loading
                      ? "PROCESSING..."
                      : mode === "signup"
                      ? isOtpVerified
                        ? "CREATE ACCOUNT"
                        : "VERIFY PHONE FIRST"
                      : "SIGN IN"}
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </form>

            {/* Footer Mode Switcher Link */}
            <div className="mt-8 text-center pt-4 border-t border-slate-100">
              {mode === "signup" ? (
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg(null);
                    }}
                    className="font-bold text-slate-900 hover:underline uppercase tracking-wider ml-1 cursor-pointer"
                  >
                    SIGN IN HERE
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg(null);
                    }}
                    className="font-bold text-slate-900 hover:underline uppercase tracking-wider ml-1 cursor-pointer"
                  >
                    CREATE ONE
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />
      <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading authentication form...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
