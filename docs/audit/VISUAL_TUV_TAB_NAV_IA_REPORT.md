# Visual T–U–V — Tabs · Navigation · IA

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave`

## Phase T — TAB_AUTHORITY_ONLY

| Class | Surfaces |
|---|---|
| APPROVED | `ContentTabs` / `PageTabs` · `SegmentedFilter` · BottomNav (nav) · ProphetStoryTabs |
| SPECIAL_CASE | Admin tabs · Mushaf chrome tabs |
| LEGACY | page-local `*-tabs-bar` DIY |

Map: `docs/design/TAB_AUTHORITY_MAP.md`  
CSS: `.ss-tabs*` + soft absorb on common bars in `ssunnah-card-unify.css`  
Migrated exemplars: `UlumQuranView` · `TawbaPage`

## Phase U — NAVIGATION_AUTHORITY_ONLY

Map: `docs/design/NAVIGATION_AUTHORITY_MAP.md`  
APPROVED: BottomNavBar · NavBar · SideNavDrawer · Breadcrumbs · `config/navigation.ts`

## Phase V — NAVIGATION_EXPERIENCE_UNIFIED

Map: `docs/design/NAVIGATION_EXPERIENCE_AUTHORITY.md`  
Hierarchy: chrome → primaryNav → secondaryNav → footerNav → section tabs

## Gate

`test:tab-nav-authority`

## Non-claims

لا rewrite لكل `role=tab` في المنتج · لا تغيير شجرة BottomNav · لا UNIFIED_100 · Admin/Mushaf SPECIAL_CASE
