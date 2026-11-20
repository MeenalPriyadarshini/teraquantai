# Stage 4–5 implementation notes

## Stage 4 — API and data contracts

Base API prefix: `/api/v1`. Money is represented as integer paise in INR.
Authentication uses a server-managed HttpOnly session cookie.

- Authentication: `auth-api-contract.md`
- Customer orders and manual payment: `customer-admin-api-contract.md`
- Catalogue: `frontend-api-contract.md`

Core entities: User, Category, Product, ProductVersion, CustomerOrder,
OrderItem, Payment, AuthToken, DownloadLog and NotificationOutbox.

A forecast period is a product identity. A correction is a new ProductVersion
for that product. OrderItem snapshots product title and price at order time.
Report storage keys are private and never returned by public catalogue APIs.

## Stage 5 — Spring Boot and PostgreSQL foundation

The backend uses Java 17, Spring Boot 3.5, PostgreSQL and Flyway. Implemented
routes:

- `GET /api/v1/health`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{slug}`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/email/verify`
- `POST /api/v1/auth/email/verification/resend`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`
- `POST /api/v1/orders`
- `GET /api/v1/orders/me`
- `GET /api/v1/orders/me/{orderId}`

The initial migration creates user/auth, catalogue, product version, order,
payment, download-log and notification-outbox tables.

### Explicit remaining boundaries

- SMTP delivery must replace development-only token URL logging.
- CSRF token bootstrap/header handling must be tested with Angular before
  enabling cookie-authenticated writes in production.
- Catalogue mock mode stays enabled until product detail payload mapping is
  complete.
- Admin payment review, payment submission, private file storage and downloads
  are not yet implemented.
- No actual payment is accepted and no report download is unlocked by this
  foundation.
