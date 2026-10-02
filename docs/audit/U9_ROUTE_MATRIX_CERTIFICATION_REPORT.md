# T-046 — U9 Route Matrix Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-046 U9_ROUTE_MATRIX` |
| Date (UTC) | `2026-10-02` |
| Base | T-045 tip (`DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED`) |
| Evidence | `docs/audit/evidence/t046-u9-route-matrix/` |
| Matrices | `docs/audit/ROUTE_UNIFICATION_MATRIX.json` · `docs/audit/ADMIN_ROUTE_UNIFICATION_MATRIX.json` |
| Source inventory | `docs/audit/ROUTE_QUALITY_MATRIX.json` (415) + `/account` alias → **416** |
| Exit | **`ROUTES_CLASSIFIED_AND_CLOSED`** → **PASS** |

Authorities held: `INTERACTION_COMPONENT_AUTHORITY` · `CARD_SURFACE_AUTHORITY` · U5/U6/U7/U8.  
Boundaries: Mushaf text/mapping/reader ownership untouched · Prayer calculations/scheduling untouched.  
Admin success does **not** close public coverage.

Prerequisite: `docs/audit/U8_DEFERRED_IDENTITY_REPORT.md` = `DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED`.

---

## 1. Route Inventory

| Metric | Count |
|--------|------:|
| Quality matrix routes | 415 |
| U9 rows (incl. `/account` alias) | **416** |
| `UNCLASSIFIED` | **0** |
| Closed (`Status=CLOSED`) | **416** |
| Closure = PASS (all fields PASS) | 122 |
| Closure = KEEP_JUSTIFIED | 294 |

### Classification (U9 taxonomy)

| Class | Count |
|-------|------:|
| PUBLIC | 233 |
| UTILITY | 111 |
| ADMIN_ONLY | 42 |
| LEGAL | 11 |
| IMMERSIVE | 7 |
| AUTH | 5 |
| ACCOUNT | 4 |
| SETTINGS | 3 |

Required fields per route: Theme · Canvas · Buttons · Cards · Back · Floating · Loading · Empty · Error · Offline · RTL · Keyboard · Contrast · Startup CLS · Deferred Repaint · Evidence · Status.

Each field is **PASS** or **KEEP_JUSTIFIED** (with reason). No blank / UNCLASSIFIED field statuses.

---

## 2. Public Coverage

Priority public set (user-ordered):

| Route | Class | Closure |
|-------|-------|---------|
| `/` | PUBLIC | PASS |
| `/search` | PUBLIC | PASS |
| `/quran-hub` | PUBLIC | PASS |
| `/mushaf` | IMMERSIVE | KEEP_JUSTIFIED (MUSHAF_SPECIAL) |
| `/prayer-times` | PUBLIC | KEEP_JUSTIFIED (PRAYER_SPECIAL canvas) |
| `/lessons` | PUBLIC | PASS |
| `/hadith` | PUBLIC | PASS |
| `/fiqh` | PUBLIC | PASS |
| `/library` | UTILITY (redirect→`/search`) | PASS |
| `/account` | ACCOUNT (alias→`/profile`) | KEEP_JUSTIFIED |
| `/settings` | SETTINGS | KEEP_JUSTIFIED (keyboard) |

Public/non-admin rows: **374**. Feedback Loading PENDING on public: **0** (Phase 2 `ROUTE_FEEDBACK_PUBLIC`).  
Buttons/Cards/Back/Floating for public non-immersive: authority PASS via U5/U6/U7.  
Deferred Repaint: PASS via U8.

---

## 3. Admin Coverage

| Metric | Count |
|--------|------:|
| Admin rows | **42** |
| Classification | `ADMIN_ONLY` exclusively |
| Unclassified admin | **0** |
| Closed | **42** |

Admin field policy: Theme/Canvas/Buttons/Cards/Back/feedback → **KEEP_JUSTIFIED** (admin boundary). Documented ownership remains in `docs/admin/ADMIN_FINAL_ROUTE_AND_OWNERSHIP_MATRIX.md`.  
**Admin PASS is not used to claim public coverage.**

---

## 4. Failure Inventory

No route left `UNCLASSIFIED`.  
No required field left unset.  

Failures in the sense of “not full PASS on every field” are recorded as **KEEP_JUSTIFIED** residuals — see §5.

---

## 5. Open Route Debt

File: `docs/audit/evidence/t046-u9-route-matrix/open-route-debt.json`

| Metric | Count |
|--------|------:|
| Routes with ≥1 KEEP_JUSTIFIED field | **294** |
| Priority residual routes | `/mushaf` · `/prayer-times` · `/profile` · `/settings` · `/account` |

Dominant debt themes:

| Theme | Typical fields | Why KEEP_JUSTIFIED |
|-------|----------------|--------------------|
| Immersive mushaf | Canvas/Buttons/Cards/Back/Floating/Contrast | MUSHAF_SPECIAL boundary |
| Prayer special | Canvas | No calc/scheduling changes |
| Secondary public | RTL ASSUMED · Keyboard · Contrast · StartupCLS | Not per-route device certified |
| Admin | Most chrome/authority fields | ADMIN_ONLY boundary |
| `/account` | Routing | No AppRoutes `/account` — alias to `/profile` |

OPEN_ROUTE_DEBT ≠ UNCLASSIFIED. Debt is justified residual, not missing classification.

---

## 6. Exceptions

| Exception | Status |
|-----------|--------|
| Mushaf text / mapping / reader ownership | Untouched |
| Prayer calculations / scheduling | Untouched |
| `/account` missing Route | ACCOUNT alias → `/profile` KEEP_JUSTIFIED |
| `/library` redirect | UTILITY PASS (redirect closed) |
| Admin v3 / legacy surfaces | ADMIN_ONLY KEEP_JUSTIFIED; ownership matrix SoT |
| Device keyboard / WCAG per-route | KEEP_JUSTIFIED (DEVICE_REQUIRED) — not fake PASS |

---

## 7. Final Status

| Check | Result |
|-------|--------|
| Every route classified in U9 taxonomy | ✅ |
| Zero `UNCLASSIFIED` | ✅ |
| Every route `Status=CLOSED` | ✅ |
| Public vs Admin separated | ✅ |
| Priority public covered | ✅ |
| OPEN_ROUTE_DEBT published | ✅ |
| U8 prerequisite present | ✅ |
| Store / TestFlight started | ❌ (forbidden until exit) |

---

## 8. Exit Decision

| Criterion | Status |
|-----------|--------|
| `ROUTES_CLASSIFIED_AND_CLOSED` | ✅ |
| No UNCLASSIFIED route | ✅ |
| Fields PASS or KEEP_JUSTIFIED | ✅ |
| Admin not used for public close | ✅ |

**Final Decision: PASS** — `ROUTES_CLASSIFIED_AND_CLOSED`.

Gate: `pnpm --filter @workspace/majalis run test:u9-route-matrix`.

Do **not** start Store Release Content / App Store Readiness / TestFlight / iOS Release Candidate until this exit is on `main`.
