# Prayer transition measurements

Local automation (source gates) — not a device profiler dump.

| Check | Method | Result |
|---|---|---|
| pts-immersive ownership | `navigation-prayer-stability-gate` | Prefetch paths must not `classList.add` |
| commit sync | App source + gate | `useLayoutEffect` + `commitRouteSurface` |
| PageChrome DOM | PageChromeSync | `useLayoutEffect` for `applyPageChromeDom` |
| Prayer calc | diff review | unchanged |

Device long-task / FPS: **DEVICE_REQUIRED** (Capacitor physical).

Before/after class-leak: before = warm/hover could leave `pts-immersive` on light routes; after = commit-only.
