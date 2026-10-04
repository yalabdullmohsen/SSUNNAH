# PR A — Selector winner cleanup

| Field | Value |
|---|---|
| Branch | `cursor/design-authority-pr-a-selector-cleanup` |
| Base | `origin/main` `a99d2fe5b` |
| Date | 2026-10-04 |

## Removed with proof

| Item | Proof | Winner kept |
|---|---|---|
| `.fm-parent { }` | Empty body; class remains structural on `FamilyModePage` | none needed |
| Early `.search-result-row` (padding+font only) | Shadowed by later layout block | later `.search-result-row` in FEATURE region |
| Mid `.search-result-row` + early `:hover` | Shadowed by later layout + premium hover | later layout + premium `:hover` |
| `.login-submit` on early button cluster | Premium seal is COMPONENT_WINNER | premium `.login-submit` cluster |

## Not removed (KEEP_COMPATIBILITY)

`styles/pages/{tasbih,tawhid,search,auth,user-stats}.css` — route imports still active (PRs C/D).

## Gate

`css-authority-graph-gate` allowlists exact defeated bodies and asserts winners remain + defeated hover does not return.

## Ceilings

No ceiling raise. No new CSS file.
