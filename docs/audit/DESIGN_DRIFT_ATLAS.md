# DESIGN_DRIFT_ATLAS

Generated: 2026-10-06T19:04:01.462Z

Entries: **13** · Policy: no undocumented visual drift.

Screenshots: DEVICE_REQUIRED on absorb PRs (not stored in this static atlas).

| Priority | Domain | Signal | Authority | Sample locations |
|---|---|---|---|---|
| P0 | cards | bypass=202 adoption=9% | CARD_SURFACE_AUTHORITY · AppCard | `components/AdminRouteGuard.tsx`, `components/ExploreAlsoNav.tsx` |
| P0 | forms | bypass=147 adoption=23% | FORM_AUTHORITY_MAP · FormLabel/FieldError | `admin-v3/domains/analytics/AnalyticsPlatformPage.tsx`, `admin-v3/domains/community/UsersPage.tsx` |
| P0 | token:color | hardcoded color ×4859 | COLOR_AUTHORITY_MAP / DESIGN_TOKENS_AUTHORITY color.* | `features/mushaf-madinah/mushaf-madinah.css`, `styles/quran.css` |
| P0 | token:shadow | hardcoded shadow ×962 | CARD_SURFACE_AUTHORITY · AppCard | `features/mushaf-madinah/mushaf-madinah.css`, `styles/quran.css` |
| P1 | lists | bypass=74 adoption=9% | LIST_AUTHORITY_MAP · NavigationList | `admin-v3/centers/AdminV3CenterWorkspace.tsx`, `admin-v3/domains/ops/AutomationHubPage.tsx` |
| P1 | tabs | bypass=68 adoption=8% | TAB_AUTHORITY_MAP · ContentTabs | `admin-v3/domains/reviews/ReviewInboxPage.tsx`, `components/FiqhGuidePage.tsx` |
| P1 | token:spacing | hardcoded spacing ×180 | SPACING_AUTHORITY_MAP / spacing.* | `features/mushaf-madinah/mushaf-madinah.css`, `styles/quran.css` |
| P1 | token:radii | hardcoded radii ×132 | CARD_SURFACE_AUTHORITY · AppCard | `features/mushaf-madinah/mushaf-madinah.css`, `styles/quran.css` |
| P2 | buttons | bypass=2 adoption=99% | INTERACTION_COMPONENT_AUTHORITY · Button | `design-system/navigation.tsx`, `features/mushaf-madinah/MushafControls.tsx` |
| P2 | tables | bypass=13 adoption=43% | TABLE_AUTHORITY_MAP · DataTable | `components/prayer/PrayerAnnualTimetable.tsx`, `views/admin/FeatureStatusPage.tsx` |
| P2 | navigation | bypass=1 adoption=94% | NAVIGATION_AUTHORITY_MAP · AppBackButton/BottomNav | `components/ScrollToTop.tsx` |
| P2 | modals | bypass=1 adoption=97% | INTERACTION_COMPONENT_AUTHORITY · Button | `components/NativeBackButtonListener.tsx` |
| P2 | token:typography | hardcoded typography ×98 | TYPOGRAPHY_AUTHORITY_MAP / typography.* | `features/mushaf-madinah/mushaf-madinah.css`, `styles/quran.css` |

## Detail (top P0/P1)

### cards (P0)

- Root cause: Parallel implementations outside authority
- Authority: CARD_SURFACE_AUTHORITY · AppCard
- Screenshot: DEVICE_REQUIRED — capture on absorb PR
- Locations:
  - `components/AdminRouteGuard.tsx`
  - `components/ExploreAlsoNav.tsx`
  - `components/FiqhGuidePage.tsx`
  - `components/GlobalSearchModal.tsx`
  - `components/RelatedKnowledge.tsx`

### forms (P0)

- Root cause: Parallel implementations outside authority
- Authority: FORM_AUTHORITY_MAP · FormLabel/FieldError
- Screenshot: DEVICE_REQUIRED — capture on absorb PR
- Locations:
  - `admin-v3/domains/analytics/AnalyticsPlatformPage.tsx`
  - `admin-v3/domains/community/UsersPage.tsx`
  - `admin-v3/domains/content/EntityCrudPage.tsx`
  - `admin-v3/domains/content/RemainingEntityCrudPage.tsx`
  - `admin-v3/domains/taxonomy/TaxonomyPage.tsx`

### token:color (P0)

- Root cause: Literal CSS/TSX values not mapped through DESIGN_TOKENS_AUTHORITY
- Authority: COLOR_AUTHORITY_MAP / DESIGN_TOKENS_AUTHORITY color.*
- Screenshot: DEVICE_REQUIRED — before/after on high-traffic route
- Locations:
  - `features/mushaf-madinah/mushaf-madinah.css`
  - `styles/quran.css`
  - `styles/admin.css`

### token:shadow (P0)

- Root cause: Literal CSS/TSX values not mapped through DESIGN_TOKENS_AUTHORITY
- Authority: CARD_SURFACE_AUTHORITY · AppCard
- Screenshot: DEVICE_REQUIRED — before/after on high-traffic route
- Locations:
  - `features/mushaf-madinah/mushaf-madinah.css`
  - `styles/quran.css`
  - `styles/admin.css`

### lists (P1)

- Root cause: Parallel implementations outside authority
- Authority: LIST_AUTHORITY_MAP · NavigationList
- Screenshot: DEVICE_REQUIRED — capture on absorb PR
- Locations:
  - `admin-v3/centers/AdminV3CenterWorkspace.tsx`
  - `admin-v3/domains/ops/AutomationHubPage.tsx`
  - `admin-v3/domains/ops/OpsPages.tsx`
  - `components/ErrorBoundary.tsx`
  - `components/GlobalSearchModal.tsx`

### tabs (P1)

- Root cause: Parallel implementations outside authority
- Authority: TAB_AUTHORITY_MAP · ContentTabs
- Screenshot: DEVICE_REQUIRED — capture on absorb PR
- Locations:
  - `admin-v3/domains/reviews/ReviewInboxPage.tsx`
  - `components/FiqhGuidePage.tsx`
  - `components/GlobalSearchModal.tsx`
  - `components/adhan/PrayerAudioPicker.tsx`
  - `components/admin/review-hub/ReviewHubWorkspace.tsx`

### token:spacing (P1)

- Root cause: Literal CSS/TSX values not mapped through DESIGN_TOKENS_AUTHORITY
- Authority: SPACING_AUTHORITY_MAP / spacing.*
- Screenshot: DEVICE_REQUIRED — before/after on high-traffic route
- Locations:
  - `features/mushaf-madinah/mushaf-madinah.css`
  - `styles/quran.css`
  - `styles/pages/prophet-stories.css`

### token:radii (P1)

- Root cause: Literal CSS/TSX values not mapped through DESIGN_TOKENS_AUTHORITY
- Authority: CARD_SURFACE_AUTHORITY · AppCard
- Screenshot: DEVICE_REQUIRED — before/after on high-traffic route
- Locations:
  - `features/mushaf-madinah/mushaf-madinah.css`
  - `styles/quran.css`
  - `styles/admin.css`
