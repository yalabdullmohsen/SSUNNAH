# Mushaf Bookmark Editor Layout — Root Cause

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Route | `/mushaf` |
| Surfaces | `MushafBookmarkComposer` («إضافة فاصل») · `MushafPageBookmarkSheet` («علامة مصحف») |
| Status | Confirmed from code inspection (browser/Capacitor iOS behavior) |

## Reproduction

1. Open `/mushaf` on iOS Safari / Capacitor WebView.  
2. Open «إضافة فاصل» (verse) or page bookmark sheet.  
3. Tap name / note / range input.  
4. Observe: page/chrome zoom or shrink, sheet wider than viewport, close/actions clipped, horizontal overflow, mushaf geometry jump; after dismiss layout may stay broken.

## Confirmed causes (code evidence)

### C1 — iOS focus zoom (inputs &lt; 16px)

- `reader-bookmarks.css`: `.rb-composer__note` and `.rb-page-sheet__note` set `font-size: 0.75rem` (~12px with root 16px).  
- Inputs/textareas use `font: inherit` → computed size **&lt; 16px**.  
- iOS Safari/WKWebView zooms the **entire** document on focus → mushaf + sheet scale up; close control can leave the reachable area.

### C2 — Editors not portaled; absolute inside fixed mushaf shell

- `MushafBookmarkComposer` / `MushafPageBookmarkSheet` render as children of `.nm-root` (`position: fixed; inset: 0; overflow: hidden; height: 100dvh`) with `position: absolute; bottom: 0; max-height: min(58–62%, …)`.  
- Other mushaf sheets (tafsir/search/ayah) use `createPortal(..., document.body)`.  
- Sheet sizing follows the **mushaf containing block**, not the visual viewport; keyboard resize and parent overflow clip the panel.

### C3 — Capacitor `Keyboard.resize: "body"` + layout remasure

- `capacitor.config.ts` / `setupKeyboard()` → `KeyboardResize.Body`.  
- `useStableMushafLayout` listens to `window` + `visualViewport` `resize` and rewrites `--mushaf-page-height`, `--mushaf-font-size`, etc. from `root.clientHeight`.  
- Keyboard open changes visual/layout height → geometry reapplied → mushaf page appears to resize/move while the editor is open.

### C4 — No keyboard / visualViewport binding on bookmark panels

- App sets `--keyboard-inset` via `useVisualViewportOffset`, but bookmark CSS never uses it.  
- Panels use `--safe-bottom` only; no `visualViewport.height` / `offsetTop` for max panel height.  
- Focused fields are not kept in a sticky chrome / scrollable body structure → actions buried under keyboard.

### C5 — No scroll-lock / cleanup contract on these editors

- Unlike `AppBottomSheet` / `AyahActionSheet`, bookmark editors do not lock body scroll or guarantee restore of body styles / focus blur on close.  
- Contributes to post-dismiss scroll/overflow residue when combined with iOS zoom (C1).

### Not confirmed as primary

- No `transform: scale()` on bookmark CSS (gate already forbids).  
- Pager `translate3d` is a **sibling** of the editors, not an ancestor containing block for `position: fixed` of a portaled sheet.  
- Quran text / page mapping modules are not involved in the zoom path.

## Why exit feels stuck

Close/cancel live in the same scrollable absolute panel. After iOS zoom (C1) and keyboard covering the bottom (C4), the close control and backdrop are off-screen or under the keyboard; mushaf gestures may still compete until ignore-selectors match.

## Browser vs Capacitor iOS

| Environment | Likely symptoms |
|---|---|
| Desktop browser | Less zoom; may still see clipping if viewport short |
| Mobile Safari | C1 zoom + C2 clipping |
| Capacitor iOS | C1 + C2 + C3 (Body resize) + C4 strongest |

## Fix direction (this change)

1. Portal editors to `document.body` with viewport-fixed shell (sticky head/actions, scrollable body).  
2. Force ≥16px on all editor inputs/textareas.  
3. Bind panel max size to `visualViewport` locally (CSS variables on the shell).  
4. Freeze `useStableMushafLayout` remasure while bookmark editor open.  
5. Unified open/close cleanup (scroll lock, blur, listeners, dataset flags).  
6. Do **not** change Capacitor Keyboard global mode in this pass (avoid regressing login/search/Admin).
