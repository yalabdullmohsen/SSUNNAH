# AUTHORITY_COVERAGE_REPORT

Generated: 2026-10-03T09:21:30.179Z

## AUTHORITY_ADOPTION_PERCENTAGE: **43%**

| Family | Using authority | Bypassing | Relevant | Adoption % |
|---|---:|---:|---:|---:|
| cards | 20 | 208 | 228 | 9 |
| buttons | 250 | 100 | 350 | 71 |
| forms | 43 | 148 | 191 | 23 |
| tables | 9 | 14 | 23 | 39 |
| lists | 8 | 74 | 82 | 10 |
| tabs | 3 | 71 | 74 | 4 |
| navigation | 15 | 1 | 16 | 94 |
| modals | 26 | 1 | 27 | 96 |

## Top divergence sources

- **cards**: bypass=208 · adoption=9%
- **forms**: bypass=148 · adoption=23%
- **buttons**: bypass=100 · adoption=71%
- **lists**: bypass=74 · adoption=10%
- **tabs**: bypass=71 · adoption=4%
- **tables**: bypass=14 · adoption=39%

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

### buttons
- `components/AdminInlineEdit.tsx`
- `components/QuranViewer.tsx`
- `components/admin/SubmissionsReviewPanel.tsx`
- `components/admin/review-hub/ContentModerationCard.tsx`
- `components/admin/review-hub/LinearAudioReviewPlayer.tsx`
- `components/admin/review-hub/RecitationReviewCard.tsx`
- `components/admin/review-hub/ReviewFilterBar.tsx`
- `components/admin/review-hub/ReviewHubHeaderBar.tsx`

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
- `views/ProphetStoriesPage.tsx`
- `views/admin/FeatureStatusPage.tsx`
- `views/admin/KnowledgeReasoningSection.tsx`
- `views/admin/LessonsSection.tsx`
- `views/admin/LibrarySection.tsx`
- `views/admin/MiraclesSection.tsx`
- `views/admin/QaSection.tsx`

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
