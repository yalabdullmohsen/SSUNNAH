# Navigation × Prayer — Root Cause (P0)

| Field | Value |
|---|---|
| Severity | P0 production |
| Branch | `cursor/nav-prayer-stability-p0` |
| Evidence date | 2026-09-27 |

## Symptom (user)

Home/Sections/Lessons/Quran ↔ Prayer: olive/dark prayer colors leak onto light routes; bottom nav looks mixed; occasional freeze / unresponsive chrome after rapid tab switches.

## Proven root cause (code)

### C + F — Unowned global `pts-immersive` writes

1. **Canonical owner (correct):** `App.tsx` `useLayoutEffect` toggles `document.documentElement.classList` `pts-immersive` from **committed** `location` via `isPrayerTimesPath`.

2. **Competing writers (defect):**
   - `BottomNavBar.triggerPrefetch("/prayer-times")` → `classList.add("pts-immersive")` on pointer/hover/focus **and** on the delayed warm loop (`setTimeout(warm, 25_000)` which prefetches **all** bottom tabs including Prayer while the user is still on a light route).
   - `TopSectionBar` `PREFETCH_BY_HREF["/prayer-times"]` → same `classList.add`.

3. **Why App cleanup does not save you:** the layout effect only re-runs when `onPrayer` / `immersive` deps change. Adding the class while `location` remains `/` (or `/sections`, …) leaves `html.pts-immersive` active. CSS in `prayer-route-shell.css` then paints olive `!important` on `body`, `#root`, `.app-shell`, `.bottom-nav`.

4. **First divergent frame:** any hover/warm of Prayer while committed path is non-prayer → mixed light content + prayer shell/nav.

### Secondary (contributes to lag, not the leak)

- `PageChromeSync` applies status-bar / `body.style.backgroundColor` in `useEffect` (after paint), so theme-color and inline body bg can trail the route by one frame when leaving Prayer even after `pts-immersive` is removed correctly.

### Ruled out / not primary

| Class | Finding |
|---|---|
| A Multiple bottom nav | One `BottomNavBar` in App shell + `ChromeBottomFallback` only during Suspense (`aria-hidden`) |
| B Local active tab | `getActiveTab(location)` — committed path |
| E Prayer calc ownership | Not altered; leak is document class, not calculation |
| H SW mismatch | Not required to explain the class leak |

## Fix direction

1. Single owner: `commitRouteSurface(pathname)` — only App layout commit.
2. Prefetch may load CSS/JS only — **never** mutate `pts-immersive`.
3. Warm loop must not paint Prayer surface.
4. `PageChromeSync` DOM apply in `useLayoutEffect` for atomic body/theme-color with route.

## Non-claims

Prayer calculation algorithm unchanged · Quran/Hadith text unchanged · No threshold weakening.
