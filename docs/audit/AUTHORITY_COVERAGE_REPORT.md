# AUTHORITY_COVERAGE_REPORT

Generated: 2026-10-06T03:24:05.619Z

## AUTHORITY_ADOPTION_PERCENTAGE: **48%**

| Family | Using authority | Bypassing | Relevant | Adoption % |
|---|---:|---:|---:|---:|
| cards | 20 | 199 | 219 | 9 |
| buttons | 346 | 1 | 347 | 100 |
| forms | 45 | 145 | 190 | 24 |
| tables | 10 | 13 | 23 | 43 |
| lists | 7 | 73 | 80 | 9 |
| tabs | 6 | 68 | 74 | 8 |
| navigation | 16 | 1 | 17 | 94 |
| modals | 28 | 1 | 29 | 97 |

## Top divergence sources

- **cards**: bypass=199 · adoption=9%
- **forms**: bypass=145 · adoption=24%
- **lists**: bypass=73 · adoption=9%
- **tabs**: bypass=68 · adoption=8%
- **tables**: bypass=13 · adoption=43%
- **navigation**: bypass=1 · adoption=94%

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
