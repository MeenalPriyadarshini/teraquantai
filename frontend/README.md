# TerraQuantAI frontend

Angular 22 (standalone components, signals, SSR/prerender) + Tailwind CSS 4.

```bash
npm install
npm start       # dev server
npm run build   # production build
```

- Design tokens: `src/styles.css` (`@theme`)
- Site config (nav, footer, socials): `src/app/core/config/site.config.ts`
- Mock data: `src/app/data/` (add a product to `products.data.ts` to fill a "coming soon" slot)
- Routes not yet built use `features/placeholder`; see `src/app/app.routes.ts`

Pending assets from client: corrected TerraQuantAI logo (SVG), real hero imagery, social profile URLs.
