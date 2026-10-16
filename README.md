This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Password recovery email checks

Password recovery uses the shared Nodemailer SMTP transport. Configure `SMTP_HOST`, `SMTP_PORT` (465 for implicit TLS, or 587 for STARTTLS), `SMTP_USER`, `SMTP_PASS`, and `SMTP_SECURE` (`false` for port 587 with STARTTLS, `true` for port 465). The sender is always the authenticated `SMTP_USER` email address; `SMTP_FROM` is ignored. Set `NEXT_PUBLIC_APP_URL` to your public HTTPS storefront origin for reset links.

On the VPS, run `node scripts/check-smtp.cjs` from the project directory to check DNS, connection, TLS and authentication without sending mail. Then request a reset for your own registered account and check the inbox and spam folder. Local SMTP verification does not verify the VPS network, sender acceptance, or inbox placement.

SMTP rejection now produces an error instead of a false success page and removes the unusable reset token. Unknown account emails retain a generic response. For delivery failures, inspect application logs for `Failed to send email via SMTP` and `Password recovery unavailable`; verify the VPS environment, outbound SMTP access, and sender authorization with your mail provider.

Regression checks: `node --test --test-isolation=none scripts/test-password-reset-mail.cjs`.

## SMS templates and notifications

All 21 approved XELECT messages and their IDs are stored in `lib/server/sms/templates.ts`. Checkout OTP uses the mobile-verification template, independently of the legacy `SMSALERT_TEMPLATE_ID`. Keep `SMSALERT_API_KEY` and `SMSALERT_SENDER_ID=XELECT` in the server environment. Each notification supplies its own template ID and exact message text. Signup and password recovery remain email-based; account/login/password OTP templates are available for future verified SMS authentication flows, not triggered by the existing email routes.

Before starting the updated application on **each deployment database**, run `npm run db:sms`, then `npm run build` and restart the application. The additive setup creates `sms_notifications`; notification errors never roll back orders. It has been run against the development environment's configured database, not independently verified on the VPS. Deploy the new scripts along with the application.

Automatic notifications: paid orders (Razorpay verification/signed webhooks, Velocity confirmation), COD placement, changed admin order statuses, shipment processing, contact/repair requests and warranty registration. Paid/COD confirmation replaces a redundant order-received SMS. Razorpay refund SMS requires a signed `refund.created` or `refund.processed` webhook matched to the original payment; subscribe to those events in Razorpay. Cancellation alone never claims a refund was initiated. Payment-failure notifications require an existing unpaid order that can be matched to the verified event; no message is fabricated for unmatched checkout attempts.

Support Requests has staff actions for service-update SMS and warranty-service registration linked to an order belonging to the same phone number. Each action sends once per request/order. Account/login/password OTP templates are intentionally not exposed as arbitrary staff-send actions.

Courier events are checked when authorized users view tracking, and can also be polled. Set a long random `SMS_SYNC_SECRET` and `SMS_SYNC_URL` to the application's canonical origin (no redirects). Run `node scripts/sync-sms-courier.cjs` on the VPS; it pages through active tracked orders. For unattended operation, configure the VPS scheduler to run it every five minutes from `/var/www/xelectron`. No scheduler is installed automatically. Known forward-delivery states map to shipped, out-for-delivery, delivered, failed or rescheduled; unknown/return states are skipped. These messages are sent once per order/event, not on every poll.

`sms_notifications` records `SENDING`, `ACCEPTED` or `REVIEW`, with the provider batch ID. ACCEPTED means provider acceptance, not handset delivery; use SMS Alert's delivery report to confirm delivery. Ambiguous failures and interrupted sends are not automatically replayed. After checking the provider report, an authenticated admin may POST `{ "key": "the event_key", "confirmedNotDelivered": true }` to `/api/admin/sms/retry` for a REVIEW record or SENDING record older than 15 minutes. Already accepted records cannot be retried through this endpoint. Review the event's current relevance before resending old messages.

Verification without sending SMS: `node --test --test-isolation=none scripts/test-sms-templates.cjs`.

## Order discount breakdown

Before deploying the order pricing changes against a different database, run `npm run db:order-pricing` with that environment's `DATABASE_URL`, then build and restart the app. This adds the nullable `orders.pricing_summary` JSONB column without changing existing orders. The configured database has already been initialized during development. Prisma generation runs automatically before development and builds.

New orders store the item subtotal, actual checkout discount, coupon code and coupon definition at creation time. The amount comes from saved item prices and the order total; it does not recalculate or change the amount paid. Checkout currently offers free shipping. Active Deal of the Day savings are captured only when the saved item price matches the deal price, relative to the product's regular selling price. The admin card adds these savings back to its displayed subtotal and deducts them once as a separate Deal of the Day discount row. Coupon discounts are labelled with their code, rather than percentage/fixed amount categories. Older snapshots without deal savings are left unchanged.

Historical orders show a calculated breakdown and identify missing coupon types and shipping details as unrecorded. Original coupon details cannot be recovered reliably from today's discount settings, so historical orders are not backfilled. A positive difference above the item subtotal is shown as additional charges with an unknown breakdown.

Regression checks: `node --test --test-isolation=none scripts/test-order-pricing.cjs`.
