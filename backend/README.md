# TerraQuantAI backend

Spring Boot 3.5 / Java 17 modular-monolith foundation. PostgreSQL is the source
of truth; Flyway owns schema changes. The API listens on port 8081.

## Local setup (Windows PowerShell)

1. Install JDK 17+ and Gradle 8.14+.
2. From the repository root, create your private environment file once:

```powershell
Copy-Item .env.example .env
```

3. Open `.env` and replace the local database placeholder values. Keep this
file private and never commit it. The default PostgreSQL host port is 5433.
4. Start the complete local development stack and backend:

```powershell
.\start-backend.ps1
```

The script starts PostgreSQL and Mailpit, waits for PostgreSQL, loads values
from `.env`, and runs Spring Boot. Keep this terminal open while developing.
Stop the backend with Ctrl+C. Docker Desktop must be running.

- API health: http://localhost:8081/api/v1/health
- Mailpit inbox: http://localhost:8025
- PostgreSQL host port: 5433

Mailpit is a local email-capture service: verification/reset emails appear in
its web inbox and are not sent to real recipients. For a real SMTP provider,
set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
`MAIL_FROM`, `MAIL_AUTH`, and `MAIL_STARTTLS` in your private `.env`.

## Implemented

- PostgreSQL + Flyway schema migration
- BCrypt password hashing and server-managed session authentication
- registration, login, current session, logout, email verification, resend,
  forgot-password and reset-password API routes
- Verification and password-reset messages sent through Spring Mail
- Local Mailpit email testing via Docker Compose
- Public category and product read endpoints
- Customer order creation and order-history endpoints
- Optional first-admin bootstrap from environment variables
- Private local report storage service with opaque keys, extension and size
  checks; storage directory is outside the frontend public assets
- Notification outbox service for durable notification events

## Important boundaries

- The private storage and notification services are foundations only. Admin
  upload, file download authorization, payment review and outbox delivery
  worker/API endpoints are not yet implemented.
- File extension checks are not a substitute for production malware scanning
  and content-signature validation.
- Do not expose storage keys or the storage directory through public APIs.
- CSRF token bootstrap/header handling must be tested with Angular before
  enabling cookie-authenticated writes in production.
- Never mark an order paid from a browser request. Payment verification must
  be performed by an authorized administrator after checking the actual
  account transaction, with an audit trail.
- Do not deploy until real SMTP, secure production storage, HTTPS, secret
  management, rate limiting and operational monitoring are configured.
