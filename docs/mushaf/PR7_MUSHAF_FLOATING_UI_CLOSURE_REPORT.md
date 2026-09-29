# PR7 — Mushaf Floating UI Closure Report

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Branch | `cursor/final-internal-closure-pr7` |
| Base | `origin/main` @ PR6 tip |
| Boundary | `docs/design/MUSHAF_CSS_BOUNDARY.md` — UI chrome only |

## A. Floating Layer Manager

### Owner

`artifacts/majalis/src/lib/floating-layer-manager.ts` + `FloatingLayerSync` mounted once in `App.tsx`.

### Slots

| Slot | z token | Notes |
|---|---|---|
| scroll-to-top | `--z-fab` | Bottom via `--scroll-to-top-bottom` |
| floating-back | `--z-fab` | Syncs `--global-back-bottom` |
| assistant-fab | `--z-fab` | Bottom via `--assistant-fab-bottom` |
| mini-player | `--z-audio-mini` | Attribute `data-quran-mini-player` |
| prayer-controls | `--z-fab` | Offset helper |
| mushaf-controls | `--z-chrome` | Immersive chrome |
| sticky-form-actions | `--z-sticky` | Forms |
| dialog-actions | `--z-overlay-dialog` | Modal footers |
| sheet-actions | `--z-sheet` | Sheets |

### Unified behaviors

- Reads `--keyboard-inset` from `VisualViewportKeyboardBridge`
- Mini-player / audio-dock height stacking
- `shouldSuppressBackgroundFloating()` when Dialog/Sheet/assistant panel/bookmark editor/large keyboard
- Sets `data-floating-suppress="1"` + CSS vars
- Consumers: ScrollToTop · GlobalBackControlHost · AssistantFloatingWidget · QuranMiniPlayerBar · MushafBookmarkEditorShell

### Collision rules enforced in React

1. At most one primary FAB lane (assistant yields under suppress)
2. ScrollToTop hidden under modal/keyboard
3. FloatingBack suppressed with in-page AppBack **and** under modal/editor
4. No new raw numeric z-index in manager API
5. No new `!important` for hide — React ownership + existing CSS `:has` remain documented

## B. Mushaf UI-only

| Change | Status |
|---|---|
| Bookmark editor → official `Button` for close/backdrop | Done |
| `data-mushaf-bookmark-editor` suppresses background FABs | Done |
| VV / sticky footer / 16px inputs | Unchanged (already gated) |
| Quran text / tashkeel / 604 / mapping / fonts | **NOT TOUCHED** |
| Madinah paper hex tokens | **KEEP** (route-local appearance) |
| Device VoiceOver / physical keyboard | **DEVICE_REQUIRED** |

## C. Gates

- `floating-layer-manager-gate`
- `mushaf-bookmark-editor-viewport-gate`
- Mushaf integrity suite (verify:ci)
- visual-snapshot / contrast (verify:ci)

## D. Exclusions

- Prayer calculation / adhan scheduling
- Store signing
- Mass mushaf CSS rewrite
- New token family / design system

## Verdict

**PR7_SHIPPED** when CI green + production match. FloatingLayerManager is the operational SoT for offsets/suppress; Mushaf bookmark chrome wired; Quran content immutable.
