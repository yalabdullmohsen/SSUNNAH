# Bottom navigation — state machine

## States

| State | Meaning |
|---|---|
| idle | Committed route; interactive |
| navigation-requested | User selected a tab; prefetch may run |
| route-committed | Wouter location matches selection |
| content-pending | Suspense / lazy chunk |
| content-ready | Route view mounted |
| navigation-failed | Lazy retry exhausted — shell stays interactive |

## Rules

1. Active item = `getActiveTab(committedLocation)` only.
2. Prefetch must not mutate global theme / `pts-immersive`.
3. Selecting the active tab does not require a new navigation.
4. Selecting a new tab supersedes pending prefetch intent for theme (theme follows commit only).
5. Pointer events on the nav stay enabled; no timeout unlock hacks.
6. Back/Forward update active state via location.

## Prayer mode

Bottom nav geometry is constant. Colors come from `html.pts-immersive` **only while** `commitRouteSurface` reports `prayer-dark`.
