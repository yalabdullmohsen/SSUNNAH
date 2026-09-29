# FINAL REMEDIATION — Live State (PHASE 0)

| Field | Value |
|---|---|
| Captured (UTC) | `2026-09-29T12:44Z` |
| Branch for this program | `cursor/final-remediation-p0-p1` |
| Evidence | `git fetch origin/main` · `https://www.ssunnah.com/version.json` · `git archive origin/main` inventory · GitHub Pulls API |
| Auditor rule | Live tips override older COMPLETE reports |

---

## 1) Tips — MATCH

| Item | Value |
|---|---|
| `origin/main` | `abd0ac4f3bb696d14a29526fd523644ec5814ac8` — `fix(auth): مواءمة سياسة كلمة المرور مع Supabase الإنتاج (P0) (#2350)` |
| Production `version.json` | `abd0ac4f` · HTTP 200 · `builtAt=2026-09-29T12:44:04.959Z` · `ref=main` · host `www.ssunnah.com` |
| Production vs main | **MATCH** |
| Prior tip (pre-auth) | `afcd4fd82` App Store review UI removal — superseded |
| Decision (carry-forward) | **`WEB_RELEASED_NATIVE_HOLD`** · Store **HOLD** |

`sunnah.site` returned HTTP 441 from this agent egress (bot challenge) — not used as SoT. Canonical production host for version pin: **`www.ssunnah.com`**.

---

## 2) Open PRs (live)

| PR | Branch | Title | Relation to this program |
|---|---|---|---|
| #2299 | `cursor/native-widgets-phase1` | Native widgets Phase 1 | **OUT OF SCOPE** (native) |
| #1791 | `fix/mobile-offline-first` | Mobile offline-first | **OUT OF SCOPE** (mobile) |

| Closed / merged since prior audit | |
|---|---|
| **#2350** | Password Policy P0 — **MERGED** `2026-09-29T12:42:32Z` → `abd0ac4f3` · on production |

Navigation × Prayer stability: **PR #2351** `cursor/final-remediation-p0-p1` (Ready) — awaiting Verify build + auto-merge.

---

## 3) Wave status (live code on `origin/main`)

| Wave | Status | Evidence |
|---|---|---|
| **Nav × Prayer stability (P0)** | **NOT ON MAIN** — WIP in this branch | `route-surface.ts` absent on `origin/main`; BottomNavBar/TopSectionBar still had `classList.add("pts-immersive")` on tip before this branch |
| **Password Policy (P0)** | **COMPLETE on main+prod** | `lib/password-policy.ts` · `PasswordPolicyChecklist` · gates · #2350 |
| **Startup / flicker / chunk** | **PARTIAL — product UI cleared** | `ChunkRecoveryToast` → `null` in prod path · `AppUpdateManager` quiet · gates `update-no-fullscreen-ui` · prayer first-frame #2306; CLS device **NOT_MEASURED** |
| **Token Authority (P1)** | **AUTHORITY declared · migration PARTIAL** | `DESIGN_TOKEN_AUTHORITY.md` · `--sf-*` / `--sf2-*` canonical · brand-v4/m2030/final-release still LEGACY_REQUIRED |
| **Dark Mode (P1)** | **AUTHORITY + ACTIVE_COMPATIBILITY** | `DARK_MODE_AUTHORITY.md` · layers recovery/refine/luxury still present as bridges |
| **Buttons (P1)** | **AUTHORITY · migration PARTIAL** | Interaction #2337–#2341 · Button imports **94** files · raw `<button>` still **1028** |
| **Forms / Feedback (P1)** | **AUTHORITY · migration PARTIAL** | #2343 · native `<select>` still **174** |
| **Cards / Surfaces (P1)** | **AUTHORITY · migration PARTIAL** | #2342 · `CARD_SURFACE_AUTHORITY` · soft-card refs **133** files |
| **Admin v3 interaction** | **AUTHORITY** | #2344 |
| **Legacy CSS retirement** | **MATRIX + PARTIAL** | #2346 · `LEGACY_CSS_RETIREMENT_MATRIX.md` · 4 `*-legacy.css` still shipped |
| **Mushaf CSS boundary** | **BOUNDARY + PARTIAL bridge** | #2346 · `MUSHAF_CSS_BOUNDARY.md` · live still imports Madinah bridge; VV bookmark editor merged `b36095db` |
| **Floating layers** | **POLICY AUTHORITY** | `FLOATING_CONTROLS_POLICY.md` (PR-4) — manager consolidation still open |
| **AppPage contract** | **PARTIAL** | UtilityScreen still **129** files |
| **Route quality matrix** | **INCOMPLETE** | Release UI inventory PENDING_PER_ROUTE for ~224 pages |
| **Store / Device / License** | **HOLD / DEVICE_REQUIRED / OWNER_ACTION** | unchanged — not FIXABLE_IN_REPOSITORY |

Visual + Interaction train **#2336–#2346**: MERGED and previously deployed (see `docs/design/SUNNAH_VISUAL_INTERACTION_FINAL_REPORT.md`). Do **not** reinvent token/card/button systems.

---

## 4) Measured inventory on `origin/main` @ `abd0ac4f3`

Source: `git archive origin/main artifacts/majalis/src` → ripgrep/find (exact counts).

| Metric | Count |
|---|---:|
| CSS files | **360** |
| Hex (`#` 3–8) in css/tsx/ts | **10432** |
| `!important` in CSS | **4727** |
| Raw `<button` elements (tsx) | **1028** |
| Files importing official `components/ui/button` | **94** |
| Native `<select` (tsx) | **174** |
| Files matching `soft-card` | **133** |
| Files using `UtilityScreen` | **129** |
| Dark/night-named files | **23** |
| `*-legacy.css` page files | **4** |
| `password-policy.ts` | **YES** |
| `route-surface.ts` | **NO** (until Phase 1 merges) |
| `app-update-manager.ts` | **YES** |

---

## 5) Program truth vs 2026-09-29 audit report

| Audit claim | Live correction |
|---|---|
| Password policy not on main | **Obsolete** — #2350 merged + prod MATCH |
| «تحديث العرض» user-facing | **Obsolete for fullscreen/toast** — toast null; gates forbid strings; quiet recovery remains |
| No token/button/card authority | **Obsolete** — authorities exist; debt is **migration residue** |
| Nav prayer leak | **Still true** until Phase 1 merges |
| Store GO possible from web polish | **False** — remains HOLD |

---

## 6) Explicit non-claims

`SUNNAH_FULL_REMEDIATION_COMPLETE` · `STORE GO` · `VISUAL_INTERACTION_COMPLETE` (device) · full Legacy CSS deleted · full Mushaf CSS extraction · CLS device-certified

---

## 7) Next execution order (this program)

1. **PHASE 1** — merge Navigation × Prayer `commitRouteSurface` ownership (this branch).
2. Re-measure + continue FIXABLE_IN_REPOSITORY only (no new token/card/button families).
3. Leave DEVICE_REQUIRED / OWNER_ACTION / BLOCKED_LICENSE / STORE HOLD honest.
