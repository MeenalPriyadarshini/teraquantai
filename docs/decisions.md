# Decisions log

## Assumptions made for Phase 1 (change any of these)
| # | Assumption | Status |
|---|---|---|
| 1 | Monorepo (`frontend/`, `backend/`, `database/`, `infra/`, `docs/`) | assumed |
| 2 | Angular 22 (standalone + signals), Tailwind CSS 4, Angular SSR enabled | assumed |
| 3 | Mock JSON data behind services until the API exists | assumed |
| 4 | Backend: Spring Boot modular monolith, Java package `com.teraquantai.platform` | assumed |
| 5 | Tagline is "Data • Markets • Intelligence" | confirmed |
| 6 | Brand name is **TerraQuantAI** (double r); the roadmap/mockup spelling was a mistake | confirmed |
| 7 | Keep the mockup's Add to Cart + simple checkout (not yet confirmed by client) | assumed |
| 8 | Product slots are data-driven; empty "coming soon" boxes until real products exist | confirmed |
| 9 | Copy uses confident "AI-powered" wording but never claims a model download, accuracy figures, "proprietary" tech or real-time data | confirmed |

## Open decisions
- Cart (multi-item, as shown in the mockup) vs direct "Buy now"
- One-time purchase only, or subscriptions / update entitlements
- Who adds products later: admin panel, or manual DB/upload (roadmap §13)
- Currency/tax: INR only? GST invoice requirements?
- Auth method: email + password, Google login, OTP?
- Hosting / object storage providers
- Domain name and brand assets (SVG logo, white logo variant)

## Issues spotted in the roadmap / mockup (all confirmed as valid)
1. **Logo tagline says "Intelligence for Agriculture"**, but the roadmap says the site must not look agriculture-only.
2. **Add to Cart** button vs roadmap's single-product purchase flow: not defined.
3. **No admin/back-office** in the roadmap, so there is no way to publish products or deliverables.
4. **No legal pages** (Privacy, Terms, Refund, Disclaimer). The footer links them, and payment gateways typically require them.
5. **Forecast window already began** (15 Nov 2026): decide how late purchases and "forecast period remaining" are presented.
6. Mockup copy such as "Reliable & Secure" / "AI-Powered Analytics" should be checked against the claims rules.
