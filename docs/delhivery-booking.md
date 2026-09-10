# Delhivery delivery booking

The order dashboard now manifests a single packed box through `/api/cmu/create.json` and separately requests pickup through `/fm/request/new/`. Both actions require an admin session. Payment collection is determined from the saved order: verified payments are prepaid, unverified COD orders collect the saved total, and unverified online payments cannot ship.

## Setup

- Configure `DELHIVERY_API_TOKEN`. `DELHIVERY_ENVIRONMENT=staging` selects the test API; otherwise the production API is used.
- Set `DELHIVERY_PICKUP_LOCATION` to the exact registered warehouse name to prefill new bookings. Restart the server after changing environment variables. If it is unset, the form uses the most recent successfully manifested shipment's location in the current environment. Rejected warehouse names are never used as defaults.
- Run `npm run db:delivery` against each database before deploying this code. This adds only the nullable `orders.delivery_booking` column. Run `npm run db:generate` to regenerate Prisma.
- Register a pickup location in Delhivery One and ensure the account has the required shipping permissions and wallet balance.

## Use

Open an order's Delivery & fulfillment panel. Enter the exact registered warehouse name, packed weight in grams, dimensions in centimetres, and shipping service. Supply GST/HSN details unless already configured with Delhivery, and an e-waybill for values above ₹50,000. Create the shipment, then select a future pickup date and time in IST. Print the label from Delhivery One. Look for the saved AWB under Orders and the pickup ID under Pickup Requests.

This flow supports one box per order. Multiple products may share that box. Split shipments require separate booking support.

## Failure handling

An atomic database claim prevents concurrent requests for the same order. Confirmed carrier rejections may be corrected and retried. A pickup rejection leaves the manifested shipment intact. Timeouts and ambiguous responses persist an unknown state and prevent resubmission: check the full order reference in Delhivery One and manage the shipment/pickup there. Do not clear the saved booking or generate a second shipment to resolve a timeout. Cancellation and pickup changes are managed in Delhivery One.

Run `npm run test:delivery` for mocked API/domain tests. These tests do not book live shipments. Live shipment acceptance still depends on account permissions and the supplied warehouse and parcel details.

References: [Shipment API](https://delhivery-express-api-doc.readme.io/reference/order-creation-api), [Pickup API](https://delhivery-express-api-doc.readme.io/reference/testpickup-request), [Pickup dashboard](https://help.delhivery.com/docs/pickup-request).
