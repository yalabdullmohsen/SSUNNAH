# PR B — Token consumer migration

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-b-token-consumer-migration` |
| Base | `origin/main` `c3e8a3e37` |
| Date | 2026-10-04 |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Scope

Absorb orphan / fallback-only `--elite-*` consumers and external `--em-*`
consumers into canonical `--mj-*` / `--sf-*` / radius authorities.
Retire defeated `brand-v4.css` `--em-*` hex literals (theme-aliases remains
the SEMANTIC_BRIDGE owner).

## Families

| Family | Classification | Action |
|---|---|---|
| `--elite-*` (ink/white/green/sage/radius/border/shadow) | MIGRATE_CONSUMERS_THEN_REMOVE | Consumers → `--mj-*` / `--sf-radius-*` / `--radius-mj-*` / `--mj-hairline` / `--sf-shadow-*` |
| `--elite-forest` | KEEP_COMPATIBILITY_WITH_EVIDENCE | Dark ink bridge in `theme.css` / `theme-aliases` (`--mj-brand-deep`) |
| `--em-50/100/500/600/700/800/900/950` | MIGRATE_CONSUMERS_THEN_REMOVE (external) | Consumers → `--mj-brand*` |
| `--em-200/300/400` | SEMANTIC_BRIDGE_REQUIRED | Remain in `theme-aliases` (color-mix roles) |
| `--em-*` hex in `brand-v4.css` | DUPLICATE / DEAD | Literals removed; bridge owned by theme-aliases |
| `--ds-*` | SEMANTIC_BRIDGE_REQUIRED | Unchanged this PR (startup / DS contract) |
| `--msk-*` / `--majalis-*` / `--dm-*` / `--pd-*` | KEEP_COMPATIBILITY | High consumer counts; later waves |
| `--color-*` | PRODUCT dual | Unchanged |
| `--sf-*` / `--ss-*` / `--mj-*` / `--cs-*` | CANONICAL | Destination authorities |

## Measured

| Metric | Before (main) | After |
|---|---:|---:|
| cssFiles | 355 | 355 |
| important | 4742 | 4739 |
| hexInCss | 5615 | 5601 |
| sfTokenRefs | ~1192 | 1220 |
| buttonRelatedImportantApprox | 1138 | 1138 |
| buttonRelatedHexApprox | 975 | 973 |
| remaining `--elite-*` var() refs | hundreds | ~10 (forest bridge + KEEP sites) |
| `--em-*` decl owners | brand-v4 + theme-aliases | theme-aliases only |

Ceilings lowered to measured. No new token family. No Quran/Mushaf geometry change.

## Files (primary)

`sins-rights.css`, `pages/{search,settings,hadith,hadith-books,islamic-stories,notifications,daily-wird,qibla,quran-hub,fiqh-hub,tawhid}.css`, `index-deferred-pages.css`, `m2030/*`, `brand-v4.css`, `brand-v4-contrast-fixes.css`, `tokens.css`, debt budgets.

## Gates

- `token-role-authority-gate`
- `design-tokens-authority-gate`
- `css-authority-graph-gate`
- `visual-system-inventory --check`
- `interaction-system-inventory --check`
- `verify:preflight` / `verify:ci`
