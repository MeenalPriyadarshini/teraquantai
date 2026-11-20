# TerraQuantAI backend

Spring Boot 3.5 / Java 17 modular-monolith foundation. PostgreSQL is the source
of truth; Flyway owns schema changes. The API listens on port 8081.

## Local setup

1. Install JDK 17+ and Gradle 8.14+ (or use a Gradle wrapper if added).
2. From the repository root, copy the environment template and start PostgreSQL:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
```

3. Set backend environment variables in PowerShell:

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/teraquantai"
$env:DATABASE_USERNAME="tq_user"
$env:DATABASE_PASSWORD="change_me_locally"
$env:FRONTEND_URL="http://localhost:4200"
# Optional first-admin bootstrap. Use a unique password of at least 12 characters.
$env:ADMIN_EMAIL="your-admin-email@example.com"
$env:ADMIN_PASSWORD="replace-with-a-strong-local-password"
```

4. From this directory run `gradle bootRun`.
5. Check `http://localhost:8081/api/v1/health`.

The initial Flyway migration creates users, hashed one-time auth tokens,
categories, products, report versions, orders, order items, manual payments,
download logs and a notification outbox.

## Implemented in this foundation

- PostgreSQL + Flyway schema migration
- BCrypt password hashing and server-managed session authentication
- registration, login, current session, logout, email verification token,
  resend verification, forgot password and reset password API routes
- public category and product read endpoints
- customer order creation and order-history endpoints
- optional first-admin bootstrap from environment variables

## Not implemented yet

Local development verification/reset links are logged to the backend console;
SMTP email delivery must be connected before production. Payment submission,
admin payment approval/rejection, private report storage, secure downloads,
product management and customer notifications are the next implementation
work. Do not deploy the development token-link logging mode.

Never mark an order paid from a browser request. Payment verification must be
performed by an authorized administrator after checking the actual account
transaction, with an audit trail.
