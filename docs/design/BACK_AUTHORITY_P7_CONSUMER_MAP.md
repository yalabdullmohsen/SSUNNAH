# Back Authority P7 — Consumer Map

| Field | Value |
|---|---|
| Captured | 2026-10-01T01:52Z |
| Tip | `3b349830` + P7 WIP |

## Classification legend

`APP_BACK_CANONICAL` · `FLOATING_FALLBACK_JUSTIFIED` · `NATIVE_BACK` · `IMMERSIVE_SUPPRESSED` · `FIXED_BACK_BAR` · `HISTORY_KEEP_JUSTIFIED` · `CUSTOM_MIGRATE` · `DEAD_PROVEN`

## Implementations

| Mechanism | Role | Classification |
|---|---|---|
| `AppBackButton` | Sole back authority (variants: bar/inline/hero/lobby/legal/plain) | APP_BACK_CANONICAL |
| `GlobalBackControlHost` / `FloatingBackButton` | Single host; wraps `AppBackButton variant="bar"` | FIXED_BACK_BAR / FLOATING_FALLBACK_JUSTIFIED |
| `PageHeroIntegratedBack` | Lazy adapter → AppBackButton hero | APP_BACK_CANONICAL |
| `NativeBackButtonListener` | Capacitor hardware back | NATIVE_BACK |
| `goBackOrFallback` / `navigation-back.ts` | Shared history + SPA session | APP_BACK_CANONICAL |
| `MushafBookmarkEditorShell` `history.back()` | Sheet dismiss contract | HISTORY_KEEP_JUSTIFIED |
| Prayer `pts-back` IconButton | Prayer-special in-toolbar | CUSTOM_MIGRATE (out of P7) |

## Route ownership (proven)

| Route | In-page AppBack | Floating host | Class |
|---|---|---|---|
| `/` | no | hidden | DEAD_PROVEN (root) |
| `/mushaf*` | no | IMMERSIVE_SUPPRESSED | IMMERSIVE_SUPPRESSED |
| `/prayer-times` | custom pts-back | suppressed via AppBack autoHide | PRAYER_SPECIAL |
| `/quran-hub` | SectionLobby | suppressed | APP_BACK_CANONICAL |
| `/quran-hub/*` (sub) | no | FLOATING | FLOATING_FALLBACK_JUSTIFIED |
| `/lessons` | SectionLobby | suppressed | APP_BACK_CANONICAL |
| `/lessons/:id` | AppBack inline | suppressed | APP_BACK_CANONICAL |
| `/sources` | SectionLobby | suppressed | APP_BACK_CANONICAL |
| `/sources/:id` | no | FLOATING | FLOATING_FALLBACK_JUSTIFIED |
| `/competitions` | SectionLobby | suppressed | APP_BACK_CANONICAL |
| `/competitions/:id` | no | FLOATING | FLOATING_FALLBACK_JUSTIFIED |
| `/sections` | SectionLobby | suppressed | APP_BACK_CANONICAL |
| `/fiqh` | no | FLOATING | FLOATING_FALLBACK_JUSTIFIED |
| `/fiqh/books/*/lessons/*` | AppBack inline | suppressed | APP_BACK_CANONICAL |
| `/fiqh/books/*` (book/chapter) | no | FLOATING | FLOATING_FALLBACK_JUSTIFIED |
| `/search` `/settings*` `/profile*` `/adhan-*` | AppBack | suppressed | APP_BACK_CANONICAL |
| `/support` `/contact` | no | host routeHide | NATIVE_BACK (+ browser) — KEEP legal |
| `/login` `/register` | auth chrome | autoHide | AUTH |
| Hadith reader paths | AppBack | suppressed | APP_BACK_CANONICAL |

## CSS suppression (P7)

| Was | Now |
|---|---|
| calm-polish hid all in-page AppBack with `display:none !important` | **REMOVED** |
| Floating ownership via CSS hide wars | React: `hasInPageBackChrome` + DOM query + legal hide |

## Duplicate risk closed

- In-page AppBack visible again on lobbies/heroes.
- Host suppressed when `[data-app-back="1"]:not([data-fixed-back-bar="1"])` mounts.
- Observer rAF-debounced; disconnected when `routeHide`.
