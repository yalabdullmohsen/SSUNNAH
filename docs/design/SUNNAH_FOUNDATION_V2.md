# Sunnah Foundation V2

## Relationship to PR-1

| Layer | File | Role |
|---|---|---|
| Foundation PR-1 | `sunnah-foundation-tokens.css` (`--sf-*`) | Literal SoT |
| **Foundation V2** | `sunnah-foundation-v2.css` (`--sf2-*`) | Semantic product roles |
| TS | `lib/sunnah-foundation-v2.ts` | Named exports |

V2 **does not** invent a competing emerald palette. It maps:

| Role | Token | Value (light) |
|---|---|---|
| Page background | `--sf2-page-bg` | `#F8F6F1` |
| Card background | `--sf2-card-bg` | `#FFFFFF` |
| Primary text | `--sf2-text-primary` | `#15382D` |
| Secondary text | `--sf2-text-secondary` | `#48645A` |
| Muted text | `--sf2-text-muted` | `#5F7168` |
| Primary action | `--sf2-action-primary` | `#0F5C3F` |
| Dark emerald | `--sf2-action-primary-deep` | `#0A4530` |
| Border | `--sf2-border-subtle` | `rgba(15,92,63,0.12)` |

Added in V2: overlay, skeleton, focus, selected, disabled, success/warning/error/info, citation/warning type roles, radius/space aliases.

## Contrast policy

- Normal text ≥ 4.5:1; large ≥ 3:1; project Playwright gate remains authoritative.  
- Do not apply hex mechanically without pair verification.  
- Dark theme remaps surfaces via `html.dark` / `data-theme="dark"`.

## Adoption

Wave 1: import V2 after PR-1; opt-in utilities `.sf2-page` / `.sf2-card-surface`.  
Later waves: migrate page shells to `--sf2-*` and retire redundant literal hex.
