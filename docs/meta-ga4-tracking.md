# Meta Pixel + CAPI and GA4 ecommerce tracking

How the storefront reports the ecommerce funnel to Meta and Google Analytics 4, where the code lives, what must be configured outside the repo, and how to verify it.

## Architecture

| Layer | Responsibility | Code |
| --- | --- | --- |
| GA4 (browser) | Push Google-recommended ecommerce events to `dataLayer`. GTM container `GTM-NB43H649` maps them to GA4 Web Stream `G-85W9EGF2W1`. | `lib/analytics.ts` |
| Meta Pixel (browser) | Fire the standard event with an `eventID`, then relay the same `event_id` to our backend. | `lib/meta-pixel.ts` |
| Meta CAPI relay | First-party endpoint that validates the browser payload, rebuilds product data from the catalog, adds the session user (hashed) and browser signals, and POSTs to Meta. | `app/api/meta/events/route.ts`, `lib/server/meta-capi.ts` |
| Meta Purchase | Sent only from verified order state (captured Razorpay payment, signed Velocity webhook or verify-session, COD placement) with event id `purchase_<orderId>`. The browser fires its copy with the same id. | `lib/server/meta-purchase.ts` |
| GA4 Measurement Protocol | Server-side `refund` when an admin cancels a paid online order. Nothing else is sent server-side, so browser events are never duplicated. | `lib/server/ga4-measurement-protocol.ts` |

Every GA4 ecommerce event that has a Meta equivalent is mirrored automatically by `trackEcommerce`, so call sites do not change:

| Trigger | GA4 event | Meta event |
| --- | --- | --- |
| Route view (initial + SPA navigation) | `page_view` | `PageView` |
| Product card visible / clicked | `view_item_list`, `select_item` | – |
| Product detail loaded | `view_item` | `ViewContent` |
| Search drawer query settled | `search` | `Search` |
| Wishlist add committed | `add_to_wishlist` | `AddToWishlist` |
| Cart add / remove committed | `add_to_cart`, `remove_from_cart` | `AddToCart` |
| Cart drawer opened | `view_cart` | – |
| Checkout page ready with a valid cart | `begin_checkout` | `InitiateCheckout` |
| Address / payment accepted on submit | `add_shipping_info`, `add_payment_info` | `AddPaymentInfo` |
| Order confirmed | `purchase` | `Purchase` (server + browser, same id) |
| Admin cancels a paid online order | `refund` (server) | – |
| Login / signup succeeds | `login`, `sign_up` | – |

## Environment variables (server only unless prefixed `NEXT_PUBLIC_`)

```
NEXT_PUBLIC_META_PIXEL_ID=583156327630440
META_PIXEL_ID=583156327630440
META_CAPI_ACCESS_TOKEN=<secret>
META_GRAPH_API_VERSION=v26.0
META_TEST_EVENT_CODE=            # set only while testing in Events Manager
GA4_MEASUREMENT_ID=G-85W9EGF2W1
GA4_API_SECRET=<secret>
GA4_MP_DEBUG=                    # 1 = send refunds to Google's validation endpoint and log the result
SITE_URL=https://www.xelectron.com
```

Leaving `META_CAPI_ACCESS_TOKEN` empty disables the relay and server Purchase; leaving `NEXT_PUBLIC_META_PIXEL_ID` empty disables the browser pixel.

## GTM configuration (outside the repo)

1. Google tag with Measurement ID `G-85W9EGF2W1`.
2. One GA4 Event tag per dataLayer event listed above, trigger = Custom Event with the same name, reading the `ecommerce` object.
3. Do not add a Meta Pixel tag in GTM. The pixel is loaded and fired from application code; a second base pixel would double-count every event.
4. If Enhanced Measurement site search is on, confirm `view_search_results` and our `search` event are not both counted in reports.

## QA checklist

- Meta Events Manager → Test Events: set `META_TEST_EVENT_CODE`, browse product → cart → checkout → order. Each event should show Browser and Server rows that deduplicate; Purchase should appear once per order with `purchase_<orderId>`.
- Event Match Quality: logged-in sessions send hashed email, phone, name and external_id; Purchase adds hashed city, state, pincode and country from the order.
- GTM Preview + GA4 DebugView: each action fires its tag exactly once; `purchase` uses the order id as `transaction_id`, and refreshing the confirmation page does not resend it.
- Refund: cancel a paid online order from the dashboard; with `GA4_MP_DEBUG=1` the server log shows Google's validation response.
- Clear `META_TEST_EVENT_CODE` before going to production.
