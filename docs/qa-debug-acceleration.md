# QA Debug Acceleration

## In-app Health Panel

- Added `HealthDebugPanel` inside settings screen.
- Displays runtime diagnostics:
  - country
  - offline/boot/auth flags
  - network type
  - session token presence
  - push token presence

## Smoke Checklist Runner

- Run:
  - `npm run smoke:checklist`
- Source checklist:
  - `scripts/smoke-checklist.json`
- Purpose:
  - quick pre-QA and pre-release validation of critical hybrid flows.
