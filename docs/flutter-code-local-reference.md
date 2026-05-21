# Flutter code (local reference only)

The folder `src/flutter-code/` is a copy of the legacy Flutter app used as a **local reference** when porting screens and API logic to React Native (for example native login).

## Git and builds

- **Not pushed to GitHub** — listed in `.gitignore` and removed from git tracking.
- **Not bundled** — React Native does not import any Dart files from this folder.
- **Not uploaded to EAS** — listed in `.easignore`.

Safe for debug (`npm start`, Expo Go, dev client) and production EAS builds.

## If you clone on a new machine

The folder will be empty unless you copy it from your backup or the Flutter repo. RN builds and runs without it.

## Native login port

Flutter auth sources used as reference:

- `view/screens/auth/login_screen.dart`
- `view/screens/auth/login_with_whatsapp.dart`
- `view/screens/auth/otp_screen.dart`
- `view/screens/auth/login_with_email.dart`
- `view/screens/auth/email_otp_verification.dart`
- `view/screens/auth/registration_screen.dart`

RN implementation: `src/features/auth/`.
