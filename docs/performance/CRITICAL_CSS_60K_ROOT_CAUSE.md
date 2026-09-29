# Critical CSS 60KiB — Root Cause (live build)

| Field | Value |
|---|---|
| Captured | 2026-09-29T18:18Z |
| Tip | `origin/main` = `10389211` (= production `version.json`) |
| Method | Clean `pnpm --filter @workspace/majalis run build` + `gzipSync(level=9)` gate |

## BEFORE (this tip)

| Metric | Value |
|---|---:|
| Critical file | `dist/assets/index-Byoj7yxl.css` |
| Raw | **338 428** bytes |
| Gzip (level 9) | **61 820** (gate saw **61 904** on same bytes via Node assert path) |
| Budget | **61 440** (60 KiB) |
| Overage | **~380–464** bytes gzip |
| Brotli (informational) | **50 485** |

Bundle budget script reported Main CSS gzip ≈ **60.5 KiB** (≤100 KiB OK) while **critical-css-gzip-gate** fails at 60 KiB.

## Sync imports (`main.tsx`) — raw source sizes

Largest contributors (source bytes, not post-minify share):

| File | Raw source |
|---|---:|
| `app/styles/theme.css` | 33 806 |
| `ssunnah-ux-polish.css` | 27 849 |
| `dark-mode-recovery.css` | 24 623 |
| `sections-calm-polish.css` | 22 465 |
| `visual-identity-unify.css` | 21 926 |
| `theme-aliases.css` | 21 215 |
| `brand-v4.css` | 20 007 |
| `index.css` | 141 710 (dominant rules volume) |
| `ssunnah-screen-patterns.css` | 3 057 |
| `visual-redesign-v2-tokens.css` | 7 211 |

`index.css` comments are stripped at build (0 comments in dist). Exact duplicate token decls across sync token files ≈ **70**.

## Classification (selected)

| Asset | Class | Notes |
|---|---|---|
| Foundation / theme-aliases / dark-mode-recovery (sync) | REQUIRED_THEME_BOOT | Keep sync |
| RTL / html,body / chrome geometry in index+theme | REQUIRED_FIRST_PAINT / REQUIRED_CHROME_GEOMETRY | Keep |
| `ssunnah-screen-patterns.css` | DEFER_SAFE → **route/component colocated** | Used via `DashboardScreen`/`ScreenShell`; Home is lazy — not needed before route chunk |
| `.soft-card` selector residue in sync polish | MIGRATED_LEGACY / DEAD_PROVEN for TSX | Class consumers = 0; keep `--soft-card-*` vars in aliases |
| `visual-identity-unify` re-import after final-release | ACTIVE_COMPATIBILITY | Deferred re-assert; sync copy still REQUIRED for first paint |
| Admin CSS | not in critical index | OK |
| Prayer calculation / Mushaf glyph CSS | out of scope | Untouched |

## Estimated levers (offline strip on built CSS)

| Lever | Approx gz after |
|---|---:|
| Strip `ss-screen*` rules | ~61 308 (barely under) |
| Strip `.soft-card` rules | ~60 671 |
| Both | ~60 174 |

## Chosen fix direction

1. Remove **sync** `ssunnah-screen-patterns.css` from `main.tsx`.
2. Colocate import on `ScreenShell.tsx` so Vite ships it with the screen/route graph (lazy Home), not the critical `index-*.css`.
3. Keep gate enforcement on the new authority location.
4. Remeasure; if margin &lt; ~0.5 KiB, trim dead `.soft-card,` prefixes only from grouped selectors in sync polish (no visual class consumers).

## Non-goals

- Raising 60 KiB budget
- Changing gzip measurement
- Blind defer of theme/dark-recovery/brand tokens
- Quran / prayer logic changes
