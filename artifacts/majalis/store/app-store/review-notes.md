# App Review Notes — سُنّة (paste into App Store Connect)

**Bundle ID:** `com.yousef.majlisilm`  
**Version / Build:** use the values of the binary under review (CURRENT App Store may differ from TestFlight).

---

## Guideline 2.1 — Sign-in

### Demo account (OWNER-managed — not embedded in the app)

| Field | Value |
|-------|-------|
| Email | `apple.review@ssunnah.com` |
| Password | **Only in App Store Connect Review Notes** (rotated by owner; never committed to git) |

**How to sign in:**

1. Open **تسجيل الدخول** (`/login`).
2. Enter the email and the password from ASC Review Notes → Sign in.
3. Account must be **email-confirmed** in Supabase. There is **no** client-side review bypass and **no** password in the JavaScript bundle.

### Guest access (no account required)

Most of the product works without login: Quran Mushaf, adhkar, prayer times, Qibla, hadith, lessons browsing, fiqh, seerah. Tap **المتابعة كزائر** on the login screen or use the app from Home.

### OWNER_ACTION after security hardening

Rotate the App Store review account password in Supabase Auth and update ASC Review Notes. Do not put the new password in the repository.

---

## Guideline 2.5.4 — Background Audio

The app declares `UIBackgroundModes = audio` because **Quran tilawa continues while backgrounded or locked**.

### Exact verification path

1. Launch **سُنّة**.
2. Open **المصحف** — route `/mushaf`.
3. Start **تلاوة** — confirm sound in foreground.
4. Press **Home** — audio continues ≥ 60 seconds.
5. **Control Center** — Now Playing transport works.
6. **Lock** — audio + Lock Screen controls continue.

No silent keep-alive. Background mode is only for real Quran/lesson playback via `AVAudioSession` `.playback` + Now Playing (`MajlisPlaybackAudioPlugin`).
