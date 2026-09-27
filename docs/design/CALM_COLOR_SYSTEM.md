# Calm Color System — سُنّة (Wave 1)

Source of truth: `--sf-*` in `sunnah-foundation-tokens.css` · product roles: `--sf2-*` in `sunnah-foundation-v2.css`.

## Canonical palette

| Role | Token | Light value / derivation |
|---|---|---|
| Page | `--sf2-page-bg` | `#F8F6F1` warm ivory |
| Raised | `--sf2-card-bg` | `#FFFFFF` |
| Elevated / muted cream | `--sf2-elevated-bg` | `#EFE8DC` (one muted cream only) |
| Subtle sage | `--sf2-subtle-bg` | `--sf-emerald-50` |
| Primary action | `--sf2-action-primary` | `#0F5C3F` |
| Deep / dark surface action | `--sf2-action-primary-deep` | `#0A4530` |
| Emphasis interactive | `--sf2-action-primary-emphasis` | `#0C4F3A` |
| Divider | `--sf2-border-subtle` | emerald hairline ~12% |
| Gold (sparse) | `--sf2-accent-gold` | `#C9A82E` |

Emerald scale: `--sf-emerald-50…950` — one family; do not invent page-local greens.

## Text hierarchy

| Token | Use |
|---|---|
| `--sf2-text-primary` | Titles, body |
| `--sf2-text-secondary` | Supporting |
| `--sf2-text-muted` | Metadata (still AA ≥ 4.5:1 on page) |
| `--sf2-text-accent` | Links / interactive emphasis (**emerald**, not gold) |
| `--sf2-text-on-dark` / `-secondary` | Dark emerald surfaces |
| `--sf2-text-warning` | Warnings |
| `--sf2-text-disabled` | Disabled |

Calm UI = fewer surfaces and accents, **not** faint text.

## Gold policy

Allowed: premium accent · dark-surface emphasis · prayer countdown · progress · sparse divider.
Forbidden as default: body text · all links · every icon · every selected state · large borders · frequent metadata.

## Legacy note

`brand-v4` `--em-*` remains LEGACY_NON_SOT until later retirement waves. New UI must use `--sf2-*` / `--sf-*` only.
