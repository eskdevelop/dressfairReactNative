# Release Handoff Checklist

## Environment and Config

- Copy `.env.example` to local env and set:
  - `APP_ENV`
  - `DEFAULT_COUNTRY`
  - country-specific URL overrides only when needed
- Confirm production endpoints match region deployment.

## Engineering Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run smoke:checklist`
- `npm run release:checklist`

## QA Sign-off

- Execute `docs/qa-matrix.md`.
- Validate payment redirects and callback statuses.
- Validate push registration and push open routing.
- Validate login, logout, and account guard behavior.

## Store Submission Package

- Privacy policy URL
- App description and screenshots
- Data safety/app privacy disclosures
- Support contact URL/email

## Rollout Controls

- Start with staged rollout
- Monitor crash and critical navigation events
- Keep rollback path to last stable release
