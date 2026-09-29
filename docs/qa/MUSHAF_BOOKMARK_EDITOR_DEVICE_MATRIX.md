# Mushaf Bookmark Editor — Device Matrix

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/mushaf-bookmark-editor-viewport` |
| Related | `docs/remediation/MUSHAF_BOOKMARK_EDITOR_LAYOUT_ROOT_CAUSE.md` |
| Policy | Simulator ≠ real device. Untested hardware = **DEVICE_REQUIRED**. |

## Automated / browser (repository)

| Check | Status |
|---|---|
| Viewport portal gate (`mushaf-bookmark-editor-viewport-gate`) | PASS when green |
| Input-sheet VV metrics unit (`input-sheet-viewport-metrics`) — 375×667 / 390×844 / 430×932 | PASS when green |
| Advanced bookmarks gate | PASS when green |
| Responsive CSS (16px inputs, max-inline-size, VV vars) | PASS (static) |
| Browser responsive emulation (DevTools sizes below) | see table |

## Emulation sizes (static + optional manual)

| Size | Portrait sheet bounds | Note |
|---|---|---|
| 320×568 | static CSS contract | |
| 360×640 | static CSS contract | |
| 375×667 | static CSS contract | |
| 390×844 | static CSS contract | |
| 430×932 | static CSS contract | |
| Tablet portrait | static CSS contract | |
| Tablet landscape | static CSS contract if supported | |
| Zoom 200% browser | manual optional | |
| Large text | manual optional | |

## Physical / keyboard matrix

| Device / case | Portrait | Landscape | Light | Dark | Arabic KB | English KB | Hardware KB | Large text | Background/resume | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| iPhone small (SE-class) | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPhone modern | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPhone large | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| iPad | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| Android small | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |
| Android modern | — | — | — | — | — | — | — | — | — | DEVICE_REQUIRED |

## Journeys per device

Open «إضافة فاصل» · page sheet kinds (حفظ/مراجعة/شخصية/ختمة) · focus name · focus note · long Arabic text · show/hide keyboard · close via إغلاق · إلغاء · backdrop · Android back · Escape · reopen · verify reading page unchanged · no horizontal overflow · close always reachable.

Evidence required: model · OS · build id · date · result · path. No invented PASS.
