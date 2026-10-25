# Verse Puzzle — Shortround Gaming

Daily King James Version verse puzzles (Verse Builder, Cryptogram, Word Search). Fully offline: no accounts, no ads, no tracking.

- `www/index.html` — the whole game (one file)
- `android/`, `ios/` — Capacitor 8 native projects
- `assets/` — icon and splash sources (`npm run icons` regenerates the native sets)
- `store/` — Google Play listing text, privacy policy, screenshots

## Build
GitHub Actions → **Android build** runs on every push to `main` and produces a test APK and a Play bundle (AAB).

Signing the AAB needs four repository secrets (Settings → Secrets and variables → Actions):
`ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. Keep an offline backup of the keystore. Turn on Play App Signing so Google holds the app key.

## Local
```
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
```
