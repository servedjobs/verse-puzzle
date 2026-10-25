# Verse Puzzle — Shortround Gaming

Daily King James Version verse puzzles (Verse Builder, Cryptogram, Word Search). Fully offline: no accounts, no ads, no tracking.

- `www/index.html` — the whole game (one file)
- `android/`, `ios/` — Capacitor 8 native projects
- `assets/` — icon and splash sources (`npm run icons` regenerates the native sets)
- `store/` — Google Play listing text, privacy policy, screenshots

## Build
GitHub Actions → **Android build** runs on every push to `main` and produces a test APK and a Play bundle (AAB).

Signing: the upload key is committed encrypted at `android/keys/upload.jks.enc` (AES-256, alias `upload`). One repository secret, `KEYSTORE_PASSWORD`, unlocks it in CI. Without it the AAB is built unsigned. Erik holds the offline backup (key file + password). Play App Signing holds the real app key, so a lost upload key can be reset.

## Local
```
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
```
