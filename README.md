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
