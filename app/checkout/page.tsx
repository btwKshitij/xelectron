"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Lock,
  Package,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Truck,
  X,
  Zap,
  Sparkles,
  CheckCircle2,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import {
  UpiLogo,
  GPayLogo,
  PhonePeLogo,
  PaytmLogo,
  VisaLogo,
  MastercardLogo,
  RuPayLogo,
  RazorpayLogo,
  VelocityLogo,
} from "@/components/checkout/payment-logos";

const CHECKOUT_SESSION_KEY = "xelectron-active-checkout";
const EMI_TENURES = [3, 6, 9, 12] as const;
type EmiTenure = (typeof EMI_TENURES)[number];

function createCheckoutSessionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function CheckoutContent() {
  const { items: orderItems, subtotal, clearCart, addItem } = useCart();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [productParamLoading, setProductParamLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-resolve product param if passed via URL and not already in cart
  useEffect(() => {
    if (!isMounted) return;
    const productParam = searchParams.get("product");
    if (!productParam) {
      setProductParamLoading(false);
      return;
    }

    let isSubscribed = true;
    setProductParamLoading(true);

    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (!isSubscribed || !json.success || !Array.isArray(json.data)) return;

        const matched = json.data.find(
          (p: { id: string; slug: string }) =>
            p.id === productParam || p.slug === productParam
        );

        if (matched) {
          const itemPrice =
            typeof matched.price === "number"
              ? matched.price
              : parseFloat(String(matched.price).replace(/,/g, "").replace(/[^0-9.]/g, "")) || 0;

          const existingItem = orderItems.find(
            (item) => item.id === matched.id || item.slug === matched.slug || item.slug === productParam
          );

          if (existingItem) {
            // If item is already in cart but has wrong or 100x inflated price, replace with correct price
            if (existingItem.price !== itemPrice && itemPrice > 0) {
              clearCart();
              addItem({
                id: matched.id,
                name: matched.name,
                price: itemPrice,
                image: matched.mainImage || "/category-smartphone.png",
                category: matched.category?.title || "Electronics",
                slug: matched.slug,
              });
            }
          } else {
            addItem({
              id: matched.id,
              name: matched.name,
              price: itemPrice,
              image: matched.mainImage || "/category-smartphone.png",
              category: matched.category?.title || "Electronics",
              slug: matched.slug,
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isSubscribed) setProductParamLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, searchParams]);

  // Auth check
  useEffect(() => {
    if (!isMounted) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.name) {
            const parts = data.user.name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (data.user.email) setEmail(data.user.email);
        }
      })
      .catch(() => {})
      .finally(() => setIsAuthLoading(false));
  }, [isMounted]);

  // Form State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");

  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Account creation while placing order
  const [createAccountOnCheckout, setCreateAccountOnCheckout] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "velocity" | "cod">("razorpay");
  const [selectedEmiTenure, setSelectedEmiTenure] = useState<EmiTenure>(3);

  // Product-page EMI links arrive with the Velocity method already selected.
  useEffect(() => {
    if (!isMounted) return;

    if (searchParams.get("payment") === "velocity") {
      setPaymentMethod("velocity");
    }

    const requestedTenure = Number(searchParams.get("emiTenure"));
    if (EMI_TENURES.includes(requestedTenure as EmiTenure)) {
      setSelectedEmiTenure(requestedTenure as EmiTenure);
    }
  }, [isMounted, searchParams]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paidTotal, setPaidTotal] = useState(0);
  const [checkoutSessionToken, setCheckoutSessionToken] = useState("");

  // COD Mobile Verification (OTP) State
  const [isCodOtpModalOpen, setIsCodOtpModalOpen] = useState(false);
  const [codOtp, setCodOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingSession = window.sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    const sessionToken = existingSession || createCheckoutSessionToken();
    if (!existingSession) window.sessionStorage.setItem(CHECKOUT_SESSION_KEY, sessionToken);
    setCheckoutSessionToken(sessionToken);
  }, []);

  const discountAmount = useMemo(() => {
    if (couponDiscount > 0) {
      return Math.round((subtotal * couponDiscount) / 100);
    }
    return 0;
  }, [subtotal, couponDiscount]);

  const shippingCost = 0; // Free shipping
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const trackCheckout = useCallback(async () => {
    if (!checkoutSessionToken || orderItems.length === 0) return;

    try {
      await fetch("/api/abandoned-checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: checkoutSessionToken,
          items: orderItems.map(({ id, quantity }) => ({ id, quantity })),
          customerName: [firstName, lastName].filter(Boolean).join(" "),
          email,
          phone,
        }),
      });
    } catch {
      // Tracking must not block customers from checking out.
    }
  }, [checkoutSessionToken, email, firstName, lastName, orderItems, phone]);

  useEffect(() => {
    if (orderComplete || !checkoutSessionToken || orderItems.length === 0) return;

    const timer = window.setTimeout(() => { void trackCheckout(); }, 650);
    return () => window.clearTimeout(timer);
  }, [checkoutSessionToken, orderComplete, orderItems.length, trackCheckout]);

  // Coupon Handling
  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch("/api/discounts");
      const json = await res.json();

      let matchedDiscount: any | undefined;

      if (json.success && Array.isArray(json.data)) {
        matchedDiscount = json.data.find(
          (d: any) => d.code && d.code.toUpperCase() === code
        );
      }

      if (matchedDiscount) {
        // Check active status
        if (matchedDiscount.isActive === false) {
          setCouponError(`Coupon code "${code}" is currently disabled.`);
          return;
        }

        // Check expiration date
        if (matchedDiscount.endDate && new Date(matchedDiscount.endDate) < new Date()) {
          setCouponError(`Coupon code "${code}" has expired.`);
          return;
        }

        // Check start date
        if (matchedDiscount.startDate && new Date(matchedDiscount.startDate) > new Date()) {
          setCouponError(`Coupon code "${code}" is not active yet.`);
          return;
        }

        // Check eligible product IDs
        if (matchedDiscount.eligibleProductIds) {
          const allowedIds = matchedDiscount.eligibleProductIds.split(",").map((id: string) => id.trim()).filter(Boolean);
          const cartHasEligible = orderItems.some((item) => allowedIds.includes(item.id));
          if (!cartHasEligible) {
            setCouponError(`Coupon code "${code}" is only valid for selected products.`);
            return;
          }
        }

        setAppliedCoupon(matchedDiscount.code);
        if (matchedDiscount.type === "PERCENTAGE") {
          setCouponDiscount(matchedDiscount.value);
          setCouponSuccess(`${matchedDiscount.value}% discount applied successfully!`);
        } else if (matchedDiscount.type === "FIXED_AMOUNT") {
          const percent = subtotal > 0 ? Math.min(100, (matchedDiscount.value / subtotal) * 100) : 10;
          setCouponDiscount(percent);
          setCouponSuccess(`₹${matchedDiscount.value.toLocaleString("en-IN")} discount applied successfully!`);
        } else {
          setCouponDiscount(10);
          setCouponSuccess("Discount applied successfully!");
        }
      } else if (code === "WELCOME10" || code === "XELECTRON10") {
        setAppliedCoupon(code);
        setCouponDiscount(10);
        setCouponSuccess("10% discount applied successfully!");
      } else if (code === "SAVE20" || code === "FESTIVE20") {
        setAppliedCoupon(code);
        setCouponDiscount(20);
        setCouponSuccess("20% special discount applied!");
      } else {
        setCouponError(`Invalid or expired coupon code "${code}".`);
      }
    } catch {
      if (code === "WELCOME10" || code === "XELECTRON10" || code === "SAVE10") {
        setAppliedCoupon(code);
        setCouponDiscount(10);
        setCouponSuccess("10% discount applied successfully!");
      } else {
        setCouponError("Unable to validate coupon code. Please try again.");
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Place Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Your cart is empty. Add a product before placing an order.");
      return;
    }

    if (!firstName || !phone || !email || !addressLine1 || !city || !postalCode) {
      alert("Please fill in all required billing and address fields (*)");
      return;
    }

    if (createAccountOnCheckout && (!accountPassword || accountPassword.length < 6)) {
      alert("Please enter a password with at least 6 characters to create your account.");
      return;
    }

    setIsSubmitting(true);

    try {
      await trackCheckout();

      const fullAddress = [addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(", ") + ` [Payment: ${paymentMethod.toUpperCase()}]`;

      // ─── RAZORPAY PAYMENT FLOW ─────────────────────────────────────────────
      if (paymentMethod === "razorpay") {
        const createOrderRes = await fetch("/api/payment/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            receipt: `rcpt_${Date.now()}`,
            notes: {
              customerName: `${firstName} ${lastName}`.trim(),
              customerEmail: email,
              customerPhone: phone,
            },
          }),
        });

        const rzpOrderData = await createOrderRes.json();
        if (!rzpOrderData.success || !rzpOrderData.orderId) {
          throw new Error(rzpOrderData.error || "Failed to initialize Razorpay checkout");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Unable to load Razorpay SDK. Please check your internet connection.");
        }

        const options = {
          key: rzpOrderData.keyId,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency || "INR",
          name: "XElectron Technologies",
          description: `Order Payment (${orderItems.length} item${orderItems.length > 1 ? "s" : ""})`,
          order_id: rzpOrderData.orderId,
          prefill: {
            name: `${firstName} ${lastName}`.trim(),
            email: email,
            contact: phone,
          },
          theme: {
            color: "#0a7ae6",
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/payment/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: {
                    userId: currentUser?.id,
                    customerName: `${firstName} ${lastName}`.trim(),
                    customerEmail: email,
                    customerPhone: phone,
                    city,
                    state,
                    pincode: postalCode,
                    createAccount: !currentUser && createAccountOnCheckout,
                    password: accountPassword || undefined,
                    items: orderItems.map((item) => ({
                      productId: item.id,
                      quantity: item.quantity,
                      unitPrice: item.price,
                      price: item.price,
                    })),
                    total,
                    shippingAddress: fullAddress,
                    phone,
                    discountCode: appliedCoupon || undefined,
                  },
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                throw new Error(verifyData.error || "Payment verification failed");
              }

              const rawId = verifyData?.data?.id;
              const newOrderId = rawId
                ? `XE-${rawId.slice(-6).toUpperCase()}`
                : `XE-${Math.floor(100000 + Math.random() * 900000)}`;
              setOrderId(newOrderId);
              setPaidTotal(total);

              if (typeof window !== "undefined" && rawId) {
                try {
                  const existing = JSON.parse(localStorage.getItem("xelectron_guest_orders") || "[]");
                  if (!existing.includes(rawId)) {
                    existing.unshift(rawId);
                    localStorage.setItem("xelectron_guest_orders", JSON.stringify(existing.slice(0, 20)));
                  }
                } catch {}
              }

              if (checkoutSessionToken) {
                await fetch("/api/abandoned-checkouts/complete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sessionToken: checkoutSessionToken }),
                });
                window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
              }

              clearCart();
              setOrderComplete(true);
            } catch (err) {
              alert((err as Error).message || "Verification failed after payment.");
            } finally {
              setIsSubmitting(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          alert(`Payment failed: ${response.error?.description || "Transaction declined"}`);
          setIsSubmitting(false);
        });
        rzp.open();
        return;
      }

      // ─── VELOCITY BNPL / NO-COST EMI FLOW ──────────────────────────────────
      if (paymentMethod === "velocity") {
        const createVelRes = await fetch("/api/payment/velocity/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser?.id,
            customerName: `${firstName} ${lastName}`.trim(),
            customerEmail: email,
            customerPhone: phone,
            city,
            state,
            pincode: postalCode,
            addressLine1,
            addressLine2,
            createAccount: !currentUser && createAccountOnCheckout,
            password: accountPassword || undefined,
            items: orderItems.map((item) => ({
              productId: item.id,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              price: item.price,
            })),
            total,
            discountAmount,
            discountCode: appliedCoupon || undefined,
            shippingAddress: fullAddress,
            emiTenure: selectedEmiTenure,
          }),
        });

        const velData = await createVelRes.json();
        if (!velData.success || !velData.redirectUrl) {
          throw new Error(velData.error || "Failed to initialize Velocity EMI checkout");
        }

        if (checkoutSessionToken) {
          await fetch("/api/abandoned-checkouts/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken: checkoutSessionToken }),
          });
          window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
        }

        window.location.href = velData.redirectUrl;
        return;
      }

      // ─── CASH ON DELIVERY (COD) OTP VERIFICATION FLOW ──────────────────────
      if (paymentMethod === "cod") {
        setIsSubmitting(false);
        setIsCodOtpModalOpen(true);
        setCodOtp("");
        setOtpError("");
        await handleSendCodOtp();
        return;
      }
    } catch (error) {
      alert((error as Error).message || "Something went wrong while placing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Sends OTP to the customer's phone for COD confirmation
  const handleSendCodOtp = async () => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number in Billing details.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.error || "Failed to send verification OTP.");
        return;
      }
      setOtpCountdown(30);
      if (data.otp) {
        setDemoOtpHint(data.otp);
      }
    } catch {
      setOtpError("Network error while sending OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Executes the COD order persistence after OTP is verified
  const executeCodOrderPlacement = async () => {
    setIsSubmitting(true);
    try {
      await trackCheckout();
      const fullAddress = [addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(", ") + ` [Payment: COD Verified]`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          customerName: `${firstName} ${lastName}`.trim(),
          customerEmail: email,
          customerPhone: phone,
          city,
          state,
          pincode: postalCode,
          createAccount: !currentUser && createAccountOnCheckout,
          password: accountPassword || undefined,
          items: orderItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            price: item.price,
          })),
          total,
          shippingAddress: fullAddress,
          paymentMethod: "COD",
          phone,
          discountCode: appliedCoupon || undefined,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to place COD order");
      }

      const rawId = orderData?.data?.id;
      const newOrderId = rawId
        ? `XE-${rawId.slice(-6).toUpperCase()}`
        : `XE-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(newOrderId);
      setPaidTotal(total);

      // Save order id to localStorage so guests can track their orders without logging in
      if (typeof window !== "undefined" && rawId) {
        try {
          const existing = JSON.parse(localStorage.getItem("xelectron_guest_orders") || "[]");
          if (!existing.includes(rawId)) {
            existing.unshift(rawId);
            localStorage.setItem("xelectron_guest_orders", JSON.stringify(existing.slice(0, 20)));
          }
        } catch {}
      }

      if (checkoutSessionToken) {
        await fetch("/api/abandoned-checkouts/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: checkoutSessionToken }),
        });
        window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
      }

      clearCart();
      setOrderComplete(true);
    } catch (error) {
      alert((error as Error).message || "Something went wrong while placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles COD OTP verification submit
  const handleVerifyAndConfirmCodOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codOtp || codOtp.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: codOtp.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.error || "Incorrect OTP code. Please check and try again.");
        setIsVerifyingOtp(false);
        return;
      }

      setIsCodOtpModalOpen(false);
      await executeCodOrderPlacement();
    } catch (err) {
      setOtpError((err as Error).message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl sm:p-10">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <Check className="size-10 stroke-[2.5]" />
          </div>

          <span className="inline-block rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Order Confirmed
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Thank you for your order!
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Your order <strong className="text-slate-900 font-semibold">{orderId}</strong> has been successfully placed and is now being processed.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-900">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-200/60">
              <span className="text-slate-500 shrink-0">Shipping to:</span>
              <span className="font-medium text-slate-900 text-right">{[addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(", ")}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-semibold text-emerald-700">3 - 4 Business Days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Payment:</span>
              <span className="font-medium text-slate-900 uppercase">
                {paymentMethod === "razorpay" ? "Online (Razorpay Paid)" : "Cash on Delivery"}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-semibold text-slate-900">
              <span>Total Paid:</span>
              <span className="text-[#0a7ae6]">₹{paidTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="flex-1 rounded-xl bg-[#0a7ae6] py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-[#0a7ae6]/20 transition-all hover:bg-[#086ac9] flex items-center justify-center gap-2"
            >
              <Truck className="size-4" /> Track Shipment
            </Link>
            <Link
              href="/shop"
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (Must be evaluated first for SSR hydration parity)
  if (!isMounted || productParamLoading || isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0a7ae6]" />
      </div>
    );
  }

  // Empty cart guard (evaluated only once client is mounted)
  if (orderItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Package className="size-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 mb-6">Looks like you haven&apos;t added anything yet. Browse our products to find something you love!</p>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-xl bg-[#0a7ae6] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#0a7ae6]/20 hover:bg-[#086ac9] transition-all"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* ─── LEFT COLUMN: BILLING & ADDRESS DETAILS ─── */}
          <div className="lg:col-span-7 space-y-8">
            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[32px]">
                Billing details
              </h1>
            </div>

            {/* Coupon Card (Reference UI) */}
            <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:p-5">
              <label htmlFor="coupon-input" className="block text-xs sm:text-sm font-medium text-slate-600 mb-2.5">
                If you have a coupon code, please apply it below
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={Boolean(appliedCoupon)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15 disabled:bg-slate-100"
                  />
                </div>
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <X className="size-3.5" /> Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="inline-flex items-center justify-center rounded-xl bg-[#0a7ae6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0a7ae6]/15 transition-all hover:bg-[#086ac9] active:scale-98"
                  >
                    Apply coupon
                  </button>
                )}
              </div>

              {couponSuccess && (
                <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="size-3.5" /> {couponSuccess}
                </p>
              )}
              {couponError && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {couponError}
                </p>
              )}
            </div>

            {/* Billing Fields */}
            <div className="space-y-4">
              {/* First & Last Name - 2 per line */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>
              </div>

              {/* Phone & Email - 2 per line */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>
              </div>

              {/* State / Region Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State / Region <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  >
                    <option value="" disabled>Select your state</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-3.5 size-4 text-slate-400" />
                </div>
              </div>

              {/* Account Creation Option for Guests */}
              {!currentUser && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createAccountOnCheckout}
                      onChange={(e) => setCreateAccountOnCheckout(e.target.checked)}
                      className="mt-0.5 size-4.5 rounded border-slate-300 text-[#0a7ae6] focus:ring-[#0a7ae6] accent-[#0a7ae6]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Create an account while placing this order
                        </span>
                        <span className="text-[10px] font-semibold text-[#0a7ae6] bg-blue-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Track live delivery progress, access invoices, and enable instant product warranty.
                      </p>
                    </div>
                  </label>

                  {createAccountOnCheckout && (
                    <div className="pt-3 border-t border-blue-200/60 space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-semibold text-slate-700">
                        Set a Password for your account <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required={createAccountOnCheckout}
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="Choose password (6+ characters)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                      />
                      <p className="text-[11px] text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login?redirectTo=/checkout" className="font-bold text-[#0a7ae6] hover:underline">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-200/80" />

            {/* Address Information Section */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl mb-4">
                Address information
              </h2>

              {/* Ship to a different address checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group mb-5">
                <input
                  type="checkbox"
                  checked={shipToDifferent}
                  onChange={(e) => setShipToDifferent(e.target.checked)}
                  className="size-4.5 rounded border-slate-300 text-[#0a7ae6] focus:ring-[#0a7ae6] accent-[#0a7ae6]"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  Ship to a different address
                </span>
              </label>

              <div className="space-y-4">
                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street Address / House No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House number, apartment name, street"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>

                {/* Apartment / Landmark */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Apartment, suite, landmark (optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Near landmark or building wing"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>

                {/* City & PIN Code - 2 per line */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                    />
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Notes about your order, e.g. special delivery instructions."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/15"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: YOUR ORDER & PAYMENT METHOD ─── */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-slate-200/80 bg-[#f8fafc] p-6 sm:p-8 shadow-xs">
              {/* Order Heading */}
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl mb-6">
                Your order
              </h2>

              {/* Order Items */}
              <div className="divide-y divide-slate-200/80">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                        <Image
                          src={item.image || "/category-smartphone.png"}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-medium text-slate-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Summary */}
              <div className="mt-4 border-t border-slate-200/80 pt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({couponDiscount}%)</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-600">Free shipping</span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST (18% included)</span>
                  <span>₹{Math.round((total * 0.18) / 1.18).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between border-t border-slate-200/80 pt-3 text-base sm:text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#0a7ae6]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Method Section (Compact & Sleek) */}
              <div className="mt-6 border-t border-slate-200/80 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                    Payment Method
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="size-3 text-emerald-600" /> 100% Encrypted
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Razorpay Online (Instant UPI & Cards) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`w-full relative flex flex-col gap-2 rounded-xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                      paymentMethod === "razorpay"
                        ? "border-[#0a7ae6] bg-blue-50/40 text-slate-900 shadow-xs ring-1 ring-[#0a7ae6]/30"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-3.5 shrink-0 rounded-full border flex items-center justify-center ${
                          paymentMethod === "razorpay" ? "border-[#0a7ae6] bg-[#0a7ae6]" : "border-slate-300"
                        }`}>
                          {paymentMethod === "razorpay" && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Instant Online Payment
                          </span>
                          <span className="rounded-full bg-blue-100 text-[#0a7ae6] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            Fast & Safe
                          </span>
                        </div>
                      </div>
                      <RazorpayLogo className="h-4 w-auto shrink-0" />
                    </div>

                    {/* Compact Single-Row Logo Badges */}
                    <div className="flex items-center justify-start gap-1 sm:gap-1.5 pl-6 overflow-x-auto no-scrollbar">
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <UpiLogo className="h-2.5 w-auto" />
                      </div>
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <GPayLogo className="h-2.5 w-auto" />
                      </div>
                      <div className="flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <PhonePeLogo className="h-2.5 w-2.5" />
                        <span className="text-[8.5px] font-bold text-[#5F259F]">PhonePe</span>
                      </div>
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <PaytmLogo className="h-2 w-auto" />
                      </div>
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <VisaLogo className="h-2 w-auto" />
                      </div>
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <MastercardLogo className="h-2.5 w-auto" />
                      </div>
                      <div className="flex h-5 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-2xs shrink-0">
                        <RuPayLogo className="h-2 w-auto" />
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Velocity No-Cost EMI / Pay Later (Simple & Clean) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("velocity")}
                    className={`w-full relative flex flex-col gap-1.5 rounded-xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                      paymentMethod === "velocity"
                        ? "border-[#0a7ae6] bg-blue-50/40 text-slate-900 shadow-xs ring-1 ring-[#0a7ae6]/30"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-3.5 shrink-0 rounded-full border flex items-center justify-center ${
                          paymentMethod === "velocity" ? "border-[#0a7ae6] bg-[#0a7ae6]" : "border-slate-300"
                        }`}>
                          {paymentMethod === "velocity" && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            No-Cost EMI / Pay Later
                          </span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            0% Interest
                          </span>
                        </div>
                      </div>
                      <VelocityLogo className="h-4 w-auto shrink-0" />
                    </div>

                    <div className="flex items-center justify-between pl-6 text-[11px] text-slate-500">
                      <span>{selectedEmiTenure}-month preference • plans from 3 to 12 months</span>
                      <span className="font-bold text-[#0a7ae6]">
                        ₹{Math.ceil(total / selectedEmiTenure).toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                  </button>

                  {/* Option 3: Cash on Delivery (Compact) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`w-full relative flex flex-col gap-2 rounded-xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-[#0a7ae6] bg-blue-50/40 text-slate-900 shadow-xs ring-1 ring-[#0a7ae6]/30"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-3.5 shrink-0 rounded-full border flex items-center justify-center ${
                          paymentMethod === "cod" ? "border-[#0a7ae6] bg-[#0a7ae6]" : "border-slate-300"
                        }`}>
                          {paymentMethod === "cod" && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Cash on Delivery (COD)
                          </span>
                          <span className="rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                      </div>
                      <Truck className="size-4 text-slate-500 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between pl-6 text-[11px] text-slate-500">
                      <span>Pay via Cash or UPI QR at doorstep</span>
                      <span className="font-semibold text-slate-500">OTP Confirmed</span>
                    </div>
                  </button>
                </div>

                {/* Compact Razorpay Security Line */}
                {paymentMethod === "razorpay" && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-1.5 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      Instant UPI, Cards, NetBanking & Wallets
                    </span>
                    <span className="font-bold text-emerald-700">Zero Extra Fees</span>
                  </div>
                )}

                {/* Compact Velocity EMI Information Line */}
                {paymentMethod === "velocity" && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-sky-50/70 border border-sky-100 px-3 py-1.5 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="size-3 text-[#0a7ae6]" />
                      Your {selectedEmiTenure}-month EMI preference will be sent to Velocity
                    </span>
                    <span className="font-bold text-[#0a7ae6]">No Hidden Charges</span>
                  </div>
                )}

                {/* Compact COD Information Line */}
                {paymentMethod === "cod" && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className="size-3 text-emerald-600" />
                      Pay via Cash or delivery partner UPI QR
                    </span>
                    <span className="font-semibold text-slate-500">Doorstep</span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] py-3.5 text-center text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0a7ae6]/25 transition-all hover:bg-[#086ac9] hover:shadow-xl active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Lock className="size-4" />
                    <span>
                      {paymentMethod === "razorpay"
                        ? `Pay with Razorpay • ₹${total.toLocaleString("en-IN")}`
                        : paymentMethod === "velocity"
                        ? `Proceed to No-Cost EMI • ₹${total.toLocaleString("en-IN")}`
                        : `Confirm COD Order • ₹${total.toLocaleString("en-IN")}`}
                    </span>
                  </>
                )}
              </button>

              {paymentMethod !== "cod" && (
                <p className="mt-2.5 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" /> Secured by 256-Bit SSL • RBI & PCI-DSS Compliant
                </p>
              )}

              {/* Trust Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-4 text-center text-[10px] sm:text-[11px] text-slate-500">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="size-4 text-slate-600 mb-1" />
                  <span>256-Bit SSL</span>
                </div>
                <div className="flex flex-col items-center">
                  <Package className="size-4 text-slate-600 mb-1" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="size-4 text-slate-600 mb-1" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* ─── CASH ON DELIVERY OTP VERIFICATION MODAL (COMPACT & SLEEK) ───── */}
      {isCodOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-[390px] rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100 text-left space-y-4">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsCodOtpModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pr-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6]">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Verify COD Order
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Code sent to <span className="font-semibold text-slate-800">+91 {phone.replace(/[^0-9]/g, "")}</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleVerifyAndConfirmCodOrder} className="space-y-3 pt-1">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={codOtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCodOtp(val);
                    setOtpError("");
                  }}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-[#0a7ae6] focus:ring-2 focus:ring-[#0a7ae6]/15 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300 placeholder:text-sm"
                />
              </div>

              {otpError && (
                <div className="rounded-lg bg-red-50 border border-red-200/80 px-3 py-1.5 text-[11px] text-red-600 flex items-center gap-1.5">
                  <X className="size-3.5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {demoOtpHint && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[11px] text-emerald-800">
                  <span>💡 Test OTP: <strong className="font-mono">{demoOtpHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setCodOtp(demoOtpHint);
                      setOtpError("");
                    }}
                    className="font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Resend OTP Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                <span>Didn&apos;t get SMS?</span>
                {otpCountdown > 0 ? (
                  <span className="font-medium text-slate-400">
                    Resend in {otpCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleSendCodOtp}
                    className="font-bold text-[#0a7ae6] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <RefreshCw className="size-2.5 animate-spin" />
                    ) : (
                      "Resend Code"
                    )}
                  </button>
                )}
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || isSubmitting || codOtp.length < 6}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#0a7ae6]/20 transition-all hover:bg-[#086ac9] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerifyingOtp || isSubmitting ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Confirm COD Order • ₹{total.toLocaleString("en-IN")}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCodOtpModalOpen(false)}
                  className="w-full text-center text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Change Mobile Number / Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </>
  );
}
