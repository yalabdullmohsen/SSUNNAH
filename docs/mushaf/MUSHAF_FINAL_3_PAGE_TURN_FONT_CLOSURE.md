# MUSHAF-FINAL-3 — Page Turn Edges + Font Recovery

| Base | `771b55f7` FINAL-2 MATCH |

## Changes

- `onPointerCancel` invokes `onNavigateCancel` after visual reset (no stuck product freeze)
- Edge gate: clamp 1/604, phases DRAGGING/SETTLING/WAITING_*, pointercancel, safety timer cleanup, font bounds

## Non-touches

Quran assets · page mapping · settle curve · SWIPE thresholds without measurement
