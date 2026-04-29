# Auth Guard and Logout Sync

## Guard Rules

- Account tab opens `/account` only when `isAuthenticated=true`.
- If signed out, account tab opens web login route (`/login`).

## Logout Sync

1. Native settings logout clears local token state.
2. Redux auth flag updates to signed-out.
3. App navigates to web logout route (`/logout`) in `NotificationRouter`.
4. Both native and web sessions become consistent.
