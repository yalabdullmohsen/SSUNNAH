# Route theme ownership

| Global side effect | Owner | Trigger |
|---|---|---|
| `html.pts-immersive` | `commitRouteSurface` ← App `useLayoutEffect` | Committed pathname |
| `html.chrome-immersive` | same | Immersive mushaf paths |
| `data-route-surface` | same | Committed pathname |
| `theme-color` / body inline bg / status bar | `applyPageChrome` ← `PageChromeSync` layout+effect | Path + resolved theme |
| Bottom nav active | `getActiveTab(location)` | Committed pathname |

## Forbidden

- `classList.add("pts-immersive")` from BottomNavBar / TopSectionBar / warm timers
- Prayer page mutating `document.body` theme without cleanup
- Second public bottom-nav mount outside App shell

## Modes

`standard-light` · `prayer-dark` · `mushaf-immersive` (see `lib/route-surface.ts`)
