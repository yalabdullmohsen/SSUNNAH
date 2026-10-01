# Back Authority P7 — Scope Manifest

| Field | Value |
|---|---|
| Captured | 2026-10-01T01:50Z |
| Branch | `cursor/back-authority-unify-p7` |
| Worktree | `/tmp/majlis-back-authority-p7` |
| Base | `origin/main` = `3b3498301` **MATCH** prod |
| Goal | Unify back ownership: in-page AppBack primary · Floating fallback · no CSS `!important` hide |

## In scope

| File | Change |
|---|---|
| `src/styles/sections-calm-polish.css` | Remove in-page AppBack `display:none !important` suppression |
| `src/lib/immersive-chrome.ts` | Proven-only `hasInPageBackChrome` expansion |
| `src/components/FloatingBackButton.tsx` | DOM safety net + rAF-debounced observer · legal hide |
| `src/lib/__tests__/back-authority-unify-gate.test.ts` | Prevention gate |
| `src/lib/__tests__/floating-back-button.test.ts` | Rule 6 + DOM assertions |
| `src/lib/__tests__/immersive-chrome.test.ts` | New path cases |
| `package.json` | `test:back-authority-unify` wiring |
| `docs/design/BACK_AUTHORITY_P7_*` | Manifest · consumer map · closure |

## Out of scope

- Route Feedback expansion
- ADMIN-FINAL-2
- Mushaf CSS bridge / WAVE6 fluidity
- Prayer calculation / route-surface theme
- New Back / Floating systems
- Debt ceiling raises
- Support/Contact in-page AppBack migration (legal pages: floating suppressed; native/browser back)

## Acceptance

- No AppBack + Floating together on proven in-page routes
- No Floating on immersive mushaf
- No `display:none !important` hiding AppBack in calm-polish
- Debt ceilings held / `!important` not raised
- verify:preflight + verify:ci PASS · PR merged · prod `version.json` MATCH

## IMPLEMENTATION_FROZEN

**DECLARED 2026-10-01T01:55Z** — code + gate + consumer map complete; no further scope expansion.
