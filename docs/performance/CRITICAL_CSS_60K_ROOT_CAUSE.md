# Critical CSS 60KiB — Root Cause (live build)

| Field | Value |
|---|---|
| Captured | 2026-09-29T19:00Z |
| Tip baseline | `origin/main` ≈ `10389211` / prior tip `c52bbbfd` era |
| Branch tip (work) | `cursor/critical-css-60k` |
| Method | Clean `pnpm --filter @workspace/majalis run build` + `gzipSync(level=9)` |

## BEFORE (failing tip)

| Metric | Value |
|---|---:|
| Critical file | `dist/assets/index-Byoj7yxl.css` |
| Raw | **338 428** bytes |
| Gzip (level 9) | **61 820** (gate assert path ~**61 904**) |
| Budget | **61 440** (60 KiB) |
| Overage | **~380–464** bytes gzip |
| Brotli (informational) | **50 485** |

## AFTER (this closure widen)

| Metric | Value |
|---|---:|
| Critical file | `dist/assets/index-BTVH112N.css` |
| Raw | **328 070** |
| Gzip (level 9) | **60 026** |
| Budget | **61 440** |
| Margin | **1 414** B (~1.38 KiB) |
| Cut vs before | **≈ −1 794** B gzip |

## Sync imports (`main.tsx`) — classification

| Asset | Class | Notes |
|---|---|---|
| Foundation / theme-aliases / dark-mode-recovery (sync) | REQUIRED_THEME_BOOT | Keep sync |
| RTL / html,body / chrome geometry | REQUIRED_FIRST_PAINT / REQUIRED_CHROME_GEOMETRY | Keep |
| `ssunnah-screen-patterns.css` | DEFER_SAFE → ScreenShell | Done earlier |
| `.soft-card` selector residue | MIGRATED_LEGACY / DEAD_PROVEN | Trimmed |
| calm `:root` `--color-*` / `--background` aliases | DUPLICATED vs unify+theme | Removed; kept `--surface-soft`/`--shadow`/radius |
| Breadcrumbs (interaction-states + index) | ROUTE_SPECIFIC | → `topic-page.css` + route hosts (no new CSS file) |
| Settings chrome in `index.css` | ROUTE_SPECIFIC / MIGRATED_LEGACY | Authority = `pages/settings.css` |
| `.fiqh-completion-bar*` / `.fiqh-quality-*` / `.platform-content-card` | DEAD_PROVEN | No TSX; admin fiqh-quality → v3 |

## Non-goals

- Raising 60 KiB budget
- Changing gzip measurement
- Blind defer of theme/dark-recovery/brand tokens
- Quran / prayer logic changes
