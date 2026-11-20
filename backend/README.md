# Backend (Spring Boot, modular monolith): Phase 2, not started

Start only after the client approves the frontend (roadmap step P).

Planned package layout under `com.teraquantai.platform`:

```
catalog/     categories, products, product specs, deliverables metadata
user/        customer profile
auth/        registration, login, JWT/session, password handling
order/       pending orders, order items (price snapshot), purchase history
payment/     Razorpay order creation, signature verification, webhooks (idempotent)
delivery/    private storage access, time-limited download links, download logs
admin/       product & file management (to be confirmed)
common/      errors, config, security, validation
```

Rules from the roadmap: prices come from server-side records only; an order is "paid"
only after server-side verification/webhook; files stay private.
