# TerraQuantAI

AI-powered intelligence platform: customers discover forecast/insight products
(agriculture, energy, markets, industrial), purchase them, and access the finished
deliverables from their account. **Products are reports/outputs, not model files.**

## Repository layout

```
teraquantai/
├── frontend/     Angular + Tailwind CSS   ← Phase 1 (we start here)
├── backend/      Java + Spring Boot       ← Phase 2 (after client approves frontend)
├── database/     PostgreSQL migrations & seed data
├── infra/        Deployment / reverse-proxy config
├── docs/         Roadmap, design reference, decisions, content rules
├── docker-compose.yml   Local PostgreSQL
└── .env.example
```

## Phases (from the A–Z roadmap)

| Phase | Roadmap steps | Scope |
|---|---|---|
| 1. Frontend prototype | A–O | All pages with sample data, responsive, accessible, client review |
| 2. Backend | P–S | Catalogue API, accounts, auth |
| 3. Commerce | T–W | Orders, Razorpay, secure downloads, receipts |
| 4. Launch | X–Z | Testing, deployment, monitoring |

## Getting started (Phase 1)

Requires Node `^22.22.3` or `^24.15.0`.

```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run build      # production build (needs internet: Google Fonts are inlined at build time)
```

Full frontend plan: [`docs/frontend-structure.md`](docs/frontend-structure.md)
Open questions & decisions: [`docs/decisions.md`](docs/decisions.md)
Content/claims rules: [`docs/content-guidelines.md`](docs/content-guidelines.md)

## Conventions

- Branches: `main` (stable), `develop`, `feature/<name>`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Never commit `.env` or secrets.
