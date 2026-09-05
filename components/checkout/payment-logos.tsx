import React from "react";

/** Official Razorpay Logo Mark & Wordmark */
export function RazorpayLogo({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        <path
          d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"
          fill="#0A7AE6"
        />
      </svg>
      <span className="font-extrabold tracking-tight text-[#0C2340] text-[13px] sm:text-[14px] leading-none">
        Razorpay
      </span>
    </div>
  );
}

/** Official NPCI UPI Logo */
export function UpiLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12.5 1.5L6.5 16.5H0.5L6.5 1.5H12.5Z" fill="#097939" />
      <path d="M17.5 1.5L11.5 16.5H5.5L11.5 1.5H17.5Z" fill="#ED7524" />
      <text
        x="19.5"
        y="14"
        fill="#263238"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="13.5"
        fontStyle="italic"
      >
        UPI
      </text>
    </svg>
  );
}

/** Official Google Pay Logo */
export function GPayLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M10.8 9.1c0-.35-.03-.68-.08-.98H6.5v1.85h2.41c-.1.56-.42 1.04-.91 1.36v1.13h1.47c.86-.79 1.33-1.96 1.33-3.36z"
        fill="#4285F4"
      />
      <path
        d="M6.5 13.5c1.22 0 2.24-.4 2.99-1.09l-1.47-1.13c-.4.27-.92.43-1.52.43-1.17 0-2.16-.79-2.52-1.85H2.47v1.17C3.23 12.53 4.77 13.5 6.5 13.5z"
        fill="#34A853"
      />
      <path
        d="M3.98 9.86c-.1-.27-.15-.56-.15-.86 0-.3.05-.59.15-.86V7.0H2.47C2.16 7.62 2 8.3 2 9s.16 1.38.47 2l1.51-1.14z"
        fill="#FBBC04"
      />
      <path
        d="M6.5 6.22c.66 0 1.26.23 1.73.67l1.3-1.3C8.74 4.86 7.71 4.5 6.5 4.5 4.77 4.5 3.23 5.47 2.47 6.99L3.98 8.16c.36-1.06 1.35-1.94 2.52-1.94z"
        fill="#EA4335"
      />
      <text
        x="13.5"
        y="13"
        fill="#5F6368"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fontSize="10"
      >
        Pay
      </text>
    </svg>
  );
}

/** Official PhonePe Logo */
export function PhonePeLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="18" height="18" rx="9" fill="#5F259F" />
      <path
        d="M12.2 7.2c-.3-.5-.7-.7-1.3-.7H8.8v4.2h1.3V9.2h.9c.4 0 .7-.2.8-.6l.4-.9zm-2.1.8h-.8V7.1h.8c.3 0 .4.1.4.3 0 .3-.1.4-.4.8z"
        fill="#FFFFFF"
      />
      <path d="M7.8 4.6h3.4v1.1H9.4v7.4H7.8V4.6z" fill="#FFFFFF" />
      <path d="M10.2 10.8l2.5 3.5h-1.7l-1.8-2.7 1-.8z" fill="#FFFFFF" />
      <text
        x="22"
        y="13.5"
        fill="#5F259F"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="10.5"
      >
        PhonePe
      </text>
    </svg>
  );
}

/** Official Paytm Logo */
export function PaytmLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text
        x="0"
        y="13"
        fill="#002970"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="13"
      >
        Pay
      </text>
      <text
        x="24"
        y="13"
        fill="#00BAF2"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="13"
      >
        tm
      </text>
    </svg>
  );
}

/** Official Visa Logo */
export function VisaLogo({ className = "h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M15.2 1.2L11 11.8H8.3L5.1 3.5c-.2-.7-.4-.9-.9-1.2C3.4 1.9 2 1.5 0.8 1.3l.1-.4h6.8c.9 0 1.7.6 1.9 1.6l1.6 8.7L14.7 1.2h2.5zm11.7 7.2c0-2.8-3.9-3-3.8-4.2 0-.4.4-.8 1.3-.9.4 0 1.7-.1 3.1.6l.5-2.5c-.8-.3-1.8-.5-3.1-.5-3.3 0-5.6 1.7-5.6 4.2 0 1.8 1.6 2.8 2.9 3.4 1.2.6 1.7 1 1.7 1.5 0 .8-1 1.2-1.9 1.2-1.6 0-2.5-.2-3.8-.8l-.5 2.6c.7.3 2 .6 3.4.6 3.5 0 5.9-1.7 5.9-4.7zm8.4 3.4h2.4L35.6 1.2h-2.2c-.7 0-1.3.4-1.5 1l-4.4 9.6h2.8l.6-1.5h3.4l.4 1.5zm-3-3.6l1.4-3.8.8 3.8h-2.2zM21.5 1.2l-2.2 10.6h-2.7l2.2-10.6h2.7z"
        fill="#1434CB"
      />
    </svg>
  );
}

/** Official Mastercard Logo */
export function MastercardLogo({ className = "h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="9" cy="9" r="8" fill="#EB001B" />
      <circle cx="19" cy="9" r="8" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

/** Official RuPay Logo */
export function RuPayLogo({ className = "h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text
        x="0"
        y="12"
        fill="#097939"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="12"
      >
        Ru
      </text>
      <text
        x="18"
        y="12"
        fill="#0075C9"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="12"
      >
        Pay
      </text>
      <path d="M42 2L46 7L42 12H38L42 7L38 2H42Z" fill="#ED7524" />
    </svg>
  );
}

/** Official Velocity BNPL Logo */
export function VelocityLogo({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
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
