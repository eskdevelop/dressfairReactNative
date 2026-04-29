# EAS Store Release Runbook (Android + iOS)

This runbook covers the full publish path for Google Play and Apple App Store.

## 1) Accounts (required before first submission)

- Google Play Console developer account.
- Apple Developer Program account.
- App Store Connect access for the Apple account.

Gather and keep ready:

- Legal developer/public name.
- Support email.
- Support URL and marketing URL.
- Privacy policy URL.

## 2) One-time local setup

```bash
npm i -g eas-cli
eas login
eas whoami
```

Then in project root:

```bash
eas init
```

After `eas init`, copy the generated EAS project ID into:

- `app.json` -> `expo.extra.eas.projectId`
- `app.json` -> `expo.updates.url` (must match project ID URL)

## 3) Credentials management

Recommended for first release:

- Let EAS manage Android keystore.
- Let EAS manage iOS certificates and provisioning profiles.

Run:

```bash
eas credentials
```

Backup any downloaded credentials in a secure vault.

## 4) Build commands

### Internal QA builds

Android APK (easy sideload for testers):

```bash
eas build -p android --profile preview
```

iOS ad-hoc/TestFlight candidate:

```bash
eas build -p ios --profile preview
```

### Store production builds

Android AAB for Play:

```bash
eas build -p android --profile production
```

iOS IPA for App Store Connect:

```bash
eas build -p ios --profile production
```

## 5) Store submission

First submission is usually easier from each store UI. After that, CLI submit is optional:

```bash
eas submit -p android --latest --profile production
eas submit -p ios --latest --profile production
```

## 6) Required pre-submit checks

Run and pass:

```bash
npm run lint
npm run typecheck
npm run test
npm run smoke:checklist
npm run release:checklist
```

Manual checks on real devices:

- Login/logout/session restore.
- Push notification permission and delivery.
- Offline and reconnect behavior.
- Main webview navigation/payment critical path.
- Splash launch and status bar visibility.

## 7) Store listing and compliance

Use this companion template:

- `docs/store-listing-template.md`

Complete:

- Play Data safety.
- iOS App Privacy questionnaire.
- iOS export compliance/encryption declaration.
- Age/content rating.

## 8) Release operations

- Roll out gradually in Play (internal -> closed -> production).
- Use TestFlight internal testers before App Review.
- Monitor crashes/ANRs for 48-72 hours after release.
- For hotfix: bump version/build numbers and rebuild.
