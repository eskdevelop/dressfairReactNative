# DressFair RN Hybrid Release Playbook

## Pre-release Checklist

- Lint and type checks pass.
- Unit tests pass.
- Smoke tests pass on Android and iOS.
- Notifications route to intended web paths.
- Checkout redirect returns to app correctly.
- Offline and maintenance screens verified.

## Staged Rollout

1. Internal QA build
2. Closed beta (10%)
3. Gradual production rollout (25% -> 50% -> 100%)

## Rollback Plan

- Keep prior stable release available for immediate rollback.
- Disable risky web routes via remote config fallback if needed.
- Turn on maintenance flag for temporary safe mode.
