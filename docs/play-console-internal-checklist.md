# Google Play — Internal testing checklist

Use this before your **first** Internal testing release. Package must stay **`com.dressfair.dressfairrnhybrid`** (native `applicationId`).

## Console setup (blocking or gated)

Work through the Play Console dashboard for your app. Exact wording changes over time; look for items marked required or incomplete.

1. **App access** — If parts of the app need login, provide test account instructions (or demo mode) for reviewers later.
2. **Privacy policy** — Public HTTPS URL in listing.
3. **Data safety** — Declare data collection/sharing (matches your app: auth, analytics, push tokens, etc.).
4. **Content rating** — Complete the questionnaire.
5. **Target audience** — Age groups, appeals to children if applicable.
6. **News / COVID / Government** — Only if applicable.
7. **Store listing** — At minimum: short description, screenshots (phone), high-res icon, feature graphic where required.
8. **Play App Signing** — Leave enabled (default). You upload an **AAB** signed with your **upload key** (EAS-managed).

## Build the AAB (EAS-managed signing)

From project root [`rn-hybrid-app`](../):

```bash
npm run lint && npm run typecheck && npm run test
npx eas build -p android --profile production
```

Download the **`.aab`** from the EAS build page when it finishes.

## Internal testing track

1. **Testing** → **Internal testing** → **Create new release**
2. Upload the **AAB**
3. Release name + release notes → **Save** → **Review release** → **Start rollout**
4. **Testers** tab: add emails or Google Group; copy the **opt-in URL** for your team

## Optional: submit from CLI

Requires a Google Play **service account** JSON key and linking it in Play Console (**API access**), then configuring EAS (interactive the first time):

```bash
npx eas submit -p android --latest --profile production
```

Profile `production` in `eas.json` submits to the **internal** track by default.

If you see `Google Service Account Keys cannot be set up in --non-interactive mode`, run the same command **without** `--non-interactive` locally and follow the prompts, or upload the AAB manually in Play Console (recommended for the first release).

## Latest production build (reference)

Download the **AAB** from the EAS build page (artifact links may rotate):

- Build: [expo.dev build `eb91cc3c-c380-405b-83ab-318389cc6914`](https://expo.dev/accounts/dressfair/projects/dressfair-rn-hybrid/builds/eb91cc3c-c380-405b-83ab-318389cc6914)

## Next uploads

- Run `npx eas build -p android --profile production` again.
- `eas.json` uses `autoIncrement` for Android version code on production builds.
- Bump `expo.version` in `app.json` when you want a new user-facing version string (e.g. `1.0.1`).

## Backup

In **Expo** → Project → **Credentials**, export/securely store Android upload keystore backup per team policy.
