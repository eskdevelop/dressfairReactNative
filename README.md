# DressFair RN Hybrid App

React Native hybrid implementation for DressFair.

## Run

```bash
npm install
npm run start
```

## Environment

- Use `.env.example` as the baseline for environment values.
- Default country/domain behavior is defined in `src/shared/config/env.ts`.
- For release preparation use:
  - `npm run smoke:checklist`
  - `npm run release:checklist`

## Architecture

- `src/app`: app bootstrap and store
- `src/navigation`: root stack and tabs
- `src/features/webview`: main commerce web container
- `src/features/shell`: native shell pages (splash/offline/maintenance)
- `src/features/notifications`: push payload mapping
- `src/shared`: design system, network, config, and utilities

## Quality Gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Release

- Store release runbook: `docs/release-eas-store.md`
- Google Play internal testing (AAB / EAS): `docs/play-console-internal-checklist.md`
- Store metadata template: `docs/store-listing-template.md`
