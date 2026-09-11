import React from "react";

/** Official Razorpay Logo (Brand Mark + Wordmark) */
export function RazorpayLogo({ className = "h-4" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/razorpay.svg"
      alt="Razorpay"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official NPCI UPI Logo */
export function UpiLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/upi.svg"
      alt="UPI"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official Google Pay Logo */
export function GPayLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/gpay.svg"
      alt="Google Pay"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official PhonePe Logo */
export function PhonePeLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/phonepe.svg"
      alt="PhonePe"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official Paytm Logo */
export function PaytmLogo({ className = "h-3" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/paytm.svg"
      alt="Paytm"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official Visa Logo */
export function VisaLogo({ className = "h-3" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/visa.svg"
      alt="Visa"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official Mastercard Logo */
export function MastercardLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/mastercard.svg"
      alt="Mastercard"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official RuPay Logo */
export function RuPayLogo({ className = "h-3" }: { className?: string }) {
  return (
    <img
      src="/payment-logos/rupay.svg"
      alt="RuPay"
      className={`w-auto object-contain shrink-0 select-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}

/** Official Velocity BNPL Logo */
export function VelocityLogo({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0">
        <rect width="24" height="24" rx="6" fill="#0A0E1A" />
        <path
          d="M6 7L12 17L18 7H14.5L12 12.5L9.5 7H6Z"
          fill="#38BDF8"
        />
      </svg>
      <span className="font-extrabold tracking-tight text-[#0A0E1A] text-[13px] sm:text-[14px] leading-none">
        Velocity
      </span>
    </div>
  );
}
