# CONTENT_STYLE_AUTHORITY — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `CONTENT_DESIGN_UNIFIED` |
| Canonical module | `artifacts/majalis/src/lib/ui-copy.ts` |
| Related | EMPTY_STATE_STANDARD · FEEDBACK_AUTHORITY · ACTION/EMPTY/STATUS keys |

**One Sunnah voice.** Product UI copy must prefer `ui-copy` tokens over page-local strings for repeated actions, empties, errors, and status.

## Voice principles

| Principle | Guidance |
|---|---|
| Arabic first | Clear MSA · respectful · non-blaming |
| Short CTAs | Verb-led: «ابدأ» · «إعادة المحاولة» · «استعرض الدروس» |
| Empty = recovery | Title + next step (+ CTA) via `EmptyStateV2` + `EMPTY.*` |
| Errors = actionable | `STATUS.loadError` / `networkError` — never shame the user |
| Consistency | Do not invent parallel synonyms for the same action |

## Canonical catalogs

| Catalog | Use |
|---|---|
| `BUTTON` | Primary short labels |
| `ACTION` | Browse / retry / continue / clear |
| `EMPTY` | Empty & no-results |
| `STATUS` | Load / network / updating |
| `SEARCH` | Placeholders |

Domain packs (`ui-copy-fiqh.ts`, prayer copy) may extend — not replace — the core voice.

## Forbidden

- Mixed «حاول مرة أخرى» / «أعد المحاولة» / «إعادة المحاولة» for the same control without reason → prefer `ACTION.retry` / `BUTTON.retry`
- English leftover CTAs in Arabic product chrome
- Empty copy without recovery path when one exists

## Scan

`scripts/product-maturity-engine.mjs` → `CONTENT_STYLE_SCAN` in `reports/product-maturity-engine.json`.

## Non-claims

لا UNIFIED_100 · Mushaf immersive chrome may keep specialized microcopy · migrate-when-touched.
