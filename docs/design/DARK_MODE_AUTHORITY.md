# Dark Mode Authority — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-8)** |
| Scope | Product dark theme for `artifacts/majalis` (web) |
| Switch | `ThemePreferenceProvider` + `applyThemePreference` → `html[data-theme]` / `html.dark` |
| Mushaf | **MUSHAF_SPECIAL** — appearance via `data-mushaf-appearance` / mushaf CSS; do not bind reader ink to product dark |
| Store | **HOLD** · Web `WEB_RELEASED_NATIVE_HOLD` |

Companion: `docs/design/DESIGN_TOKEN_AUTHORITY.md` (token stack) · `artifacts/majalis/docs/PREMIUM_DARK_THEME.md` (premium refine notes).

## Single switch

| Layer | Role |
|---|---|
| Early boot (`index.html` inline) | First paint only — sets `data-theme` + `dark` from `localStorage` |
| `lib/boot-sequence.ts` | Pre-mount sync of `data-theme` / `theme-dark` |
| `lib/theme-preference.ts` → `applyThemePreference` | **Canonical runtime writer** |
| `ThemePreferenceProvider` | React preference (`light` / `dark` / `auto`) · loads dark CSS layers |

**Rule:** do not invent a second product theme switch (no page-local `dataset.theme` writers, no parallel `prefers-color-scheme` CSS as the product SoT). System preference is resolved only through `auto` in `theme-preference.ts`.

Selectors for dark remaps: `html[data-theme="dark"]` and `html.dark` (keep both — boot and class consumers).

## Canonical token source (dark)

Literals live in Foundation + product theme. Compatibility layers **bridge**; they must not invent a competing night palette.

| Priority | Layer | Prefix | Dark role |
|---:|---|---|---|
| 1 | `sunnah-foundation-tokens.css` | `--sf-color-luxury-night*` | Literal night family (`#0a1612` …) |
| 2 | `sunnah-foundation-v2.css` | `--sf2-*` | Semantic remap under `html[data-theme="dark"]` |
| 3 | `app/styles/theme.css` | `--mj-*` / `--surface-app` / `--dark-*` | **Product night contract** (`#0F1613` canvas · `#1B2421` surface · warm ink) |
| 4 | `ssunnah-theme-api.css` | `--ss-*` | Bridge only → `--mj-*` / `--color-*` |
| 5 | `design-tokens.css` / `theme-aliases.css` | `--ss-*` / aliases | Compat — inherit product night, no new canvas hex |
| 6 | `dark-mode-recovery.css` | `--dm-*` | Recovery bridge onto `--mj-*` / surfaces |
| 7 | `dark-design-system.css` / `premium-dark-refine.css` | `--pd-*` / consumers | Lazy refine — must rebind to contract, not fork palette |
| 8 | Route CSS (prayer / mushaf chrome) | local | **ROUTE_SPECIFIC** — do not globalize |

### Mapping (consume this way)

| Need | Prefer | Compat OK |
|---|---|---|
| Page canvas | `--sf2-page-bg` or `--surface-app` / `--mj-bg` | `--ss-color-bg` · `--dm-bg` · `--pd-bg-1` |
| Card / elevated | `--sf2-card-bg` / `--sf2-elevated-bg` | `--mj-surface*` · `--dark-card` · `--pd-card` |
| Text | `--sf2-text-*` | `--mj-ink*` · `--pd-ink*` · `--dm-text-*` |
| Brand on dark | `--mj-brand` / `--sf2-action-primary` (as remapped) | `--pd-emerald` · `--dm-primary` |
| Bottom nav night | `--dm-bottom-nav` (bridged from refine) | never a page-local nav hex |
| Borders | `--sf2-border-subtle` / `--mj-hairline` | `--pd-border*` · `--dm-border-*` |

**Product night canvas (contract):** `#0F1613` via `--surface-app` / `--mj-bg` / `--pd-bg-1` / `--dm-bg`.  
Foundation luxury night `#0a1612` remains the `--sf-*` literal for semantic `--sf2-*` and Visual Redesign V2 night — bridge via vars; do not ship a third canvas hex in page CSS.

## Forbidden

1. **Page-local dark hex overrides** for app canvas / bottom nav / card fill when a token exists (`#111714`, `#131A18`, `#101614`, … on `.hj-page`, `.sh-page`, `.bottom-nav`, etc.).
2. New parallel dark token families (`--xx-night-*`) outside Foundation / theme / documented bridges.
3. `filter: invert` / wholesale light→dark invert.
4. `!important` used only to hide a light leak (fix the consumer or raise token specificity instead).
5. Binding **mushaf page ink / QPC / madinah paper** to `html[data-theme="dark"]` — use mushaf appearance SoT.
6. Claiming Store GO or WCAG certification from this PR.

## Allowed exceptions

| Area | Why |
|---|---|
| Mushaf reader + `reader-page-chrome.css` | MUSHAF_SPECIAL |
| Prayer immersive (`pts-immersive` / route surface) | Route surface ownership — geometry stable; colors via route commit |
| Critical FOUC shell in `index.html` | First-paint only; keep in sync with contract when touched |
| Contrast fixtures / gate allowlists | Test evidence |

## PR-8 consolidation (this wave)

Small, safe hotspots only — **no** full CSS rewrite:

1. `styles/pages/hajj.css` — remove page-local dark canvas hex; inherit `--mj-bg`.
2. `styles/design-tokens.css` — dark `--bg` / `--ss-warm-bg` inherit `--surface-app` / `--mj-bg` (no competing `#131A18` canvas).
3. `styles/dark-mode-surfaces.css` — bottom nav uses `--dm-bottom-nav` instead of hard `#131a18`.
4. `styles/pages/shimael.css` — page canvas fallback aligned to product night (`--surface-app` / `#0F1613`).

## Gates

```bash
pnpm --filter @workspace/majalis run test:dark-mode-authority
pnpm --filter @workspace/majalis run test:sunnah-ui-refinement
pnpm --filter @workspace/majalis run test:dark-unified
```

Debt: run `inventory:visual-system --write-budget` only when hex / `!important` ceilings drop from consolidation.
