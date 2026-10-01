# U4 — STARTUP_CHROME_CLOSURE_REPORT

| Field | Value |
|-------|-------|
| Phase | **U4** Startup Chrome + CLS |
| Tip / Prod | `459878cf` **MATCH** · `builtAt=2026-10-01T19:56:41.830Z` |
| Smoke | `/` `/search` `/quran-hub` `/mushaf` `/prayer-times` → **200** |
| PR chain | `#2445` → `#2446` (SEO chrome) → `#2447` (home reserves) |
| Visual / Contrast | `#2447` visual-snapshot **PASS** · Color contrast **PASS** |
| Exit | **FAIL** — `STARTUP_CHROME_STABLE` / `CHROME_FP_EQUALS_FINAL` **not met** |

Evidence: `docs/performance/evidence/zero-startup-flicker-prod-459878cf/`  
Tool: `artifacts/majalis/scripts/measure-startup-flicker-u4.mjs` · 390×844 @2x · Hero Jump = presence (CLS owns content rect)

---

## 1. Root Causes Found

1. **Prerender SEO merge stripped startup chrome** (`post-build-seo.mjs`): pages like `/search` `/quran-hub` `/prayer-times` `/mushaf` shipped without `#mj-startup-chrome` and without `mj-lcp-critical` / `mj-cls-reserve` → Header/Bottom presence Jump and Search CLS ~0.93 (`#2446` fix).
2. **SEO shell removed on first `#root` child** before React chrome → flash gap (`#2446`: wait for header+bottom).
3. **Home content flow not reserved at FP**: absolute `#mj-startup-hero-ph` does not occupy document flow; when React mounts search+hero+start-here, large layout shifts remain. Raising CSS `min-height` alone (`#2447`) amplified first-mount CLS instead of eliminating it.
4. **Secondary CLS**: Search `navbar-v3__end` control mount; Prayer `lrf-skel--prayer` → real shell.

---

## 2. Fixes Applied

| PR | Change |
|----|--------|
| `#2445` / `139f85c5` | Wait for React chrome before skeleton remove; keep `data-sc`; lock chrome heights 65/113/64 |
| `#2446` / `b6b2f6bb` | Inject critical CSS + `#mj-startup-chrome` into prerender merge; SEO shell remove after chrome ready |
| `#2447` / `459878cf` | Home hero `min-height:18rem` + card box model; start-here ≥20rem; hero-ph uses `--mj-bg` |

---

## 3. Before Metrics (prod `139f85c5`, pre-SEO-chrome fix)

| Route | CLS | H / Hero / Nav / Back | Theme |
|-------|----:|----------------------:|------:|
| `/` | 0.0756 | 0 / 1* / 0 / 0 | 0 |
| `/search` | **0.9327** | 1 / 0 / 1 / 0 | 0 |
| `/quran-hub` | 0.0448 | 1 / 0 / 1 / 0 | 0 |
| `/mushaf` | 0 | 0 / 0 / 0 / 0 | 0 |
| `/prayer-times` | ~0 | 0 / 0 / 1 / 0 | 0 |

\*Hero Jump under rect contract; presence-only later = 0.

---

## 4. After Metrics (prod `459878cf`)

| Route | FP (ms) | CLS | Theme | H | Hero | Nav | Back | Contract |
|-------|--------:|----:|------:|--:|-----:|----:|-----:|----------|
| `/` | 1284 | **0.1267** | 0 | 0 | 0 | 0 | 0 | **FAIL** CLS |
| `/search` | 760 | **0.0304** | 0 | 0 | 0 | 0 | 0 | **FAIL** CLS |
| `/quran-hub` | 840 | 0.0017 | 0 | 0 | 0 | 0 | 0 | PASS |
| `/mushaf` | 944 | **0** | 0 | 0 | 0 | 0 | 0 | PASS |
| `/prayer-times` | 764 | **0.0116** | 0 | 0 | 0 | 0 | 0 | **FAIL** CLS |

Chrome jumps (Header / Hero presence / BottomNav / Back): **all 0** on all five routes.

---

## 5. Production Evidence

- `version.json`: commit `459878cf`, ref `main`, builtAt `2026-10-01T19:56:41.830Z`
- Smoke HTTP 200 on five routes
- HTML: `#mj-startup-chrome` + `mj-lcp-critical` present on home and prerender routes
- CI on `#2447`: build, repo-gates, static-checks, visual-snapshot, Color contrast = SUCCESS

---

## 6. Exit Decision

### FAIL — `STARTUP_CHROME_STABLE` not closed

**Met**

- Production MATCH tip
- Smoke 200
- Visual snapshot PASS / Contrast PASS (on merge PR)
- Header / Hero (presence) / BottomNav / Back Jump = 0
- Mushaf CLS = 0
- Quran Hub CLS &lt; 0.01
- Theme mutation = 0

**Remaining (block exit)**

| Contract | Actual | Need |
|----------|-------:|-----:|
| Home CLS | 0.1267 | &lt; 0.01 |
| Search CLS | 0.0304 | &lt; 0.01 |
| Prayer CLS | 0.0116 | &lt; 0.01 |

**Follow-up (U4 only — do not start LHCI/U5+)**

1. Flow-level home reserve inside `#root` at FP (not absolute-only hero ph) matching search+hero+start-here height, removed atomically when React home paints.
2. Stabilize Search chrome end-slot (auth/theme buttons) without late width change.
3. Align Prayer `lrf-skel--prayer` height with final immersive shell (or silent equal-height fallback).

No LHCI / Widgets / Watch / Store until the three CLS rows pass on production re-measure.
