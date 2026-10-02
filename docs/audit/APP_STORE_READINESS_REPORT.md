# T-048 — App Store Readiness Report

| Field | Value |
|-------|-------|
| Phase | `T-048 APP_STORE_READINESS` |
| Date (UTC) | `2026-10-02` |
| Base | T-047 tip (`STORE_RELEASE_CONTENT_CLEARED`) |
| Evidence | `docs/audit/evidence/t048-app-store-readiness/` |
| Exit | **`APP_STORE_READINESS_COMPLETE`** → **PASS** |

Meaning of exit: every checklist row is **PASS** or documented **OWNER_ACTION**; **zero UNKNOWN**; **zero FAIL**.  
Does **not** mean `STORE_GO`, ASC already filled, screenshots uploaded, or TestFlight started.

Forbidden this phase: TestFlight Upload · Release Candidate upload · Final Closure.

Prerequisites held: `STORE_RELEASE_CONTENT_CLEARANCE_REPORT.md` · `IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md`.

---

## 1. Metadata Review

| Field | Repo draft | Status |
|-------|------------|--------|
| App Name | سُنّة (`CFBundleDisplayName`) | PASS |
| Subtitle | القرآن والأذكار ودروس العلم (`listing.md`) | PASS |
| Description | `listing.md` / `description-ar.txt` | PASS |
| Keywords | `listing.md` / `keywords.txt` | PASS |
| Category | not sealed in ASC | OWNER_ACTION |
| Age Rating draft | 4+ (`age-rating.md`) | PASS (draft) |
| Contests vs `/competitions` | must not be blind None | OWNER_ACTION |
| Copyright | entity/year | OWNER_ACTION |
| Support URL | https://www.ssunnah.com/support | PASS |
| Privacy URL | https://www.ssunnah.com/privacy | PASS |
| Terms URL | https://www.ssunnah.com/terms | PASS |
| Marketing URL | https://www.ssunnah.com | PASS |
| Host consistency | `store/metadata-ar.md` still majlisilm.com | OWNER_ACTION |
| ASC fields pasted | drafts only | OWNER_ACTION |

SoT for Arabic listing copy: `artifacts/majalis/store/app-store/listing.md` (production host **ssunnah.com**).

---

## 2. Privacy Review

| Check | Status |
|-------|--------|
| `PrivacyInfo.xcprivacy` present | PASS |
| Tracking = false | PASS |
| Collected: Email (linked) · Coarse Location (unlinked) | PASS |
| No AudioData / no microphone usage string | PASS |
| ASC Privacy answers = manifest | **OWNER_ACTION** |

Draft mapping (not ASC confirmation): `docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md`.

---

## 3. Screenshot Inventory

| Device class | Required scenes | Status |
|--------------|-----------------|--------|
| iPhone | Home · Mushaf · Lessons · Prayer · Dhikr/Cards | **MISSING** |
| iPhone Max (6.7") | same | **MISSING** |
| iPad | same | **MISSING** |

No store PNG inventory under `store/screenshots/` (README only). Capture must be from **actual Store RC build** — OWNER_ACTION. Checklist class: OWNER_ACTION (not UNKNOWN).

---

## 4. Reviewer Information

| Item | Status |
|------|--------|
| Reviewer notes draft | PASS (`store/app-store/review-notes.md`) |
| Demo account documented | PASS (repo pack) |
| Demo credentials verified in ASC | OWNER_ACTION |
| Account deletion instructions | PASS (`/account-deletion`) |
| Content / religious notes | PASS |
| Background audio verification path | PASS |
| Competitions disclosure in age questionnaire | OWNER_ACTION |

---

## 5. Export Compliance

| Item | Status |
|------|--------|
| `ITSAppUsesNonExemptEncryption=false` in Info.plist | PASS |
| ASC export compliance form answered | OWNER_ACTION |

---

## 6. Owner Actions

Documented OWNER_ACTION rows (13) — also tracked in `docs/release/OWNER_ACTIONS_CURRENT.md`:

1. Choose ASC primary category  
2. Finalize Contests age-rating answer (product has `/competitions`)  
3. Set copyright string  
4. Align ASC URLs to **ssunnah.com** (retire majlisilm.com listing drafts)  
5. Paste listing metadata into ASC  
6. Confirm ASC Privacy nutrition labels = PrivacyInfo  
7. Capture & upload iPhone / iPhone Max / iPad screenshots from Store RC  
8. Paste & re-verify demo credentials in ASC  
9. Confirm ASC export compliance form  
10. Ensure notification wording does not overclaim delivery / adhan packs  
11. Distribution signing / profiles  
12. (related) Bundle ID portal / App Group registration if ASC differs  
13. Final submit click remains later phase  

Agents do **not** execute ASC console actions.

---

## 7. Final Status

| Metric | Count |
|--------|------:|
| Checklist items | 43 |
| PASS | 30 |
| OWNER_ACTION | 13 |
| FAIL | **0** |
| UNKNOWN | **0** |

Account features verified in product: Login · Logout · Delete Account · Export Data — listing does not invent extra social/account features.

Notification disclosure: usage string + Store RC `system-default` sound align with T-047; remote-notification capability disclosed as prayer/reminder path (not marketing).

---

## 8. Exit Decision

| Criterion | Status |
|-----------|--------|
| No unknown checklist rows | ✅ |
| All rows PASS or OWNER_ACTION | ✅ |
| Zero FAIL | ✅ |
| TestFlight / RC upload not started | ✅ |
| Exit code | **`APP_STORE_READINESS_COMPLETE`** |

**Final Decision: PASS**

Gate: `pnpm --filter @workspace/majalis run test:app-store-readiness`.

Do **not** start TestFlight / Release Candidate / Final Closure until owner closes OWNER_ACTION rows required for submit (out of T-048 exit definition).
