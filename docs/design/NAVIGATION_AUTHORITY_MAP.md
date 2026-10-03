# NAVIGATION_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `NAVIGATION_AUTHORITY_ONLY` (product) |
| Source of truth | `config/navigation.ts` · `lib/nav-map.ts` · `config/sections.registry` |

One navigation language. Routes and labels derive from the registry — do not invent parallel nav trees in page CSS.

## Approved

| Surface | Component / owner |
|---|---|
| Bottom navigation | `BottomNavBar` ← `BOTTOM_NAV_TABS` / `navFor("bottom")` |
| Top chrome | `NavBar` |
| Side / drawer | `SideNavDrawer` |
| Breadcrumbs | `Breadcrumbs` · `ui/breadcrumb` |
| Section / hub navigators | Section hubs · `ExploreAlsoNav` · registry-driven links |
| Account / settings lists | `SettingsList` / `NavigationList` (list authority) |
| In-app programmatic nav | `lib/in-app-navigation.ts` · `lib/navigation.ts` |

## Classification

| Surface | Class |
|---|---|
| BottomNavBar · NavBar · SideNavDrawer · Breadcrumbs · config/navigation | APPROVED |
| Services center / sections index from registry | APPROVED |
| Admin v3 shell nav · `admin-v3/nav.ts` | SPECIAL_CASE (ADMIN_ONLY) |
| Mushaf page flip / ayah chrome nav | SPECIAL_CASE (MUSHAF_SPECIAL) |
| Page-local duplicate nav strips / hard-coded parallel trees | LEGACY |

## Visual / interaction contract

| Rule | Value |
|---|---|
| Active | `aria-current` / active tab id via `get-active-tab` — brand + surface muted |
| Inactive | muted ink |
| Icons | shared Lucide from registry · consistent size in chrome |
| Spacing / elevation | chrome tokens · `--z-bottom-nav` / `--z-app-header` |
| Typography | identity chrome scale |
| Transitions | short color/background only — no layout jump |
| Feedback | haptics on bottom tabs · prefetch on intent |
| Hierarchy | primaryNav → secondaryNav → footerNav → sections registry |

## Forbidden

- Second bottom-nav implementation
- Hard-coded label trees that diverge from `config/navigation.ts`
- Covering BottomNav with floating controls (see FLOATING_CONTROLS_POLICY)

## Gates

`test:tab-nav-authority` · bottom-nav / side-nav / floating gates
