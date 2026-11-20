# Frontend structure (Angular + Tailwind CSS)

Created in `frontend/` via `ng new` (see root README). Target layout inside `frontend/src/app`:

```
src/
├── assets/
│   ├── brand/              logo (full, emblem, white version), favicon
│   └── images/             hero, category and product imagery
├── styles/
│   ├── tailwind.css        @import "tailwindcss" + @theme tokens (brand colours, fonts, radii, shadows)
│   └── base.css            global resets, focus ring, typography defaults
└── app/
    ├── core/               singletons, loaded once
    │   ├── layout/         header, footer, mobile-menu, shell
    │   ├── services/       catalog.service, auth.service (mock now, HTTP later), seo.service
    │   ├── guards/         auth.guard (dashboard)
    │   ├── interceptors/   (empty until backend)
    │   └── config/         app.config.ts, environment tokens
    ├── shared/             reusable, dumb UI
    │   ├── ui/             button, badge, card, input, tabs, table, icon, section-heading, empty/loading/error states
    │   ├── components/     product-card, category-card, stat-card, cta-banner, scenario-chart
    │   ├── pipes/          currency-inr, date-range
    │   └── models/         Product, Category, Order, User, Deliverable (TypeScript interfaces)
    ├── features/           one folder per page area, lazy-loaded
    │   ├── home/
    │   ├── solutions/      catalogue list + category filter
    │   ├── product-detail/ overview / what-you-get / specifications / FAQs tabs
    │   ├── cart-checkout/  (shell only, non-functional in prototype)
    │   ├── auth/           login, sign-up, forgot-password
    │   ├── dashboard/      my-account, purchases, download-history, profile-settings
    │   ├── about/
    │   ├── resources/      blog/FAQ/docs layouts
    │   ├── contact/
    │   └── legal/          privacy, terms, refund-policy, disclaimer
    ├── data/               mock JSON: products.json, categories.json, orders.json
    ├── app.routes.ts       lazy routes
    └── app.component.ts
```

## Principles

1. **Standalone components + signals**, no NgModules.
2. **Lazy-load every feature route.**
3. **Mock data behind a service interface.** `CatalogService` reads `data/*.json` today and calls
   the Spring Boot API later without touching components.
4. **Design tokens in one place** (`tailwind.css` `@theme`), taken from the approved visual reference.
5. **SSR/prerender on** for Home, Solutions and Product pages (SEO + link previews).
6. **Prototype honesty:** non-working controls are visibly marked as demo (roadmap §6).
7. **Accessibility from day one** (semantic landmarks, focus states, contrast, alt text).

## Build order (roadmap B → O)

1. Project setup, Tailwind, routing, tokens
2. Shell: header, footer, mobile menu
3. Home
4. Solutions catalogue
5. Product detail template, then Maize Market Forecast
6. About / Resources / Contact / legal
7. Login & sign-up
8. Dashboard
9. Responsive + accessibility pass, states (loading/empty/error)
10. Client walkthrough
