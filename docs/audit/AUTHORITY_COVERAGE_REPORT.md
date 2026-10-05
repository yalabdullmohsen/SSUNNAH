# AUTHORITY_COVERAGE_REPORT

Generated: 2026-10-05T17:49:37.461Z

## AUTHORITY_ADOPTION_PERCENTAGE: **47%**

| Family | Using authority | Bypassing | Relevant | Adoption % |
|---|---:|---:|---:|---:|
| cards | 20 | 198 | 218 | 9 |
| buttons | 334 | 13 | 347 | 96 |
| forms | 45 | 146 | 191 | 24 |
| tables | 10 | 13 | 23 | 43 |
| lists | 8 | 73 | 81 | 10 |
| tabs | 5 | 69 | 74 | 7 |
| navigation | 16 | 1 | 17 | 94 |
| modals | 27 | 1 | 28 | 96 |

## Top divergence sources

- **cards**: bypass=198 · adoption=9%
- **forms**: bypass=146 · adoption=24%
- **lists**: bypass=73 · adoption=10%
- **tabs**: bypass=69 · adoption=7%
- **tables**: bypass=13 · adoption=43%
- **buttons**: bypass=13 · adoption=96%

## Migration priority (non-SPECIAL samples)

### cards
- `components/AdminRouteGuard.tsx`
- `components/ExploreAlsoNav.tsx`
- `components/FiqhGuidePage.tsx`
- `components/GlobalSearchModal.tsx`
- `components/RelatedKnowledge.tsx`
- `components/adhan/PrayerAlertSettingsCard.tsx`
- `components/admin/SubmissionsReviewPanel.tsx`
- `components/admin/review-hub/ContentModerationCard.tsx`

### forms
- `components/AdminInlineEdit.tsx`
- `components/AdminSiteEditBar.tsx`
- `components/ContentActions.tsx`
- `components/GlobalSearchModal.tsx`
- `components/HijriMonthSelect.tsx`
- `components/SearchSuggestions.tsx`
- `components/adhan/AudioPromptsSettingsCard.tsx`
- `components/adhan/MuezzinPicker.tsx`

### tables
- `components/prayer/PrayerAnnualTimetable.tsx`
- `views/admin/FeatureStatusPage.tsx`
- `views/admin/KnowledgeReasoningSection.tsx`
- `views/admin/LessonsSection.tsx`
- `views/admin/LibrarySection.tsx`
- `views/admin/MiraclesSection.tsx`
- `views/admin/QaSection.tsx`
- `views/admin/ScholarlyVerificationSection.tsx`

### lists
- `admin-v3/centers/AdminV3CenterWorkspace.tsx`
- `components/ErrorBoundary.tsx`
- `components/GlobalSearchModal.tsx`
- `components/adhan/AudioPromptsSettingsCard.tsx`
- `components/adhan/PrayerAudioPicker.tsx`
- `components/audio/AudioLibrarySelectionPanel.tsx`
- `components/auth/PasswordPolicyChecklist.tsx`
- `components/calendar/CalendarDayCell.tsx`

### tabs
- `components/FiqhGuidePage.tsx`
- `components/GlobalSearchModal.tsx`
- `components/adhan/PrayerAudioPicker.tsx`
- `components/admin/review-hub/ReviewFilterBar.tsx`
- `components/admin/review-hub/ReviewHubWorkspace.tsx`
- `components/audio/AudioLibrarySelectionPanel.tsx`
- `components/citation/CitationModal.tsx`
- `components/home/HomeUniversalSearch.tsx`

### navigation
- `components/ScrollToTop.tsx`

### modals
- `components/NativeBackButtonListener.tsx`

## Policy

- Future visual work must prefer authority components.
- Mushaf / Prayer / Admin SPECIAL_CASE wrappers OK when they compose authority.
- No UNIFIED_100 claim from this report alone.
