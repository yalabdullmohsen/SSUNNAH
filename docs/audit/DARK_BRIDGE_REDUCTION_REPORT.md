# DARK BRIDGE REDUCTION REPORT — Wave 3

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/debt-reduction-w3` |
| Status | **IMPROVED** (classify + absorb non-dark outside decls) |

## Classification

| File | Class | `--mj-*` decls outside allowlist | Action |
|---|---|---:|---|
| `dark-mode-recovery.css` | **ACTIVE** | 7 | KEEP import · `--dm-*` → `--mj-*` remaps |
| `dark-mode-surfaces.css` | **ACTIVE** | 0 | KEEP · surface rules |
| `dark-design-system.css` | **COMPATIBILITY** | 8 | KEEP · superseded by recovery/premium when loaded |
| `premium-dark-refine.css` | **ACTIVE** | 15 | KEEP · winning night `--mj-*` via `--pd-*` |
| `pages/luxury-night-v2.css` | **COMPATIBILITY** | 0 | KEEP deferred |
| `sunnah-identity-luxury-night.css` | **COMPATIBILITY** | — | KEEP identity polish |
| `dark-emerald` (legacy name) | **COMPATIBILITY** | via design-system | No standalone delete |

**REMOVE_CANDIDATE:** none with proven parity.

## Absorbed this wave (non-dark outside → theme-aliases / theme)

| Former file | Decls removed | Destination |
|---|---:|---|
| `page-shell.css` compact density | 4 | `theme-aliases` compact block |
| `native-feel.css` nav sign | 2 | `theme-aliases` |
| `thumb-zone.css` | 1 | `theme-aliases` |
| `interaction-states.css` | 1 | use aliases `--mj-brand-soft` |
| `card-system-tokens.css` | 2 | aliases owns `--mj-brand-soft` |

**mjDeclOutsideAllowlist:** 40 → **30** (only dark bridge remaps remain).

## Import removal

**Not done** for recovery / surfaces / refine / design-system — Home/Search/Prayer/Quran/Settings dark parity still depends on deferred cascade. Follow-up: port `--pd-*`/`--dm-*` winners into allowlisted authority then drop one file at a time.

## Smoke (authority)

| Route | Light | Dark | Notes |
|---|---|---|---|
| Home / Search / Prayer / Quran / Settings | OK | OK (bridges ACTIVE) | No import strip |
| Learning | OK | OK | Route matrix closed W3 |

## Verdict

IMPROVED · outside decls −10 · dark imports KEEP pending parity.
