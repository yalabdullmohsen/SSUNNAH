# Mushaf Control Semantic Matrix

| Field | Value |
|---|---|
| Tip | `ada1f8af` + FINAL-1 |
| Authority | Interaction Component Authority · WAVE10 report |

## Live `/mushaf` surfaces

| Control | Classification | Notes |
|---|---|---|
| Back / exit | MUSHAF_SPECIAL_KEEP | Typed + named in ControlsLayer |
| More menu | USE_MENU_TRIGGER / KEEP | `aria-expanded` on chrome |
| Page arrows | MUSHAF_SPECIAL_KEEP | Geometry-coupled |
| Scrubber | MUSHAF_SPECIAL_KEEP | range input + labels |
| Play / Pause / Prev / Next | USE_BUTTON (dock/mini) | WAVE10 mini-player |
| Reciter / Speed | NATIVE_JUSTIFIED / KEEP | Select in audio dock |
| Search / Tafsir / Bookmark openers | MUSHAF_SPECIAL_KEEP | Chrome buttons typed/named |
| Ayah action sheet actions | MUSHAF_SPECIAL_KEEP | Typed native buttons |
| Bookmark composer Save/Cancel/Close | USE_BUTTON | WAVE10 + FINAL-1 focus field |
| Divider / mark editor | USE_BUTTON | same shell |
| Reading coach Skip/Next | USE_BUTTON | FINAL-1 |
| Madinah archived sheets | LEGACY_NOT_LIVE | not production entry |

## Acceptance

- Live unnamed IconButtons = 0 (scan)
- missing `type` on live chrome buttons = 0
- No new Button/Card/Form system
- WAVE6 page-turn / font / audio mapping untouched except direction-biased prefetch order
