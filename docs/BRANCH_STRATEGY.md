# Branch Strategy

This repository follows a production-oriented branching model.

## Branch Types
- `main`: production-ready only. No direct pushes.
- `develop`: integration branch for upcoming release work.
- `feature/<area>-<short-name>`: new feature branches from `develop`.
- `fix/<area>-<short-name>`: non-urgent fixes from `develop`.
- `hotfix/<short-name>`: urgent production fixes from `main`.
- `release/<yyyy-mm-dd>`: release stabilization branch from `develop`.

## Merge Rules
- Feature/fix branches:
  - Source: `develop`
  - Target: `develop`
  - Merge method: squash merge
- Release branches:
  - Source: `develop`
  - Target: `main` (after QA/sign-off)
  - Then back-merge to `develop`
- Hotfix branches:
  - Source: `main`
  - Target: `main`
  - Then back-merge to `develop`

## Protection Rules (configure in Git hosting)
- Protect `main` and `develop`.
- Require pull request for merges.
- Require CI checks:
  - `lint`
  - `test`
  - `build`
- Require at least 1 reviewer approval.
- Block force-push and branch deletion.

## Naming Examples
- `feature/editor-smart-snapping`
- `feature/admin-audit-export`
- `fix/auth-register-validation`
- `hotfix/payment-webhook-retry`
- `release/2026-03-16`

## Commit Convention
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `test: ...`
- `docs: ...`
- `chore: ...`

## Release Tags
- Tag production releases on `main`:
  - `vYYYY.MM.DD.N` (example: `v2026.03.16.1`)
