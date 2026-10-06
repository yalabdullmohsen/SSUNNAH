# AUTHORITY_COVERAGE_REPORT

Generated: 2026-10-06T19:04:01.210Z

## AUTHORITY_ADOPTION_PERCENTAGE: **48%**

| Family | Using authority | Bypassing | Relevant | Adoption % |
|---|---:|---:|---:|---:|
| cards | 20 | 202 | 222 | 9 |
| buttons | 351 | 2 | 353 | 99 |
| forms | 45 | 147 | 192 | 23 |
| tables | 10 | 13 | 23 | 43 |
| lists | 7 | 74 | 81 | 9 |
| tabs | 6 | 68 | 74 | 8 |
| navigation | 16 | 1 | 17 | 94 |
| modals | 28 | 1 | 29 | 97 |

## Top divergence sources

- **cards**: bypass=202 · adoption=9%
- **forms**: bypass=147 · adoption=23%
- **lists**: bypass=74 · adoption=9%
- **tabs**: bypass=68 · adoption=8%
- **tables**: bypass=13 · adoption=43%
- **buttons**: bypass=2 · adoption=99%

## Migration priority (non-SPECIAL samples)

### cards
- `components/AdminRouteGuard.tsx`
- `components/ExploreAlsoNav.tsx`
- `components/FiqhGuidePage.tsx`
- `components/GlobalSearchModal.tsx`
- `components/RelatedKnowledge.tsx`
- `components/adhan/PrayerAlertSettingsCard.tsx`
- `components/adhkar/AdhkarRemindersCard.tsx`
- `components/admin/SubmissionsReviewPanel.tsx`

### buttons
- `design-system/navigation.tsx`

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
- `components/admin/review-hub/ReviewHubWorkspace.tsx`
- `components/audio/AudioLibrarySelectionPanel.tsx`
- `components/citation/CitationModal.tsx`
- `components/home/HomeUniversalSearch.tsx`
- `components/majlis/SmartSearchPanel.tsx`

### navigation
- `components/ScrollToTop.tsx`

### modals
- `components/NativeBackButtonListener.tsx`

## Policy

- Future visual work must prefer authority components.
- Mushaf / Prayer / Admin SPECIAL_CASE wrappers OK when they compose authority.
- No UNIFIED_100 claim from this report alone.
