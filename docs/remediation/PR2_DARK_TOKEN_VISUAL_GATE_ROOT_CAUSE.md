# PR2 Dark Token — visual-snapshot / UI layout gates Root Cause

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Failing CI run | `36625823235` (head `d72f8df8f`) — pre-fix tip |
| Fix commit | `c32ef5775` — مواءمة بوابة chips مع حبر الليل الممتص |
| Squash on `main` | `e884d22d1` (#2364) |
| Production | `e884d22d` |
| Job step | `visual-snapshot` → `UI layout gates (calendar + lessons…)` → `test:ui-layout-gates` → `test:section-back-button` |

## PHASE 1 — Reproduction

### Command (same as CI)

```bash
pnpm --filter @workspace/majalis run test:ui-layout-gates
# chains into:
pnpm run test:section-back-button
# which runs:
node --import tsx src/lib/__tests__/mobile-back-lesson-chips-gate.test.ts
```

### Failed unit

| Item | Value |
|---|---|
| Test file | `artifacts/majalis/src/lib/__tests__/mobile-back-lesson-chips-gate.test.ts` |
| Assertion (old) | `/html\.dark[\s\S]*?--mj-chip-fg:\s*#f3f7f5/` |
| File read | `artifacts/majalis/src/styles/theme-aliases.css` |
| Expected | Cool night chip ink `#f3f7f5` under `html.dark` |
| Actual after PR2 absorb | Warm Dark System Contract `#EDE8DF` |

### Cascade failure (not independent defects)

1. `mobile-back-lesson-chips-gate` **FAIL** (stale regex)
2. `test:ui-layout-gates` fails → `visual-snapshot` job fails early
3. `Start preview` / `Visual snapshot gates` **skipped** (depends on prior step)
4. `visual-snapshot must not skip` → **FAIL** (correct protection; not the root bug)
5. `Verify build` / `ci-required` → **FAIL** (aggregate)

### Current token authority (post-PR2)

| Mode | `--mj-chip-bg` | `--mj-chip-fg` | `--mj-chip-border` | Source |
|---|---|---|---|---|
| Light | `var(--mj-surface)` | `var(--mj-ink)` | `var(--mj-hairline)` | `theme-aliases.css` `:root` |
| Dark | `#222c28` | `#EDE8DF` | `#35443F` | `theme-aliases.css` `html.dark` (allowlisted) |

Aligned night ink: `--mj-ink: #EDE8DF` (theme.css Dark System Contract + aliases).

### Computed intent (contract)

| Mode | FG | BG (chip) | Contrast (approx) |
|---|---|---|---|
| Light | `--mj-ink` ≈ `#15382d` on surface white | surface | AA held (existing gates) |
| Dark | `#EDE8DF` on `#222c28` | chip surface | Warm AA pair (same family as premium-dark AA suite) |

### Consumers (still `var(--mj-chip-*)`)

- `styles/pages/lessons.css` — filter chips / lessons filters
- `styles/sections-calm-polish.css` — badge/filter chips
- `styles/visual-identity-unify.css` — filter chip chrome (fallback literals only)
- `styles/interaction-states.css` — chip state fallbacks
- `styles/visual-layer-contrast-fix.css` — lesson filter chips

**Difference type:** Implementation Location / **stale expected hex** in the gate — not a missing token and not a visual regression of chip role. Product night ink was intentionally moved from cool `#f3f7f5` / competing `#121816` palette to warm contract `#EDE8DF`.

## PHASE 2 — Classification

### **A. STALE_IMPLEMENTATION_ASSERTION**

- Semantic authority correct (`theme-aliases` + `theme.css` contract).
- Dark bridges (`premium-dark-refine` / `dark-design-system` / `dark-mode-recovery`) declare **0** `--mj-*` after absorb.
- Gate still required pre-absorb cool hex `#f3f7f5`.
- **Not B** (tokens present; contrast family improved toward warm contract).
- **Not C** (chip bg/fg/border remain co-located in aliases light+dark blocks).

## PHASE 3 — Contract update (implemented in `c32ef5775`)

Updated assertion to warm contract:

```ts
assert.match(aliases, /html\.dark[\s\S]*?--mj-chip-fg:\s*#EDE8DF/i);
```

Preserved:

- Authority location = allowlisted `theme-aliases` (not dark legacy bridges)
- Active chip fg `#06231a` on selected
- Lessons consumers still reference `--mj-chip-*`
- No disable of `visual-snapshot` / must-not-skip
- No legacy `--mj-*` reintroduced into bridges
- No new token family / `!important` / hex systems

## PHASE 4–5 — Parity note

| Route / surface | Mode | Result |
|---|---|---|
| Lessons filter chips | Light / Dark | **EXPECTED_TOKEN_MIGRATION** (cool→warm ink) |
| Calendar / UI layout chain | — | PASS after fix (`test:ui-layout-gates`) |
| Mushaf / Prayer | — | Untouched by chip gate fix |

Snapshots were **not** auto-updated; CI visual-snapshot job passed after gate contract alignment (`36627837393`).

## PHASE 6–7 — Evidence

| Check | Result |
|---|---|
| `test:ui-layout-gates` (local on `e884d22d`) | PASS |
| `visual-system-inventory --check` | PASS · `mjDeclOutsideAllowlist=0` |
| CI after `c32ef5775` | visual-snapshot · Color contrast · Verify build · ci-required **SUCCESS** |
| `#2364` | **MERGED** · production `e884d22d` |

### Debt regression

| Metric | Pre-PR2 baseline | After PR2 + fix |
|---|---:|---:|
| `mjDeclOutsideAllowlist` | 30 | **0** |
| `hexInCss` ceiling | 9103 | **9090** |
| `important` | 4798 | **4798** |
| Dark bridge `--mj-*` decls | 30 | **0** |

## FINAL

**STATUS:** COMPLETE  
**FINAL DECISION:** READY_FOR_MERGE (already merged as #2364)

Do not re-run CI on `d72f8df8` without the chip-gate commit — that SHA is known-stale.
