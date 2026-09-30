# Mushaf Protected Asset Manifest

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Tip at capture | `ada1f8af` |
| Violation class | **BLOCKED_QURAN_INTEGRITY** — stop · no merge · restore |

## Locked sources (byte-for-byte)

Verified by `pnpm --filter @workspace/majalis run verify:protected-quran-byte-lock`  
Lock file: `artifacts/majalis/public/data/quran/PROTECTED_BYTE_LOCK.json`

| Path | Role |
|---|---|
| `public/data/quran/manifest.json` | Quran corpus manifest |
| `public/data/quran/pages-manifest.json` | Page mapping / inventory |
| `src/lib/quran-data/basmala-qpc-words.ts` | Basmala QPC words |

## Count contracts

| Asset | Expected | How verified |
|---|---|---|
| Mushaf pages | **604** | `MUSHAF_PAGE_MAX` · integrity gates |
| QPC V2 fonts (`*.woff2`) | **604** | `public/fonts/qpc-v2` scan |
| Page JSON (`page-*.json`) | **≥604** | `public/data/quran-v2` |
| 15-line geometry | unchanged | mushaf line/geometry gates |
| Authentic / checksum baselines | unchanged | `verify:quran-data` · checksum gates |

## Forbidden without explicit Quran scope

- Quran text / tashkeel / stop marks / ayah numbers / order
- Page mapping / ayah positions / page JSON content
- QPC font binaries / page↔font association
- Checksum or mapping baseline edits to hide regressions
- Converting pages to images / generic font substitution

## Gate

`test:mushaf-final-integrity` — fails if byte lock, counts, or WAVE6 page-font contracts regress.
