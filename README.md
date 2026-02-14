# LinkedIn Banner Studio

Production-oriented React + Vite SaaS project for creating LinkedIn banners, managing templates, and running growth workflows.

## Features
- Banner editor with advanced layer controls, multi-select, snap guides, spacing indicators
- Template marketplace + project save/load
- Growth tools suite (post editor, carousel creator, swipe files, CRM, profile analysis, email finder, integrations)
- Admin panel (users, projects, templates, moderation, analytics, audit logs)
- Role-based access control (`user`, `admin`)
- Monitoring + route analytics + error boundary
- Legal pages (About, Contact, Privacy, Terms)

## Quick Start
```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Available Scripts
- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - eslint
- `npm run test` - run unit tests once
- `npm run test:watch` - run tests in watch mode
- `npm run baseline:freeze` - run baseline snapshot (`lint`, `test`, `build`, hash manifest)

## Environment Variables
Copy `.env.example` to `.env` and configure:
- `VITE_API_URL`
- `VITE_DATA_PROVIDER` (`local` by default)
- `VITE_API_TIMEOUT_MS`
- `VITE_ANALYTICS_ENABLED`
- `VITE_MONITORING_CONSOLE`
- `VITE_MONITORING_ENDPOINT` (optional telemetry endpoint)

## Architecture Notes
- Feature-based frontend modules under `src/features/*`
- Services layer under `src/services/*`
- LocalStorage-backed mock data provider for offline/demo development
- Optional Supabase provider scaffold in `src/services/providers/supabaseProvider.js`

## Production Roadmap
See `docs/PRODUCTION_ROADMAP.md`.

## Governance
- Branching model: `docs/BRANCH_STRATEGY.md`
- Baseline freeze process: `docs/BASELINE_FREEZE.md`
