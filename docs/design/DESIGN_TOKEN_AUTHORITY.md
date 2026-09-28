# Design Token Authority — سُنّة (Phase 5)

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/design-ux-a11y-p5` |
| Base tip | `b64319d06` (Phase 4) |
| Product | `artifacts/majalis` only |

## Authority order (runtime)

| Priority | Layer | Prefix | Status |
|---:|---|---|---|
| 1 | `sunnah-foundation-tokens.css` | `--sf-*` | **CANONICAL** literals |
| 2 | `sunnah-foundation-v2.css` | `--sf2-*` | **CANONICAL** semantic product roles |
| 3 | `z-index-layers.css` | `--z-*` | **CANONICAL** elevation |
| 4 | `motion-policy.css` | `--motion-*` | **CANONICAL** motion |
| 5 | `page-container.css` | `--sf-content-*` | **CANONICAL** content widths |
| 6 | `design-tokens.css` / `--ss-*` bridges | `--ss-*` | **COMPATIBILITY** |
| 7 | `brand-v4*.css` / `final-release.css` / `m2030/` | mixed | **LEGACY_REQUIRED** until unused |
| 8 | Route CSS (mushaf / admin / prayer) | local | **ROUTE_SPECIFIC** — do not globalize |

**Rule:** new public UI uses `--sf2-*` (or `--sf-*` when no semantic exists). Do not invent a third palette.

## Semantic token map (light → dark via `html.dark` / `data-theme="dark"`)

| Role | Token | Notes |
|---|---|---|
| Page background | `--sf2-page-bg` | Warm ivory / night |
| Elevated / card | `--sf2-elevated-bg` / `--sf2-card-bg` | |
| Text primary / secondary / muted | `--sf2-text-*` | Never mute Quran/Hadith matn |
| Action primary | `--sf2-action-primary` | Emerald family |
| Borders / focus | `--sf2-border-subtle` / `--sf2-focus-ring` | Focus ≠ gold default |
| Success / warning / error / info | `--sf2-success` … `--sf2-info` | Soft companions `*-soft` |
| Spacing | `--sf2-space-1…8` | Alias of `--sf-space-*` |
| Type roles | `--sf2-type-*` | UI only — Quran fonts separate |
| Radius | `--sf2-radius-control|card|feature|sheet` | |
| Elevation | `--sf2-shadow-card` / `--sf2-shadow-none` | Subtle only |
| Content widths | `--sf-content-narrow|default|wide` | PageContainer |
| Safe area / bottom nav | `var(--inset-*)` (theme SoT) + `--bottom-nav-height` | via PageContainer |
| Z-index | `--z-base` … `--z-skip-link` | See stack below |
| Motion | `--motion-duration-*` / `--motion-ease-standard` | Reduced → 0ms |

## Z-index stack (canonical)

```
--z-base (0)
--z-raised (1)
--z-sticky (100)
--z-chrome (150)
--z-audio-mini (210)
--z-fab (220)
--z-audio-expanded (230)
--z-sheet-backdrop (240)
--z-sheet (250)
--z-dropdown (300)
--z-critical-dialog (400)
--z-toast (500)
--z-overlay-drawer (10040)
--z-skip-link (10050)
```

New CSS must use `var(--z-*)`. Random integers in new public components are a gate failure.

## Migration map (legacy → authority)

| Source | Example vars | Target |
|---|---|---|
| brand-v4 | `--brand-*`, emerald hex washes | `--sf2-action-primary` / `--sf2-page-bg` |
| m2030 (`src/styles/m2030/`) | campaign tokens | `--sf2-*` semantic only |
| final-release | release chrome overrides | Keep until unused; map to `--sf2-*` |
| theme / `--sunnah-*` | identity literals | Bridge via `--ss-*` → consume `--sf2-*` in UI |
| design-tokens `--ss-*` | product aliases | Prefer `--sf2-*` for new code |
| visual-redesign-v2 | V2 experiment tokens | **COMPATIBILITY** — no new consumers |
| Inline hex in components | `#0f5c3f` etc. | Forbidden in new DS files (allowlist: foundations + contrast fixtures) |

## Typography authority

| Role | Source | Notes |
|---|---|---|
| UI Arabic | Amiri (local woff2, SIL OFL) via `fonts-ui.css` | Weights **400–500** and **600–800** only |
| Fallback | system Arabic / `serif` stack in foundation | |
| Quran | `fonts-quran.css` / QPC | **Never** use UI font for mushaf text |
| Loading | `font-display: optional` | Reduce FOUT / layout shift |
| Min functional size | `--sf-type-body` = `1rem` | Do not shrink body below token |

## Component authority (Phase 5)

| Concern | Canonical |
|---|---|
| Loading / empty / error / offline | `LoadingStateV2` / `EmptyStateV2` / `ErrorStateV2` / `OfflineStateV2` |
| Screen status | `ScreenShell` (`ready|loading|empty|error|offline`) |
| Page layout (public) | `PageContainer` — **not** mushaf immersive, **not** Admin v3 shell |
| Buttons | `PrimaryButton` / `SecondaryButton` / `IconButton` / `ActionButton` |
| Cards | Card System V2 + AppCard / ContentCard (existing) |
| Dev gallery | `/dev/design-system` — **DEV only**, lazy, not in prod navigation |

## Gates

- `src/lib/__tests__/phase5-design-ux-gate.test.ts`
- Existing: `sunnah-design-system-consolidation-gate`, `ssunnah-screen-patterns-gate`, contrast AA gates

## Non-goals (this phase)

- Deleting brand-v4 / final-release / m2030 before unused proof
- New UI library or Framer Motion
- Changing mushaf page map, adhan, or religious text
- Claiming formal WCAG certification
