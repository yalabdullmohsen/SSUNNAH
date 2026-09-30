# WAVE13 — Final Device Evidence Runbook

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Branch | `cursor/final-repo-closure-wave13` |
| Base | `origin/main` @ `e29f2cb0` (post-WAVE12) |
| Status | **RUNBOOK_READY** — execution remains **DEVICE_REQUIRED** |
| Production host | `https://www.ssunnah.com` |

## Non-claims (hard)

This wave does **not**:

- execute real-device tests
- convert any `DEVICE_REQUIRED` row to `PASS`
- claim `DEVICE_TESTED`, `MUSHAF_SILKY`, `WCAG CERTIFIED`, or `STORE GO`
- enable production telemetry by default
- collect PII or Quran text

## Purpose

Finalize an owner-executable evidence system so physical device gaps can be closed later without inventing results.

## Related sources

| Document | Role |
|---|---|
| `docs/audit/DEVICE_QA_REGISTER.md` | Living register (updated to point here) |
| `docs/mushaf/WAVE6_REAL_DEVICE_TEST_MATRIX.md` | Mushaf turn matrix |
| `docs/qa/PRAYER_ADHAN_REAL_DEVICE_MATRIX.md` | Prayer / adhan |
| `docs/qa/MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md` | Mushaf release |
| `artifacts/majalis/docs/AUDIO_BACKGROUND_DEVICE_RUNBOOK.md` | Audio background |
| `scripts/device-evidence/` | Capture helpers + templates |

---

## 1. Pre-flight (every session)

1. Confirm production `version.json` matches `origin/main` tip (short SHA).
2. Record:
   - `commit` / `builtAt` from `https://www.ssunnah.com/version.json`
   - local `git rev-parse origin/main`
   - build channel: Production web · PWA · Capacitor iOS · Capacitor Android
3. Run:
   ```bash
   node scripts/device-evidence/capture-build-context.mjs \
     --out /tmp/sunnah-device-evidence/build-context.json
   ```
4. Create evidence folder:
   ```text
   docs/audit/device-evidence/<YYYY-MM-DD>-<shortSha>/
     build-context.json
     rows/*.json
     artifacts/   # screenshots / recordings (no Quran page bitmaps of scripture text)
   ```
5. Naming:
   - Screenshot: `<device>-<os>-<case>-<mode>-<result>.png`
   - Recording: `<device>-<os>-<case>-<mode>.mp4`
   - Row JSON: `<caseId>.json` from `evidence-row.template.json`

---

## 2. Device matrix (inventory)

| ID | Device class | OS target | Browser / runtime | Status |
|---|---|---|---|---|
| D-IP14 | iPhone modern | iOS current−1..current | Safari · PWA · Capacitor | DEVICE_REQUIRED |
| D-IPSE | iPhone compact | iOS current−2..current | Safari · Capacitor | DEVICE_REQUIRED |
| D-IPAD | iPad | iPadOS current−1..current | Safari · Split View · Capacitor | DEVICE_REQUIRED |
| D-AND-MID | Android mid-range | Android 12–14 | Chrome · Capacitor | DEVICE_REQUIRED |
| D-AND-NEW | Android recent | Android 14–15 | Chrome · Capacitor | DEVICE_REQUIRED |

Fill actual model names only when a human owns the device.

---

## 3. Mode matrix

| Mode ID | Meaning |
|---|---|
| L | Light |
| D | Dark |
| S | System (follow OS) |
| RTL | Arabic RTL (default) |
| LT | Large Text / Dynamic Type |
| SV | Split View (iPad) |
| COLD | Cold start (process killed) |
| WARM | Warm navigation |
| OFFLINE | Offline / airplane after warm cache |
| SW_STALE | Stale Service Worker (prior build cached) |

---

## 4. Case catalog (executable)

Every row below defaults to **DEVICE_REQUIRED** until filled with artifact + commit + date.

### 4.1 Startup / theme / FOUC

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| ST-COLD-HOME | Kill app → open `/` cold | No blank flash; theme matches preference; no reload loop | All |
| ST-WARM-NAV | Home → Search → Quran Hub → back | Instant chrome; no theme flash | All |
| ST-THEME-LDS | Toggle Light/Dark/System + refresh | No FOUC; System follows OS | All |
| ST-SW-STALE | Load prior SW → deploy new SHA → revisit | Recovery path; no stuck blank | IP14, AND-NEW |
| ST-CLS-HOME | Record CLS on cold home (Perf HUD / WebView) | No major jump; note number | IP14, IPAD, AND-MID |

### 4.2 Accessibility

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| A11Y-VO | VoiceOver: Home, Search, Mushaf chrome, Settings | Names, focus order, no traps | IP14, IPAD |
| A11Y-TB | TalkBack: same surfaces | Same | AND-MID, AND-NEW |
| A11Y-LT | Large Text 200%+ on Home/Prayer/Settings | No clip of primary actions | All |
| A11Y-KB | Hardware keyboard: Mushaf bookmarks / sheets | Focus-visible; Escape closes | IPAD |

### 4.3 Prayer / adhan

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| PR-ROUTE | Open `/prayer-times` warm + cold | No theme leak to Home; times render | All |
| PR-BG | Background app across a prayer minute | Notification/adhan per settings (owner) | IP14, AND-NEW |
| PR-AUDIO-INT | Interrupt adhan with call / other audio | Resume/stop policy documented; no crash | IP14, AND-NEW |

> Adhan delivery may also be **OWNER_ACTION** / **BLOCKED_LICENSE** — do not mark PASS without rights + device proof.

### 4.4 Mushaf (UI/perf only — no scripture edits)

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| MU-25 | 25 page turns (gesture + arrows) | No deadlock; correct page; WAVE6 contract feel | All |
| MU-100 | 100 page turns | No hang; memory OK; no wrong page | IP14, AND-NEW |
| MU-AUDIO | Turns with audio + mini player | Mapping holds; no desync crash | IP14, AND-NEW |
| MU-VV | Rotate / keyboard / VisualViewport | Chrome safe; no overlap | IP14, IPAD |
| MU-BM-KB | Bookmarks sheet keyboard | Accessible names; no double action | IPAD |
| MU-FPS | Record FPS during 25 turns | Note jank; no invented silky claim | IP14, AND-NEW |

Never attach screenshots that require altering Quran text/tashkeel. Prefer chrome-only crops when possible.

### 4.5 Shell / navigation

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| NAV-BOTTOM | Bottom nav + prayer float / FAB | No collision; RTL OK | Phone classes |
| NAV-DEEP | Deep link `/mushaf/2`, `/prayer-times` | Lands correctly; chrome OK | All |
| NAV-SAFE | Notch / home indicator / landscape | Safe areas respected | IP14, IPAD, AND-NEW |

### 4.6 Offline / network

| Case ID | Steps | Expected | Devices |
|---|---|---|---|
| NET-OFF | Warm cache → offline → Home/Mushaf cached routes | Graceful empty/offline UI; no reload loop | IP14, AND-MID |
| NET-POOR | Throttle 3G | Primary routes usable | AND-MID |

---

## 5. Row schema (mandatory fields)

Use `scripts/device-evidence/evidence-row.template.json`:

| Field | Required | Notes |
|---|---|---|
| caseId | yes | From catalog |
| deviceId | yes | D-IP14… |
| deviceModel | yes | Real model string |
| osVersion | yes | |
| runtime | yes | safari / chrome / capacitor-ios / capacitor-android / pwa |
| buildCommit | yes | Must match tested build |
| mode | yes | L/D/S + flags |
| steps | yes | What was done |
| expected | yes | |
| actual | yes | |
| artifactPath | yes if PASS/FAIL | Relative path under evidence folder |
| result | yes | `PASS` · `FAIL` · `DEVICE_REQUIRED` · `BLOCKED` |
| failureClass | if FAIL | A (product) · B (env) · C (flake) · OWNER · LICENSE |
| tester | yes | Human name/handle |
| testedAt | yes | ISO date |
| notes | optional | |

**Rule:** Unexecuted rows stay `DEVICE_REQUIRED`. Never write `PASS` without `artifactPath` + matching `buildCommit`.

---

## 6. Failure classification

| Class | Meaning | Next action |
|---|---|---|
| A | Product defect in current SHA | Fix via PR; do not flip PASS |
| B | Pre-existing / unrelated | Follow-up; cite evidence |
| C | Infra flake | One retry max; keep DEVICE_REQUIRED if unreproducible |
| OWNER | Needs owner account / store / cert | OWNER_ACTION |
| LICENSE | Audio/rights blocker | BLOCKED_LICENSE |

---

## 7. Safe telemetry (opt-in only)

| Rule | Requirement |
|---|---|
| Default | **OFF** in production |
| Flag | Explicit local/dev flag only (see `scripts/device-evidence/README.md`) |
| Allowed | Timings, route ids, theme mode, commit SHA, device class |
| Forbidden | PII, account emails, Quran ayah text, bookmarks content, exact GPS |

No production code path is enabled by this wave.

---

## 8. Evidence acceptance checklist

A device gap may flip from DEVICE_REQUIRED only when **all** are true:

1. Row JSON complete  
2. Artifact exists and is reviewable  
3. `buildCommit` matches the binary/web build under test  
4. Result is PASS or FAIL (not skipped)  
5. Register cell updated with date  
6. No claim broader than the case (e.g. one iPhone PASS ≠ all devices)

---

## 9. Master status board (initial)

All cells start DEVICE_REQUIRED.

| Case | IP14 | IPSE | IPAD | AND-MID | AND-NEW | VO | TB |
|---|---|---|---|---|---|---|---|
| ST-COLD-HOME | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| ST-THEME-LDS | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| ST-CLS-HOME | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| A11Y-VO/TB | DEVICE_REQUIRED | — | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED |
| A11Y-LT | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| PR-ROUTE | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| PR-BG / AUDIO | DEVICE_REQUIRED | — | — | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| MU-25 / MU-100 | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |
| MU-AUDIO / VV | DEVICE_REQUIRED | — | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — |
| NAV-* / NET-* | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | DEVICE_REQUIRED | — | — |

---

## 10. Scripts

| Script | Purpose |
|---|---|
| `scripts/device-evidence/capture-build-context.mjs` | Fetch prod `version.json` + local git tip |
| `scripts/device-evidence/validate-evidence-rows.mjs` | Validate row JSON; reject PASS without artifact |
| `scripts/device-evidence/evidence-row.template.json` | Copy template per case |
| `scripts/device-evidence/README.md` | Operator notes |

Gate: `artifacts/majalis/src/lib/__tests__/wave13-device-evidence-runbook-gate.test.ts`

---

## 11. Delivery status

| Item | Status |
|---|---|
| Runbook | Done |
| Templates / validators | Done |
| Real device execution | **DEVICE_REQUIRED** |
| STORE GO | **Forbidden** |
