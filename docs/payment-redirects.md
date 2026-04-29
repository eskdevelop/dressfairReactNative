# Payment Redirect Hardening

## What is implemented

- Payment callback URL detection in WebView navigation lifecycle.
- Status classification for callback URLs:
  - `success`
  - `failed`
  - `pending`
  - `unknown`
- Analytics events for:
  - redirect start
  - callback detection
  - external handoff
  - invalid URL block

## Safety behavior

- Only allowlisted domains load inside WebView.
- Non-allowlisted HTTP links are handed to system browser.
- Invalid URL parses are blocked and tracked.

## Why this matters

Payment flows often bounce through intermediate pages and gateways. This policy
adds deterministic detection and telemetry so checkout regressions can be
detected early and recovered quickly.
