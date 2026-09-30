# Startup · Typography · FOUC — Live Baseline (PHASE 0)

**Program:** SUNNAH STARTUP, TYPOGRAPHY, FOUC, LAYOUT STABILITY AND DEFENSIVE SECURITY CLOSURE  
**Phase:** 0 — Live baseline + reproduction evidence (**no product fix**)  
**Branch:** `cursor/startup-typography-fouc-p0`  
**Measured tip:** `369d8b17e` (`origin/main`)  
**Posture:** `WEB_RELEASED_NATIVE_HOLD`  
**Explicit non-claims:** no `DEVICE_TESTED` · no `WCAG CERTIFIED` · no `FULLY COMPLETE` · no `ZERO_SECURITY_RISK`

---

## 1. Reference state

| Field | Value |
|---|---|
| `origin/main` | `369d8b17e` — Mushaf Fluidity Optimization |
| Production `version.json` | **UNREACHABLE** from this agent egress (HTTP `441`) — MATCH deferred to Delivery |
| Open related PRs | `#2405` ADMIN-FINAL-1 (open, not merged) — independent train |
| Debt ceilings | Not raised |
| Quran / prayer / adhan | Untouched |

Historical RCA remains valid where it matches live code; this file supersedes **current-state** claims for the font-scale jump only.

Prior reports (not rewritten):  
`STARTUP_AND_DARK_MODE_ROOT_CAUSE.md` · `ZERO_FLICKER_LAYOUT_SHIFT_ROOT_CAUSE_PR0.md` · `SUNNAH_WAVE5_STARTUP_FOUC_CLS_CLOSURE_REPORT.md`

---

## 2. Proven root cause — UI font grow-then-shrink

### Cascade authorities (live)

| Order | Source | `html { font-size }` |
|---|---|---|
| 0 (inline critical) | `index.html` `#mj-lcp-critical` | `calc(100% * var(--ui-font-scale, 1))` |
| Sync #12 | `styles/typography-app.css` | `calc(100% * var(--ui-font-scale, 1))` |
| Sync #13 (**wins**) | `index.css` | **`16px`** (absolute) |
| Deferred idle | `styles/design-system.css` | `var(--ds-base)` where `--ds-base: 16px` |

**Boot script** (`mj-theme-boot` in `index.html`) sets:

```text
html.style.setProperty("--ui-font-scale", String(fontScale))
```

with product scales:

| Preference | `--ui-font-scale` |
|---|---|
| صغير | `0.92` |
| متوسط (default) | `1` |
| كبير | `1.08` |
| seniorMode | `1.16` |
| clamp | `[0.85, 1.35]` |

### Sync CSS import order (main.tsx)

`typography-app.css` is imported **immediately before** `index.css`. Same specificity (`html`); later rule wins → absolute `16px` nullifies the scale formula after the JS bundle CSS applies.

### Expected rem jump (browser root 16px reference)

| Scale | Early styled (critical + typography-app) | After `index.css` | Δ rem |
|---|---:|---:|---:|
| 0.85 | ≈13.60px | 16px | **+17.6%** |
| 0.92 | ≈14.72px | 16px | **+8.7%** |
| 1.00 | 16px | 16px | 0% |
| 1.08 | ≈17.28px | 16px | **−7.4%** |
| 1.16 | ≈18.56px | 16px | **−13.8%** |
| 1.35 | ≈21.60px | 16px | **−25.9%** |

**User-visible symptom:** with غير-default scale, first paint uses scaled rem; after sync CSS, all rem lengths snap to 16px base → grow then shrink (or shrink then grow for scale &lt; 1).

**Classification:** `FIXABLE_IN_REPOSITORY` — Phase 1 must unify to a single canonical `html` font-size formula (no competing absolute `16px`).

**Evidence gate:** `test:startup-typography-fouc-p0` (static cascade proof).

---

## 3. Timeline contract (code-derived; device timings DEVICE_REQUIRED)

| Mark | Mechanism | Notes |
|---|---|---|
| Theme + scale | `mj-theme-boot` inline | Sets theme attrs + `--ui-font-scale` before paint |
| Critical CSS | `#mj-lcp-critical` | Includes scaled `html` font-size + Amiri + MajlisAmiriFallback `size-adjust:105%` |
| `app-booting` | class on `<html>` | Cleared via `clearBooting` / shell-stable / 1400ms safety |
| Sync CSS | `main.tsx` ~22 sync imports | **Font-size jump here** when scale ≠ 1 |
| createRoot / App | after boot readiness | Chrome fallbacks → real Nav/Bottom |
| Deferred CSS | idle `import()` incl. `design-system.css` | Second absolute base (`--ds-base: 16px`) — FOUC/identity risk |
| Dark layers | deferred / theme provider | Possible late surface paint |
| Splash hide | after shell-stable or timeout | Must not reveal unstyled rem jump |

Device frame timestamps: **NOT MEASURED** this session (no TestFlight / local browser paint capture). Static cascade is sufficient to authorize Phase 1 typography fix.

---

## 4. Secondary jump / FOUC candidates (inventory — not fixed in P0)

| Candidate | Evidence | Phase |
|---|---|---|
| `MajlisAmiriFallback` `size-adjust: 105%` | `fonts-ui.css` ×2 + critical HTML | P2 metrics |
| ChromeNavFallback → NavBar | `App.tsx` Suspense | P4 |
| ChromeBottomFallback → BottomNavBar | `App.tsx` Suspense | P4 |
| Home Suspense shells | HomeHeroLcp / Search / Rest | P5 |
| Prayer fallback vs shell | prayer-route-shell | P6 |
| Deferred noncritical / dark CSS | `main.tsx` idle imports | P7 |
| Mushaf QPC font readiness | `useQpcPageFont` / VisualViewport | later mushaf phase (no QPC asset change) |
| Chunk recovery reload | `chunk-recovery.ts` | security/stability later |

---

## 5. Defensive security notes (startup-adjacent)

| Surface | Risk | P0 action |
|---|---|---|
| `localStorage` prefs in boot | Trusted for scale/theme only; no secrets | Document |
| Theme attrs before paint | Prevents flash; must stay deterministic | Hold |
| Chunk recovery reload | Loop risk if misconfigured | Later phase |
| SW controllerchange | Quiet path preferred | Later phase |
| No production exploit / no PII | — | Observed |

---

## 6. Reproduction matrix (static = PASS; device = PENDING)

| Case | Static cascade | Device paint |
|---|---|---|
| Scale 1.00 cold | Δ0 proven | DEVICE_REQUIRED |
| Scale 0.92 / 1.08 / 1.16 | Δ proven mathematically | DEVICE_REQUIRED |
| Light / Dark / System boot | Theme boot present | DEVICE_REQUIRED |
| Refresh / deep link | Same CSS order | DEVICE_REQUIRED |
| Mobile / desktop | Same CSS | DEVICE_REQUIRED |
| 200% zoom / Large Text | Not invalidated by cascade proof | DEVICE_REQUIRED |

---

## 7. Phase 0 acceptance

- [x] Tip measured from live `origin/main`
- [x] Competing `html font-size` authorities listed with import order
- [x] Jump table for product scales
- [x] Secondary candidates inventoried
- [x] Evidence gate wired
- [ ] Production MATCH (Delivery)
- [ ] Device timeline screenshots (DEVICE_REQUIRED — does not block Phase 1 code fix)

**Phase 0 verdict:** `BASELINE_LOCKED` · ready for Phase 1 typography authority unification after this PR merges + MATCH.

**Forbidden until Phase 1:** leaving dual competing root font-size definitions.

---

## Phase 1 addendum (post-MATCH `a688c5fa9`)

**Status:** product fix landed on branch `cursor/startup-typography-fouc-p1`.

| Before | After |
|---|---|
| `index.css` `html { font-size: 16px }` wins sync | `html { font-size: calc(100% * var(--ui-font-scale, 1)) }` |
| Deferred `design-system.css` `html { font-size: var(--ds-base) }` | same calc formula |
| Competing absolute base | Single scale formula critical→sync→deferred |

`--ds-base: 16px` remains for component-level uses only — not applied to `html`.  
Gate: `test:startup-typography-fouc-p1` (same file as P0 script, closure assertions).


---

## Phase 2 size-adjust (additive — 2026-09-30)

| Field | Value |
|---|---|
| Tip at P2 start | `93136b271` MATCH production |
| P0 | MERGED `#2406` `a688c5fa` |
| P1 | MERGED `#2407` `c22a3aa2` — `html{font-size:calc(100%*var(--ui-font-scale,1))}` held |
| Measurement | `artifacts/majalis/reports/ui-fallback-metrics.json` · Playwright HeadlessChrome |
| Best `size-adjust` | **97%** (sumAbsWidthΔ **13.83**) vs 105% (**32.97**) |
| Surfaces synced | `fonts-ui.css` · `critical-first-paint.css` · `index.html` `#mj-lcp-critical` MajlisAmiriFallback |
| Quran / prayer | Untouched |

P1 closed the rem authority jump. P2 reduces fallback↔Amiri metric jump when Amiri is not yet applied / optional swap.
