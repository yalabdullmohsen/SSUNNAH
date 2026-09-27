# CI Contrast Root Cause — 2026-09-27

## Main baseline

| Field | Value |
|---|---|
| Main CI | **success** — run `36328482462` |
| Main commit | `a9e7bf87` — tawhid dark card contrast (#2307) |
| Prior main red | `d7eb35f1` (#2302) — Class B `/tawhid` dark library-card desc ~1.46:1 |
| Shared token fix | `tawhid.css` light `#3a4a42` + dark `#c8d5cf` for library-card desc |

Main Color contrast is green after #2307. Remaining blockers are open UI PRs.

## PR #2304 — homepage redesign (`cursor/homepage-redesign`)

| Field | Value |
|---|---|
| Failed run | `36324041776` |
| Job | Color contrast (Playwright) |
| Command | `pnpm --filter @workspace/majalis run test:color-contrast-gate` |
| On-brand | success (ran; not the blocker) |
| “must not skip” | fails because `CONTRAST_OUTCOME=failure` (cascade, not a skip) |

### Exact failure

| Page | Selector | Mode | Reason |
|---|---|---|---|
| `/` | `.home-page-hero .m2030-btn--ghost` | light | **NOT_FOUND** |

Not a ratio failure. Redesign removed the secondary ghost CTA; hero keeps one primary CTA + permanent `.hw3-chip--lead`.

### Secondary failure (visual-snapshot / ui-layout-gates)

| Gate | Issue |
|---|---|
| `floating-back-button.test.ts` | Expected `/scrollY\s*>\s*\d+/` in `ScrollToTop.tsx`; redesign used `scrollY > threshold` (variable) |

### Classification

- Contrast: **PRODUCT_DOM_CONTRACT** (selector stale vs intentional redesign)
- Scroll gate: **PRODUCT_SOURCE_CONTRACT** (meaningful threshold must stay numeric for source gate)
- Skip step: **EXPECTED_SKIP false** — cascade of failed contrast outcome → `PATH_LANE`/`ENVIRONMENT` not at fault
- Stale dist: no — tested PR head build artifact

### Fix applied

1. Gate target → `.home-page-hero .hw3-chip--lead` (always mounted)
2. `ScrollToTop`: `window.scrollY > 720` (meaningful scroll + source gate)

## PR #2305 — lessons redesign (`cursor/lessons-experience-redesign`)

| Field | Value |
|---|---|
| Failed run | `36324776631` |
| Job | Color contrast (Playwright) |
| Failures | **1/506** — `HARD_WHITE_BG` |
| On-brand | success (`ONBRAND_OUTCOME=success`) |

### Exact failure

| Route (file) | Selector | bg | Reason |
|---|---|---|---|
| `src/styles/pages/lessons.css` | `background` | `#FFFFFF` | **HARD_WHITE_BG** |

Static source scan rejects `background: #fff` / `#ffffff` in listed page CSS files. New redesign blocks used bare `#fff` on menu / map toggle / meta disclosure.

### Classification

- **PRODUCT_CODE** — hard white literals in new lessons surfaces
- Skip step: cascade only (`CONTRAST_OUTCOME=failure`)
- Not token collapse; not artifact mismatch

### Fix applied

Replace three `background: #fff` with `var(--surface-card, var(--mj-surface))`.

## Required gate skip classification summary

| Symptom | Cause class |
|---|---|
| “Contrast gates must not skip when…” red | Cascades when contrast step ≠ success — **not** path-lane skip |
| Path-lane | UI → color-contrast required and executed |
| Dist artifact | Downloaded from same workflow build job |

## Prefer shared tokens first

Canonical shared fix already on main (#2307) for tawhid dark desc. Homepage/lessons failures are DOM-contract and hard-white literals — not a second competing token system.
