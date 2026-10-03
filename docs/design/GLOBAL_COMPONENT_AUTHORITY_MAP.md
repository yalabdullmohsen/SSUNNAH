# GLOBAL COMPONENT AUTHORITY MAP

Status: **ACTIVE** · Wave 1 · `GLOBAL_COMPONENT_AUTHORITY_WAVE_1`

## Purpose

Single application-wide map for Hero / Card / List / Form / Navigation authorities.
Hadith surfaces are already unified separately and are out of scope here.

## APPROVED_AUTHORITY

| Domain | Component / CSS authority | Notes |
|---|---|---|
| **Hero (page)** | `components/ui/PageHero.tsx` → `.page-hero-mj` | Home + internal pages |
| **Hero (section)** | `styles/components/modern-section-shell.css` → `.mss-hero-surface` + section `*-hero` | Soft section heroes; no full-bleed green strip |
| **Card (app)** | `components/design-system/AppCard.tsx` → `.cs-card.ss-app-card` | Default content card |
| **Card (hub/section)** | `components/ui/HubCard.tsx` → `.hub-card` | Section gateway tiles |
| **Card (lesson)** | `components/lessons/UnifiedLessonCard.tsx` → lesson-unified + AppCard | Lessons list/detail |
| **List** | `components/design-system/ListSystem.tsx` + `SettingsList.tsx` | Simple/Interactive/Navigation/Result/Settings |
| **Form** | `components/design-system/FormFields.tsx` + `ui/input` / SearchInput | Labels, errors, actions, search field |
| **Navigation** | `BottomNavBar.tsx` + `SideNavDrawer.tsx` + `config/navigation.ts` | Primary chrome |
| **Tabs** | `components/design-system/TabSystem.tsx` | ContentTabs / PageTabs |

## LOCAL_VARIANT (allowed, CSS-bridged)

Section page heroes such as `.sw-hero`, `.seerah-hero`, `.quran-hub-hero`, `.fiqh-lux-book-hero`
remain as **selectors** for content structure, but visual surface/typography must route through
`modern-section-shell` / MSS tokens (`--mss-section-hero-bg`, `--mss-on-hero*`).

## DUPLICATE (forbidden to grow)

- New parallel card wrappers that reintroduce `.soft-card` on roots
- New page-local hero palettes with Hex/RGB authorities
- New settings list row shells outside SettingsList / NavigationList
- New bottom-nav / side-nav implementations outside approved chrome

## SPECIAL_CASE

- `home-page-hero` (LCP / ATF critical path)
- `m2030-hero` (legacy home experiment — bridged, do not expand)
- Mushaf / prayer immersive chrome (domain-specific; not section-card heroes)
- Admin V3 (isolated admin authority maps)

## DEAD

- Root `.soft-card` class on AppCard (retired)
- Parallel `cards-v3` / `design-system-v3` sync SoT imports in `main.tsx`

## Governance

Gate: `test:global-component-authority`

Baseline inventory: `artifacts/majalis/reports/global-ds/component-authority-baseline.json`

## Policy

- NO_NEW_TOKEN_FAMILY
- NO_DEBT_CEILING_RAISE
- UNKNOWN_COMPONENT_DEBT = 0 for classified systems in this map
