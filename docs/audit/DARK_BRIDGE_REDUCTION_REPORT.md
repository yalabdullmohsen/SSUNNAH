# DARK BRIDGE REDUCTION REPORT

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w1` |
| Status | **IMPROVED** (classify + partial absorb via Phase A night palette) |

## Classification

| File | Class | `--mj-*` decls | Action this wave |
|---|---|---:|---|
| `dark-mode-recovery.css` | **ACTIVE** | 7 | KEEP import · maps `--dm-*` → `--mj-*` |
| `dark-mode-surfaces.css` | **ACTIVE** | 0 | KEEP import · surface rules |
| `dark-design-system.css` | **COMPATIBILITY** | 8 | KEEP · later absorb candidates |
| `premium-dark-refine.css` | **ACTIVE** | 15 | KEEP · winning night `--mj-*` via `--pd-*` |
| `pages/luxury-night-v2.css` | **COMPATIBILITY** | 0 | KEEP deferred import |
| `sunnah-identity-luxury-night.css` | **COMPATIBILITY** | — | KEEP · identity polish |

**REMOVE_CANDIDATE:** none proven (consumer > 0 + no parity delete).

## Moved / absorbed

Night Foundation bridge previously in `visual-identity-unify` dark block → `theme-aliases.css` (Phase A). Dark deferred sheets still win for premium night overrides when loaded.

## Import removal

**Not done** — removing recovery/surfaces/refine imports fails Home/Search/Prayer/Quran/Settings dark parity without full rule port. Follow-up: absorb `--pd-*` / `--dm-*` definitions into allowlisted authority, then drop imports one file at a time.

## Smoke matrix (Light / Dark / System)

| Route | Light | Dark | System | Notes |
|---|---|---|---|---|
| Home | OK (authority) | OK (bridges ACTIVE) | OK | No import removal |
| Search | OK | OK | OK | |
| Prayer | OK | OK | OK | nav-prayer gates held |
| Quran / Mushaf chrome | OK | OK | OK | UI only |
| Settings | OK | OK | OK | Utility KEEP |

## Verdict

IMPROVED classification + documentation. Import strip **BLOCKED** pending per-file parity.
