# Customer checkout and admin API contract

Base URL: `/api/v1`. Authentication is a server-managed HttpOnly session.
Every endpoint below must enforce authorization in Spring Boot.

## Customer orders and manual payment

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/orders` | Create pending order from product IDs |
| GET | `/orders/me?page=0&size=10` | Customer's own order history |
| GET | `/orders/me/{orderId}` | One order belonging to the current customer |
| POST | `/orders/{orderId}/payment-submission` | Submit required UTR and optional screenshot |
| POST | `/orders/{orderId}/items/{productId}/download` | Request short-lived download URL for paid item |

The create-order request contains product IDs only. The backend must fetch current
published product prices, reject unavailable products, and snapshot title, product
ID and price into immutable order items. Never accept totals or prices from the browser.

Payment submission uses multipart form data:
- `utrReference`: required transaction reference
- `screenshot`: optional PNG/JPEG/WebP, maximum 5 MB

A submitted reference moves the order to `PAYMENT_UNDER_REVIEW`; it does not mark
the order paid. Only an authorized admin's server-side verification changes the
payment/order to paid and unlocks downloads. Rejections must retain an audit trail.
Notify the customer by email after verification/rejection.

Download endpoint returns a short-lived signed URL. Check ownership and paid status
on every request. Never expose private storage keys or permanent public URLs.

## Admin

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Summary counts |
| GET | `/admin/payments/pending` | Pending manual payment submissions |
| POST | `/admin/payments/{paymentId}/approve` | Verify payment |
| POST | `/admin/payments/{paymentId}/reject` | Reject payment |

Further product-management endpoints to implement:
- `POST /admin/products` create draft metadata
- `POST /admin/products/{id}/files` upload PDF/PPT to private storage
- `POST /admin/products/{id}/publish` publish after validation
- `PATCH /admin/products/{id}` update metadata
- `POST /admin/products/{id}/versions` add correction version
- `GET /admin/products` list and filter all products

## Security and audit requirements

- Customer routes must only return records owned by the current authenticated user.
- Admin endpoints require the ADMIN role on the server, not merely a frontend guard.
- Verify payments against the bank/account record; never trust screenshots alone.
- Record admin ID, timestamp, decision, reference and reason for every review.
- Use private storage and short-lived download links.
- Validate file extension, MIME type, size and actual file signature.
- Use CSRF protection for cookie-authenticated state-changing requests.
- Apply request rate limits and structured audit logging.
