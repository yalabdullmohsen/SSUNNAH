# BUTTON DEBT PROGRESS

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Wave | Debt Reduction W1 |
| Status | **IMPROVED** |

## Measured

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Raw `<button` **files** | 265 | **230** | **−35** |
| Raw `<button` **elements** | 1027 | **992** | **−35** |
| Official `Button` import files | 95 | **127** | **+32** |
| IconButton consumer files | (prior) | **27** | — |

Ceilings lowered (`interaction-system-debt-budget` + `visual-system-debt-budget`). No raise.

## Wave ports (semantics preserved)

Primitives / chrome: `FavoriteButton` · `FilterChip` · `LanguageSwitcher` · `AchievementToast` (IconButton) · `ComingSoonDialog` · `FridayBanner` (IconButton) · `PushPrompt` · `ScholarFollowButton` · `OfflineBanner` · `MoreSheetThemeToggle` (IconButton) · `SiteFooter`.

Batch ports (Button authority): `ActiveFilters` · `UpdateAvailableBanner` · `DailyWirdCard` · `CompactSources` · `FeaturedSectionCard` · `SectionCard` · `SectionRow` · `UniversityCard` · `FilterBottomSheet` · `SettingsList` · `ProphetStoryReaderHeader` · `ReadingBreakDialog` · `QuizPage` · `CompetitionsHubView` · DiscoverIslam / IslamStats / MosqueMode / FadailAamal / Tahara / Miracles · `FilterBar` · `ExclusiveChoiceGroup` · `RulingFilters` · `LandmarksMap`.

Skipped / careful: `Pressable` (primitive) · Mushaf/Admin · multi-button dense editors.

## Next wave

Continue 20–40 file ports; prefer IconButton for dismiss/close; Link+asChild for navigation; lower ceilings after each measured drop.

## WAVE3 (2026-09-30)

- rawButtonFiles **211→192** · rawButtonElements **910→774** · officialButtonImportFiles **153→172**
- PR #2377 · prod MATCH `1075efb0` · **WAVE3_MERGED_AND_DEPLOYED**
