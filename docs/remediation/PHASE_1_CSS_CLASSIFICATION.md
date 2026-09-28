# PHASE 1 — CSS classification (conservative)

Date: 2026-09-28 · Branch: `cursor/startup-mushaf-persistence-p1`

## Buckets

| Bucket | Examples | Load timing |
|---|---|---|
| required before first paint | critical inline / boot theme, `dark-mode-recovery`, sync `interaction-states` | sync in `main.tsx` / `index.html` |
| app shell | `visual-identity-unify`, `ssunnah-ux-polish`, sections polish | sync early |
| route-specific | page CSS under `styles/pages/*` deferred via `index-deferred-pages` | after idle |
| mushaf-specific | `mushaf-reader.css`, `mushaf-madinah.css` (live still needs `mm-*`) | with `/mushaf` chunk |
| admin-specific | `admin/*` styles | admin routes only |
| legacy compatibility | `brand-v4*`, `m2030/*`, `final-release` | deferred — **not removed in P1** |

## Change in this phase

- Removed duplicate `interaction-states.css` import from the **dark boot** `Promise.all` path (already sync-imported above).
- Left brand-v4 / m2030 / final-release layers untouched.
- **BLOCKED:** stripping `mushaf-madinah.css` from live `/mushaf` until `mm-*` shell rules are extracted to a shared stylesheet (would break layout).

## Cascade conflicts needing a design phase

- `final-release` vs `dark-mode-recovery` ordering (documented reload of recovery after final-release).
- `visual-identity-unify` re-imported after `final-release` to win button/banner rules.
- Soft-cards / card-system / editorial stack — do not reorder in P1.
