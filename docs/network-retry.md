# Network Retry Strategy

## Utility

- `withRetry` is the shared retry helper for transient network failures.
- Uses exponential backoff with jitter.
- Defaults:
  - retries: 3
  - base delay: 400ms
  - max delay: 4000ms

## Retry Rules

- Retries on:
  - unknown/network errors
  - HTTP `5xx`
  - HTTP `429`
- Does not retry on client validation errors (`4xx`, except `429`).

## Current Integration

- Push token backend sync now uses `withRetry`.
- Retry attempts and outcomes are tracked through analytics events.
