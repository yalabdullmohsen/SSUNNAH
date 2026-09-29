# WAVE — Navigation / Prayer stability (P0)

| Field | Value |
|---|---|
| Priority | P0 |
| Branch | `cursor/nav-prayer-stability-p0` |
| Objective | Atomic route surface: no Prayer theme leak; one theme owner |
| Root cause | `docs/remediation/NAVIGATION_PRAYER_ROOT_CAUSE.md` |

## Scope

- `lib/route-surface.ts` owner
- BottomNavBar / TopSectionBar prefetch without global class
- App commit via `commitRouteSurface`
- PageChromeSync layout apply
- Focused gates + docs

## Out of scope

Cosmetic redesign · Prayer calculation · Quran/Hadith text · Commit/push (await owner review)
