# PrayerChair (Vandelay Labs)

Seven verses a day, a prayer, one small step, the Douay-Rheims Bible (73 books) and Scripture puzzles. Fully offline: no accounts, no ads, no tracking. App id `com.vandelaylabs.prayerchair`.

- `www/` — the app (built from the PrayerChair page by `make_native.py`; fonts bundled, no network)
- `android/`, `ios/` — Capacitor 8 native projects
- `assets/` — icon and splash sources

Build: GitHub Actions → Android build on every push to `main` (test APK + Play bundle). Signing uses the same encrypted upload key as Verse Puzzle (`android/keys/upload.jks.enc`, alias `upload`), unlocked by one repo secret `KEYSTORE_PASSWORD`.
