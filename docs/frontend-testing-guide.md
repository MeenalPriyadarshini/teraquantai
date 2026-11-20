# TerraQuantAI frontend test guide

## Start the application

Open two PowerShell terminals.

Terminal 1 (Spring Boot backend, once implemented):
```powershell
cd backend
.gradlew bootRun
```
The planned local backend port is 8081. At this point the backend source is not
implemented, so this command will not work until that stage is complete.

Terminal 2 (Angular frontend):
```powershell
cd frontend
npm install
npm start
```
Angular runs at http://localhost:4200. The dev server proxies `/api/**` to
http://localhost:8081. Until the backend exists, API-dependent actions should
show a clear server/API unavailable message.

## Test now: frontend-only checks

| Page | Test | Expected result at this stage |
|---|---|---|
| `/` | Open home | Existing approved design renders |
| `/solutions` | Search and filter catalogue | Existing product cards and filters work |
| Product detail | Open the maize product | Product details render; unpriced product cannot be added |
| `/cart` | Add/remove a purchasable sample product if one is configured | Cart count and total update; refresh keeps cart |
| `/signup` | Enter invalid email, short password, mismatched passwords | Browser validation blocks submission |
| `/signup` | Submit valid-looking values with backend stopped | Friendly API unavailable message; no account should be claimed created |
| `/login` | Submit credentials with backend stopped | Friendly API unavailable message |
| `/verify-email` | Open without token | Resend form appears |
| `/forgot-password` | Submit valid email with backend stopped | Friendly API unavailable message |
| `/reset-password` | Open without token | Reset submission disabled and link error shown |
| `/account` | Open while signed out | Redirects to login |
| `/account/orders` | Open while signed out | Redirects to login |
| `/checkout` | Open while signed out | Redirects to login |
| `/admin` | Open while signed out | Redirects to login |

## Backend-dependent end-to-end checks (after Spring Boot is implemented)

1. Register a customer and verify that one email is sent.
2. Follow the one-time verification link; confirm that it cannot be reused.
3. Log in with the verified customer; confirm session survives refresh.
4. Log out; confirm protected pages redirect to login.
5. Create an order; verify backend recalculates price from database product records.
6. Submit a valid UTR, with and without an optional screenshot.
7. Confirm order status becomes payment-under-review, not paid.
8. Sign in as the provisioned admin; approve/reject a payment and verify audit trail.
9. Confirm customer email notification after the admin decision.
10. Confirm only paid orders can obtain a short-lived download URL.
11. Try another customer's order ID and confirm the API denies access.
12. Confirm customer cannot access admin endpoints, even by manually calling the API.

## What the current frontend does not prove

- A successful Angular build does not mean the backend exists.
- A frontend route guard is not server-side authorization.
- A payment screenshot or UTR does not prove payment.
- A browser cart is not an order and its displayed prices are not trusted.
- No report download is allowed until the backend verifies payment.
