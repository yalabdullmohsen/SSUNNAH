# Open Route Debt — Track Classification

| Field | Value |
|-------|-------|
| Baseline commit | `d2924d5fe` (full: `d2924d5fe7f7cc86cc089a57230dcd02b97f7aa8`) |
| Source inventory | `docs/audit/evidence/t046-u9-route-matrix/open-route-debt.json` (`count=294`) |
| U9 matrices | `docs/audit/ROUTE_UNIFICATION_MATRIX.json` · `docs/audit/ADMIN_ROUTE_UNIFICATION_MATRIX.json` |
| Quality matrix | `docs/audit/ROUTE_QUALITY_MATRIX.json` |
| Generated (UTC) | 2026-10-05T04:32:28.826Z |

## Purpose

Replaces the pre-track **UNKNOWN** bucket on all 294 U9 `KEEP_JUSTIFIED` route residuals with exactly one remediation class each. U9 exit `ROUTES_CLASSIFIED_AND_CLOSED` is unchanged — this file is for **Track classify → FIXABLE/KEEP/DEVICE** execution (see `SUNNAH_RADICAL_COMPLETION_LIVE_BASELINE_7846b787d.md`).

## Classification taxonomy

| Class | Meaning |
|-------|---------|
| **COMPLETE** | Full PASS closure — not listed in open-route-debt (122 routes elsewhere). |
| **PARTIAL** | Repository or matrix work remains (feedback/responsive/a11y) beyond pure device cert. |
| **NOT_APPLICABLE** | Redirect/alias routes excluded from debt inventory (not among the 294). |
| **KEEP_JUSTIFIED** | Documented product boundary — no fake PASS (admin, mushaf, prayer/adhan specials). |
| **DEAD_ROUTE** | Debt row with no live matrix route. |
| **DEVICE_REQUIRED** | Residual is per-route keyboard/WCAG/CLS/RTL device certification only. |
| **OWNER_ACTION** | Routing/product alias decision (e.g. `/account`). |

## Decision rules (deterministic)

1. Missing matrix row → **DEAD_ROUTE**.
2. `/account` Routing debt → **OWNER_ACTION**.
3. `ADMIN_ONLY` → **KEEP_JUSTIFIED**.
4. `/mushaf*` · `IMMERSIVE` · prayer/adhan/qibla specials in U9 §5 → **KEEP_JUSTIFIED**.
5. Device-only debt (RTL/Keyboard/Contrast/StartupCLS) + QM `PARTIAL` on a11y/responsive → **PARTIAL**.
6. Device-only debt, no QM PARTIAL → **DEVICE_REQUIRED**.
7. Mixed non-device KEEP fields → **PARTIAL**.

## Totals (294 items — zero UNKNOWN)

| Class | Count |
|-------|------:|
| COMPLETE | **0** |
| PARTIAL | **8** |
| NOT_APPLICABLE | **0** |
| KEEP_JUSTIFIED | **51** |
| DEAD_ROUTE | **0** |
| DEVICE_REQUIRED | **234** |
| OWNER_ACTION | **1** |
| **Sum** | **294** |

**Note:** `COMPLETE` and `NOT_APPLICABLE` are **0** within this inventory because the JSON enumerates only routes with ≥1 U9 `KEEP_JUSTIFIED` field. The complementary **122** PASS-closure routes are COMPLETE by definition and omitted from this file.

## FIXABLE — priority public routes

User-ordered set: `/` · `/search` · `/lessons` · `/hadith` · `/fiqh` · `/quran-hub` · `/settings` · `/mushaf` · `/prayer-times`.

Feedback contract keys: **Loading · Empty · Error · Offline · Stale · NoResults** (from `ROUTE_QUALITY_MATRIX.json`).

| Route | In open-route-debt? | Track class | Missing / PARTIAL feedback states | Other FIXABLE gaps |
|-------|--------------------|-------------|-------------------------------------|--------------------|
| `/` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: accessibility, tablet, largeText, zoom200 |
| `/search` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: accessibility, a11y |
| `/lessons` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: a11y |
| `/hadith` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: a11y |
| `/fiqh` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | — |
| `/quran-hub` | no | COMPLETE (PASS closure) | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: a11y |
| `/settings` | yes | PARTIAL | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: a11y; U9 open debt (PARTIAL): Keyboard |
| `/mushaf` | yes | KEEP_JUSTIFIED | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: accessibility, a11y; U9 open debt (KEEP_JUSTIFIED): Canvas, Buttons, Cards, Back, Floating, Keyboard, Contrast |
| `/prayer-times` | yes | KEEP_JUSTIFIED | — (all COMPLETE / NOT_APPLICABLE / KEEP as documented) | matrix PARTIAL: a11y; U9 open debt (KEEP_JUSTIFIED): Canvas |

### Priority summary (FIXABLE)

- **Loading / Empty / Error / Offline / Stale / NoResults:** none missing on the nine priority routes — Wave 4 + `ROUTE_FEEDBACK_COMPLETE_REPORT` PRIORITY_CLOSED holds.
- **`/`:** FIXABLE responsive — `tablet=PARTIAL` in quality matrix; not in open-route-debt (U9 PASS).
- **`/settings`:** track **PARTIAL** — open debt `Keyboard` + QM `a11y=PARTIAL` → device keyboard cert + a11y evidence pack.
- **`/mushaf` (+ child immersive routes):** **KEEP_JUSTIFIED** (MUSHAF_SPECIAL); QM `accessibility`/`a11y` PARTIAL → device/a11y evidence, not chrome PASS.
- **`/prayer-times`:** **KEEP_JUSTIFIED** (`Canvas` PRAYER_SPECIAL); QM `a11y=PARTIAL` → device a11y only.
- **`/search` · `/lessons` · `/hadith` · `/fiqh` · `/quran-hub`:** U9 PASS — no open-route-debt row; FIXABLE work is secondary (global device cert on ~227 public routes), not priority feedback.

## Full inventory (294 rows)

| # | Route | U9 class | Matrix class | Priority | Debt fields | Track class | Rationale |
|--:|-------|----------|--------------|:--------:|-------------|-------------|-----------|
| 1 | `/about` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility, visualSystem, tablet, largeText, zoom200. |
| 2 | `/academic-research` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 3 | `/academic-research/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 4 | `/academic-research/assistant` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 5 | `/academic-research/submit` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 6 | `/account` | ACCOUNT | ACCOUNT | yes | Routing | **OWNER_ACTION** | No AppRoutes `/account` row — alias to `/profile` (U9 §6). |
| 7 | `/account-deletion` | ACCOUNT | ACCOUNT |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 8 | `/adab-talab-ilm` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 9 | `/adhan-help` | PUBLIC | PUBLIC |  | Canvas, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | Domain-special surface (prayer/adhan/qibla canvas) — no calc/scheduling or compass ownership change. |
| 10 | `/adhan-settings` | SETTINGS | SETTINGS |  | Canvas, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | Domain-special surface (prayer/adhan/qibla canvas) — no calc/scheduling or compass ownership change. |
| 11 | `/adhkar` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 12 | `/adhkar/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 13 | `/admin` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 14 | `/admin/auto-content` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 15 | `/admin/automation` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 16 | `/admin/automation/center` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 17 | `/admin/automation/content-production` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 18 | `/admin/automation/dashboard` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 19 | `/admin/automation/platform` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 20 | `/admin/automation/review` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 21 | `/admin/automation/sources` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 22 | `/admin/autonomous-platform` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 23 | `/admin/content` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 24 | `/admin/content-import/image` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 25 | `/admin/content-import/url` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 26 | `/admin/content-production` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 27 | `/admin/dashboard` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 28 | `/admin/feature-status` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 29 | `/admin/fiqh-quality` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 30 | `/admin/fiqh-review` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 31 | `/admin/import` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 32 | `/admin/integrations/instagram` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 33 | `/admin/legacy` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 34 | `/admin/review-center` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 35 | `/admin/review-hub` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 36 | `/admin/sources` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 37 | `/admin/universities` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 38 | `/admin/users` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 39 | `/admin/v3` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 40 | `/admin/v3/analytics` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 41 | `/admin/v3/audit` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 42 | `/admin/v3/automation` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 43 | `/admin/v3/community` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 44 | `/admin/v3/content` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 45 | `/admin/v3/content/fawaid` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 46 | `/admin/v3/content/lessons` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 47 | `/admin/v3/content/sheikhs` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 48 | `/admin/v3/notifications` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 49 | `/admin/v3/review` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 50 | `/admin/v3/reviews` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 51 | `/admin/v3/settings` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 52 | `/admin/v3/system` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 53 | `/admin/v3/taxonomy` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 54 | `/admin/v3/users` | ADMIN_ONLY | ADMIN_ONLY |  | Theme, Canvas, Buttons, Cards, Back, Loading, Error, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | ADMIN_ONLY boundary — chrome/feedback KEEP per U9 admin policy. |
| 55 | `/akhlaq` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 56 | `/alamat-saah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 57 | `/amr-bil-maruf` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 58 | `/amrad-qalbiyya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 59 | `/annual-courses/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 60 | `/arabic-language` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 61 | `/arabic-language/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 62 | `/arabic-language/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 63 | `/arbaeen-nawawi` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 64 | `/arbaeen-nawawi/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 65 | `/arkan` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 66 | `/arkan-iman` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 67 | `/asma-husna` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 68 | `/assistant` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 69 | `/auth/callback` | AUTH | AUTH |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 70 | `/auth/update-password` | AUTH | AUTH |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 71 | `/c/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 72 | `/calendar` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 73 | `/car-mode` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 74 | `/cards` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 75 | `/competitions` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 76 | `/competitions/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 77 | `/contact` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 78 | `/daily-wird` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 79 | `/dalail-nubuwwah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 80 | `/dalail-nubuwwah/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 81 | `/dalail-nubuwwah/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 82 | `/data-licenses` | LEGAL | LEGAL |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 83 | `/dev/design-system` | UTILITY | UTILITY |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 84 | `/discover-islam` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 85 | `/discover-islam/articles/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 86 | `/discover-islam/contact` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 87 | `/discover-islam/doubts` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 88 | `/discover-islam/doubts/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 89 | `/discover-islam/how-to-convert` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 90 | `/discover-islam/new-muslim` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 91 | `/discover-islam/new-muslim/:day` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 92 | `/discover-islam/questions` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 93 | `/discover-islam/questions/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 94 | `/duas` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 95 | `/duas-quran` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 96 | `/durus-imaniyya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 97 | `/durus-imaniyya/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 98 | `/durus-imaniyya/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 99 | `/durus-mutanawwia` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 100 | `/durus-mutanawwia/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 101 | `/durus-mutanawwia/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 102 | `/fadail-aamal` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 103 | `/family` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 104 | `/fatwa-policy` | LEGAL | LEGAL |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 105 | `/fawaid` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 106 | `/feature-tour` | UTILITY | UTILITY |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 107 | `/fikr-waqia` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 108 | `/fikr-waqia/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 109 | `/fikr-waqia/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 110 | `/fiqh-qawaid` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 111 | `/fiqh/books/:bookId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 112 | `/fiqh/books/:bookId/chapters/:chapterId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 113 | `/fiqh/books/:bookId/lessons/:lessonId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 114 | `/fiqh/topics/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 115 | `/fiqh/usul` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 116 | `/flashcards` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 117 | `/hadith-science` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 118 | `/hadith/arbaeen-love-of-allah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 119 | `/hadith/books` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 120 | `/hadith/books-and-rulings` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 121 | `/hadith/daif` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 122 | `/hadith/mawdu` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 123 | `/hadith/sahih` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 124 | `/hajj` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 125 | `/hifz-path` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 126 | `/hifz-path/c/:category` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 127 | `/hifz-path/my` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 128 | `/hifz-path/p/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 129 | `/hifz-path/p/:slug/u/:unitId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 130 | `/hikam-salaf` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 131 | `/iman-topics` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 132 | `/iman-topics/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 133 | `/iman-topics/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 134 | `/institutions` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 135 | `/internal/status` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 136 | `/islam-stats` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 137 | `/islamic-directory` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 138 | `/islamic-glossary` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 139 | `/islamic-landmarks` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 140 | `/islamic-landmarks/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 141 | `/islamic-landmarks/map` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 142 | `/islamic-sects` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 143 | `/islamic-sects/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 144 | `/janaza` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 145 | `/janna-naar` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 146 | `/jumuah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 147 | `/knowledge-graph` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 148 | `/knowledge/:section` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 149 | `/knowledge/:section/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 150 | `/kuwait-lessons` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 151 | `/learn/lesson/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 152 | `/learn/series/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 153 | `/lessons/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 154 | `/lessons/archive` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 155 | `/login` | AUTH | AUTH |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility. |
| 156 | `/madhahib` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 157 | `/madhahib/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 158 | `/malaika` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 159 | `/maqasid-sharia` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 160 | `/maqasid-sharia/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 161 | `/maqasid-sharia/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 162 | `/mawarith` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 163 | `/mawarith/calculator` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 164 | `/mawsuaat` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 165 | `/mawsuaat/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 166 | `/mawsuaat/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 167 | `/memorization` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 168 | `/methodology` | LEGAL | LEGAL |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 169 | `/mind-map` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 170 | `/miracles` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 171 | `/miracles/quran` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 172 | `/miracles/sunnah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 173 | `/miracles/topic/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 174 | `/mosque-mode` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 175 | `/mushaf` | IMMERSIVE | IMMERSIVE | yes | Canvas, Buttons, Cards, Back, Floating, Keyboard, Contrast | **KEEP_JUSTIFIED** | MUSHAF_SPECIAL / IMMERSIVE — reader ownership untouched (U9 §5–§6). |
| 176 | `/mushaf/:surah` | IMMERSIVE | IMMERSIVE |  | Canvas, Buttons, Cards, Back, Floating, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | MUSHAF_SPECIAL / IMMERSIVE — reader ownership untouched (U9 §5–§6). |
| 177 | `/mushaf/bookmarks` | IMMERSIVE | IMMERSIVE |  | Canvas, Buttons, Cards, Back, Floating, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | MUSHAF_SPECIAL / IMMERSIVE — reader ownership untouched (U9 §5–§6). |
| 178 | `/mushaf/page/:page` | IMMERSIVE | IMMERSIVE |  | Canvas, Buttons, Cards, Back, Floating, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | MUSHAF_SPECIAL / IMMERSIVE — reader ownership untouched (U9 §5–§6). |
| 179 | `/mutashabihat` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 180 | `/my-learning` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 181 | `/my-submissions` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 182 | `/nations` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 183 | `/nations/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 184 | `/nikah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 185 | `/notification-settings` | SETTINGS | SETTINGS |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 186 | `/notifications-and-sound` | AUTH | AUTH |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 187 | `/occasions` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 188 | `/occasions-lessons` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 189 | `/offline` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 190 | `/prayer-ranks` | PUBLIC | PUBLIC |  | Canvas, RTL, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | Domain-special surface (prayer/adhan/qibla canvas) — no calc/scheduling or compass ownership change. |
| 191 | `/prayer-times` | PUBLIC | PUBLIC | yes | Canvas | **KEEP_JUSTIFIED** | Domain-special surface (prayer/adhan/qibla canvas) — no calc/scheduling or compass ownership change. |
| 192 | `/privacy` | LEGAL | LEGAL |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility, visualSystem, tablet, largeText, zoom200. |
| 193 | `/privacy-center` | LEGAL | LEGAL |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 194 | `/profile` | ACCOUNT | ACCOUNT | yes | RTL, Keyboard | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 195 | `/progress` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 196 | `/prophet-stories/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 197 | `/prophetic-medicine` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 198 | `/prophets` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility, visualSystem, tablet, largeText, zoom200, seo. |
| 199 | `/prophets-stories/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 200 | `/prophets/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 201 | `/prophets/tree` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 202 | `/qibla` | PUBLIC | PUBLIC |  | Canvas, Keyboard, Contrast, StartupCLS | **KEEP_JUSTIFIED** | Domain-special surface (prayer/adhan/qibla canvas) — no calc/scheduling or compass ownership change. |
| 203 | `/quiz` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 204 | `/quran-circles` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 205 | `/quran-engine` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 206 | `/quran-engine/viewer` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 207 | `/quran-hub/numbers` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 208 | `/quran-hub/qiraat` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 209 | `/quran-hub/seven-ahruf` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 210 | `/quran-hub/tajweed` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 211 | `/quran-hub/tajweed/:chapter` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 212 | `/quran-hub/terms` | LEGAL | LEGAL |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 213 | `/quran-hub/tilawa` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 214 | `/quran-knowledge` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 215 | `/quran-memorization` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 216 | `/quran/hifz-loop` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 217 | `/quran/makki-madani` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 218 | `/quran/memorization-plans` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 219 | `/quran/offline-player` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 220 | `/quran/people` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 221 | `/quran/people/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 222 | `/quran/revelation-order` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 223 | `/quran/search` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 224 | `/quran/surah-stories` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 225 | `/quran/surah-stories/:number` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 226 | `/quran/surahs` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 227 | `/quran/worship-hub` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 228 | `/raqaiq` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 229 | `/reading-plans` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 230 | `/register` | AUTH | AUTH |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility. |
| 231 | `/researcher` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 232 | `/researcher-profile` | ACCOUNT | ACCOUNT |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 233 | `/riba` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 234 | `/ruqya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 235 | `/sadaqa` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 236 | `/sahabah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 237 | `/salah-guide` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 238 | `/sawm` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 239 | `/scholars` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 240 | `/scholars/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 241 | `/scientific-announcements/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 242 | `/search/:q` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 243 | `/sections` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 244 | `/seerah` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 245 | `/settings` | SETTINGS | SETTINGS | yes | Keyboard | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: a11y. |
| 246 | `/shamael` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 247 | `/shubuhat` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 248 | `/sins-and-rights` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 249 | `/sins-and-rights/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 250 | `/sitemap` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 251 | `/sources` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 252 | `/sources/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 253 | `/stats` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 254 | `/stories` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 255 | `/study-room` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 256 | `/submit` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 257 | `/sujood-sahw` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 258 | `/sunan-yawmiyya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 259 | `/sunnah-studies` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 260 | `/sunnah-studies/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 261 | `/sunnah-studies/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 262 | `/support` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 263 | `/tafsir` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 264 | `/tahara` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 265 | `/talaq` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 266 | `/tarikh-islami` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 267 | `/tarikh-islami/:id` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 268 | `/tasbih` | PUBLIC | PUBLIC |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility, visualSystem, tablet, largeText, zoom200, seo. |
| 269 | `/tawba` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 270 | `/tawhid` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 271 | `/tawhid/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 272 | `/tazkiya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 273 | `/tazkiya-topics` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 274 | `/tazkiya-topics/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 275 | `/tazkiya-topics/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 276 | `/teachers` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 277 | `/teachers/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 278 | `/terms` | LEGAL | LEGAL |  | Keyboard, Contrast, StartupCLS | **PARTIAL** | U9 debt is device-cert only, but ROUTE_QUALITY_MATRIX marks PARTIAL: accessibility, visualSystem, tablet, largeText, zoom200. |
| 279 | `/transcribe` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 280 | `/udhiya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 281 | `/ulum-quran` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 282 | `/universities` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 283 | `/universities/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 284 | `/universities/compare` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 285 | `/updates` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 286 | `/updates/auto/:slug` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 287 | `/upload` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 288 | `/usra-mujtama` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 289 | `/usra-mujtama/:categoryId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 290 | `/usra-mujtama/:categoryId/:topicId` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 291 | `/vault` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 292 | `/waqf` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 293 | `/wasaya-nabawiyya` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
| 294 | `/zakat` | PUBLIC | PUBLIC |  | RTL, Keyboard, Contrast, StartupCLS | **DEVICE_REQUIRED** | Secondary route — RTL/keyboard/contrast/startup CLS not per-route device-certified (U9 §6). |
