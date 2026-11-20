# Authentication API contract

This document defines the endpoints expected by the Angular authentication
screens. The endpoints are not implemented by the frontend commit; Spring Boot
must implement them before real registration, verification, login or reset
flows can work.

Base prefix: `/api/v1`

## Session and account

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create customer account and send verification email |
| POST | `/auth/login` | Authenticate email/password and set server session cookie |
| GET | `/auth/me` | Return current session user |
| POST | `/auth/logout` | Invalidate server session and clear cookie |

Login and `/auth/me` return `{ "user": { "id", "email", "displayName", "emailVerified", "role" } }`.
The role is `CUSTOMER` or `ADMIN`. Registration must never accept a role from
the client; new registrations are always customers.

## Email verification

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/email/verify` | Verify email using one-time token in request body |
| POST | `/auth/email/verification/resend` | Resend verification message |

Verification tokens must be random, single-use, expire, and be stored hashed.
Do not reveal whether an email address belongs to an account in resend/reset
responses.

## Password reset

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/password/forgot` | Request reset email |
| POST | `/auth/password/reset` | Reset password using one-time token |

Use short-lived, single-use, hashed reset tokens. Return generic success
messages to avoid account enumeration.

## Security requirements

- Store passwords using a modern adaptive password hash (e.g. Argon2id or
  BCrypt with an appropriate work factor); never store plaintext passwords.
- Use server-managed sessions in Secure, HttpOnly cookies. Do not return
  session identifiers in JSON and do not store bearer tokens in browser storage.
- Configure SameSite appropriately for the deployment topology and enforce
  CSRF protection for state-changing cookie-authenticated requests.
- Enforce email verification before allowing customer purchases.
- Apply rate limits to login, registration, verification resend and reset flows.
- Validate permissions on every backend endpoint. Frontend guards are only a
  navigation aid and are not an authorization boundary.
- Admin accounts are provisioned securely by the application owner; public
  registration cannot create an admin.
- Return useful validation errors without leaking account existence or secrets.
