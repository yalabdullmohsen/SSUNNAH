# T-047 — Store Release Content Clearance Report

| Field | Value |
|-------|-------|
| Phase | `T-047 STORE_RELEASE_CONTENT_CLEARED` |
| Date (UTC) | `2026-10-02` |
| Base | T-046 tip (`ROUTES_CLASSIFIED_AND_CLOSED`) |
| Evidence | `docs/audit/evidence/t047-store-release-content/` · `reports/store-asset-inventory.json` |
| SoT | `docs/store-release/STORE_RELEASE_ALLOWLIST.json` · `AUDIO_RELEASE_ALLOWLIST.json` |
| Exit | **PASS** (all five codes) |

Prerequisite: `docs/audit/U9_ROUTE_MATRIX_CERTIFICATION_REPORT.md`.  
Not claimed: `CONTENT_CERTIFIED` · `AUDIO_CERTIFIED` · `STORE_GO` · App Store Readiness · TestFlight · Release Candidate upload.

---

## 1. Binary Inventory

Measured via `node scripts/build-store-asset-inventory.mjs --check-release` (+ dist strip verification).

| Metric | Value |
|--------|------:|
| Tree assets catalogued | 131 |
| Release flavor count | **83** |
| Release flavor `UNKNOWN` / `MISSING_EVIDENCE` | **0** |
| Stripped (policy) | 44 |
| Stream-only policy rows | 1 (+ recitations class) |
| Owner-decision rows | 2 (QPC · related) |

Domains covered: images · fonts · audio · JSON/offline content policy · bundled content · widget/watch **forbidden** for uncertified corpora · iOS Sounds CAF allowlist.

Dist RC scan after `store-strip-unresolved-assets`: non-allowlisted adhan media = 0 · `dist/fonts/qpc-v2` fonts = 0 · sheikh rasters = 0.

---

## 2. Approved Assets

| Class | Examples |
|-------|----------|
| `APPROVED_FOR_RELEASE` | Brand/icons/splash/xcassets · product SVG · prayer engine · npm MIT/Apache · `system-default` |
| `CC0_APPROVED` | `adhan-field(.m4a/-short/-full)` · `adhan-short-field(.caf/-full)` |
| `OFL_APPROVED` | `public/fonts/ui/**` + `OFL.txt` |
| `PRODUCT_OWNED` | Original UI / posters / live SVG / sheikh SVG avatars |

---

## 3. Removed Assets

| Class | Action | Examples |
|-------|--------|----------|
| `INTERNAL` / `INTERNAL_PENDING_OWNER` | `STRIP_FROM_RELEASE` | makkah/egypt/aqsa/gulf/takbeerat packs · `public/sounds/adhan/*` |
| `UNKNOWN` / `MISSING_EVIDENCE` | `STRIP_FROM_RELEASE` | haram-full · soft-alert · non-CC0 CAF · sheikh rasters |
| `EXCLUDED` | stay out | madinah · qatami |
| `OWNER_DECISION_REQUIRED` | Strip Path | QPC V2 fonts (no Licensed claim) |
| `CC0_ADHAN_REJECTED_QUALITY` | not in binary | Istanbul (T-027) |
| Provisional tones | Strip | `prayer-*.caf` / rings (prefer OS default) |

Tools: `scripts/store-strip-unresolved-assets.mjs` · `native-strip-qpc-fonts.mjs` · `native-strip-store-release-audio.mjs` · `mobile:sync:store`.

---

## 4. Stream Only Assets

| Source | Class | Forbidden |
|--------|-------|-----------|
| everyayah · mp3quran · Quran.com · AlQuran Cloud | `STREAM_ONLY` | binary packaging · offline package · widget · watch |

No recitation MP3 corpus in Store RC binary.

---

## 5. Audio Allowlist

| Claim | Result |
|-------|--------|
| `AUDIO_RELEASE_ALLOWLIST_LOCKED` | **true** (`STORE_RELEASE_ALLOWLIST.audioAllowlist.locked` · `AUDIO_RELEASE_ALLOWLIST.json`) |
| In binary | `system-default` · CC0 `field` · CC0 `field-full` |
| Istanbul | `CC0_ADHAN_REJECTED_QUALITY` — **not** in binary |
| Store catalog selectable voices | `system-default` only (`store-release-assets-gate`) |

`AUDIO_CERTIFIED` remains **false** (full corpus not certified).

---

## 6. Font Audit

| Font set | Class | RC action |
|----------|-------|-----------|
| UI OFL families | `OFL_APPROVED` | KEEP |
| QPC V2 | `OWNER_DECISION_REQUIRED` | `STRIP_FROM_RELEASE` (no written grant ⇒ no License Clearance claim) |

---

## 7. Image Audit

| Set | Class | RC action |
|-----|-------|-----------|
| Brand / icons / splash / posters SVG / live SVG | `PRODUCT_OWNED` | KEEP |
| Sheikh SVG avatars | `PRODUCT_OWNED` | KEEP |
| Sheikh rasters (jpg/webp/png) | UNKNOWN until clearance | `STRIP_FROM_RELEASE` |

`UNKNOWN_IMAGE` in release flavor = **0**.

---

## 8. Notices & Attributions

| Artifact | Status |
|----------|--------|
| `docs/store-release/THIRD_PARTY_NOTICES.md` | **COMPLETE** → `THIRD_PARTY_NOTICES_COMPLETE` |
| `docs/store-release/ATTRIBUTIONS.md` | **COMPLETE** → `ATTRIBUTIONS_COMPLETE` |
| `CREDITS.md` Store RC section | linked |
| In-app `/sources` | user-facing statuses |
| npm licenses | `test:licenses` |

Scope = Store RC binary boundary. Full web `CONTENT_CERTIFIED` remains false.

---

## 9. Final Release Boundary

| Policy | Enforced |
|--------|----------|
| No `UNKNOWN` in Release Flavor | ✅ |
| QPC without grant → strip | ✅ |
| Recitations STREAM_ONLY | ✅ |
| Adhan only CC0_APPROVED or SYSTEM_SOUND_FALLBACK | ✅ |
| Books/fatwa/lessons → metadata/link only in RC claims | ✅ |
| Widget/Watch content redistribute for uncertified corpora | ❌ forbidden |
| App Store Readiness / TestFlight | **not started** |

---

## 10. Exit Decision

| Code | Result |
|------|--------|
| `STORE_RELEASE_CONTENT_CLEARED` | ✅ |
| `RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS` | ✅ |
| `THIRD_PARTY_NOTICES_COMPLETE` | ✅ |
| `ATTRIBUTIONS_COMPLETE` | ✅ |
| `AUDIO_RELEASE_ALLOWLIST_LOCKED` | ✅ |

**Final Decision: PASS**

Gate: `pnpm --filter @workspace/majalis run test:store-release-content-clearance`  
Also: `pnpm run verify:store-assets` · `node scripts/build-store-asset-inventory.mjs --check-release`

Blocking elements: **none** for this exit. Residual OWNER/device items remain outside T-047 (`CONTENT_CERTIFIED`/`STORE_GO`/ASC metadata).
