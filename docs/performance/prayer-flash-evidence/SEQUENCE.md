# Prayer page flash — sequence evidence

## Before (root cause)

```
Home (cream) → tap Prayer
  → Suspense LazyRouteFallback (cream --mj-bg)
  → FIRST PAINT: cream/white frame   ← FLASH
  → useEffect: html.pts-immersive
  → lazy prayer-times.css arrives
  → SECOND PAINT: olive gradient + content
```

CLS: color + layout jump from cream skeleton → olive hero/list.

## After (fix)

```
Home → pointerdown Prayer
  → pts-immersive + prefetch prayer-times.css
  → Suspense lrf-skel--prayer (transparent on olive shell CSS)
  → useLayoutEffect confirms pts-immersive (before paint)
  → FIRST PAINT: olive continuous surface + prayer-shaped reserve
  → chunk/data: same surface, content fills reserved rows
```

CLS: reserved hero/rows (`pts-boot-*` / `lrf-skel__*`) — no cream frame.

## Components

- Flash source (before): `App.tsx` useEffect + cream LRF + deferred CSS
- Fix surfaces: `prayer-route-shell.css`, `LazyRouteFallback`, `PrayerTimesView` boot
