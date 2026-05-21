# Native login — debug QA (no production build required)

Test everything with a **debug** build before uploading to App Store.

## Start the app

```bash
npm install
npm start
```

Then on your phone:

- **Android:** scan QR in Expo Go, or `npm run android` with a dev client / emulator.
- **iOS:** scan QR in Expo Go, or `npm run ios` on simulator / device.

No EAS production build is needed for this checklist.

## Login flows

Open **You tab → Sign In / Register** (native modal, not website).

| # | Flow | Steps | Pass |
|---|------|-------|------|
| 1 | WhatsApp | Enter phone → OTP → Verify | Modal closes; You shows name |
| 2 | Email | Email + password → email OTP → Verify | Same |
| 3 | Register | Fill form → Continue → sign in on Email screen | Registration succeeds |
| 4 | Apple (iOS only) | Sign in with Apple on chooser | Same (requires dev build with Apple capability, not Expo Go) |

## Session persistence

1. Log in with any method above.
2. Force-quit the app.
3. Reopen → **You** tab should still show logged-in state.

## Checkout (token → WebView)

1. While logged in, browse Home WebView and add an item to cart.
2. Open **Cart** tab → proceed to checkout.
3. **Saved address** should appear (not guest-only form).

## Legal links (4.2)

From login footer, tap **Term of Use** and **Privacy Policy** → native scroll screens (not Safari).

## Automated checks (optional)

```bash
npm run lint
npm run typecheck
npm test
```

## When ready for App Store

Only after all debug checks pass:

```bash
eas build --platform ios --profile production
```

Version in `app.json` is `1.0.12 (16)` when you choose to ship.
