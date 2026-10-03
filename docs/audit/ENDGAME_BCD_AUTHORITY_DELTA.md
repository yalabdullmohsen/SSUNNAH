# Endgame B/C/D Authority Delta

Date: 2026-10-03 · Mode: SUNNAH_AUTONOMOUS_ENDGAME_MODE

## B — Button

| Metric | Before | After |
|---|---:|---:|
| rawButtonFiles | 107 | **105** |
| rawButtonElements | 471 | **463** |
| officialButtonImportFiles | 256 | **257** |
| divSpanOnClick | 46 | 46 (KEEP_JUSTIFIED held) |

Conversions: `MushafBookmarksView` · `ProphetMushafMentions` → canonical `Button`.  
Ceilings rewritten via `interaction-system-inventory.mjs --write-budget`.

Exit: **BUTTON_AUTHORITY_IMPROVED**

## C — Card / visual geometry debt

| Metric | Before | After |
|---|---:|---:|
| borderRadiusPxDecls | 1221 | **1202** |
| boxShadowDecls | 1107 | **1047** |

Tokenized px radii in `notifications.css` (+ methodology pill). Surfaces remain AppCard/InteractiveCard/cs-card authorities.

Exit: **CARD_AUTHORITY_IMPROVED** (radius + shadow decl reduction)

## D — Route feedback

Required routes COMPLETE per `docs/audit/ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json` → status `ROUTE_FEEDBACK_COMPLETE`.

Exit: **ROUTE_FEEDBACK_COMPLETE**
