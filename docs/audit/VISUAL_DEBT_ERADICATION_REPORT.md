# VISUAL_DEBT_ERADICATION_REPORT

| Field | Value |
|-------|-------|
| Status | `VISUAL_DEBT_REDUCED` |
| Date UTC | 2026-10-03 |
| Policy | decreasing-ceilings · no new tokens · no raised ceilings |

## Before / after / % removed

| Metric | Before (main) | After | Removed | % |
|--------|---------------|-------|---------|---|
| `hexInCss` | 7022 | **6956** | 66 | **0.94%** |
| `inlineColorStyleMatches` | 45 | **39** | 6 | **13.3%** |
| `rawButtonFiles` (visual) | 97 | **84** | 13 | **13.4%** |
| `important` | 4747 | 4747 | 0 | 0% (held) |
| `rgbHslInCss` | 2087 | 2087 | 0 | 0% (held) |
| `boxShadowDecls` | 986 | 986 | 0 | 0% (held) |
| `borderRadiusPxDecls` | 392 | **392** | 0 | 0% (held, not raised) |
| `zIndexRawDecls` | 257 | 257 | 0 | 0% (held) |

## Method

- Absorb page inline colors into CSS
- Strip redundant `var(--token, #hex)` fallbacks where token is authoritative
- No new design language

## Remaining (classified)

| Stock | Class |
|-------|-------|
| Remaining hex/!important in page CSS | KEEP_JUSTIFIED — large-scale rewrite risks snapshot/parity; ceilings decreasing |
| Dynamic disease/sujood color maps | KEEP_JUSTIFIED — data-driven semantic colors |
| Mushaf measurement inline band geometry | MUSHAF_SPECIAL |

## Exit

```text
VISUAL_DEBT_REDUCED
NO_CEILING_RAISE
PERCENTAGES_RECORDED
```
