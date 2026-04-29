# Async UX Standard

## Standard States

All major views should expose four deterministic states:

- loading
- error
- empty
- success

## Shared Component

`AppAsyncState` is the single wrapper for these states and should be used
instead of ad-hoc spinners or inline error blocks.

## Current Integration

- WebView shell uses `AppAsyncState` in overlay mode for loading and error
  transitions with retry support.
