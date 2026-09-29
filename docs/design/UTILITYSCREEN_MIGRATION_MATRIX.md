# UTILITYSCREEN MIGRATION MATRIX

| Field | Value |
|---|---|
| Captured | 2026-09-29T14:16Z |
| Base tip | `68e42f8f` + this wave |
| Before (tsx consumers excl. definition) | **128** |
| After | **9** (KEEP only) |
| Delta | **−119** |
| Canonical replacements | `AppPage`/`SectionTemplatePage` unwrap · `DetailScreen` for mark shells |
| Forbidden | New UtilityScreen imports outside allowlist |
| Gate | `no-new-utility-screen-gate.test.ts` |

## KEEP (utility pattern — settings/tools)

| File | Reason |
|---|---|
| `pages/account/ui/NotificationSettingsView.tsx` | Settings / account / tools |
| `pages/account/ui/NotificationsAndSoundView.tsx` | Settings / account / tools |
| `pages/account/ui/SettingsView.tsx` | Settings / account / tools |
| `pages/account/ui/SiteMapView.tsx` | Settings / account / tools |
| `pages/worship/ui/AdhanSettingsView.tsx` | Settings / account / tools |
| `views/FamilyModePage.tsx` | Settings / account / tools |
| `views/UpdatePasswordPage.tsx` | Settings / account / tools |
| `views/UserStatsPage.tsx` | Settings / account / tools |
| `views/VaultPage.tsx` | Settings / account / tools |

## BLOCKED this wave

| Scope | Reason |
|---|---|
| Mushaf reader internals | `MUSHAF_CSS_BOUNDARY` |
| Admin v3 legacy shells | Admin authority separate |
| Prayer calculation internals | Worship timing — shell only migrated where UtilityScreen was mark wrapper |

## MIGRATE_NOW executed

| Action | Count |
|---|---:|
| UNWRAP (remove redundant UtilityScreen over AppPage/SectionTemplate/LazyAccordion) | 23 |
| REPLACE → `DetailScreen` (compose=mark content shells) | 96 |

## Full migrated list

| File | Action |
|---|---|
| `components/FiqhGuidePage.tsx` | DETAIL |
| `components/discover-islam/DiscoverIslamShell.tsx` | DETAIL |
| `pages/fiqh/ui/HajjView.tsx` | DETAIL |
| `pages/fiqh/ui/JanazaView.tsx` | DETAIL |
| `pages/fiqh/ui/MawarithCalculatorView.tsx` | DETAIL |
| `pages/fiqh/ui/MawarithView.tsx` | DETAIL |
| `pages/fiqh/ui/SalahGuideView.tsx` | DETAIL |
| `pages/fiqh/ui/ZakatView.tsx` | DETAIL |
| `pages/hadith/ui/HadithScienceView.tsx` | DETAIL |
| `pages/hifz-path/HifzPathCategoryPage.tsx` | DETAIL |
| `pages/hifz-path/HifzPathDetailPage.tsx` | DETAIL |
| `pages/hifz-path/HifzPathMyPage.tsx` | DETAIL |
| `pages/hifz-path/HifzPathPage.tsx` | DETAIL |
| `pages/hifz-path/HifzPathUnitPage.tsx` | DETAIL |
| `pages/quran/ui/QuranHifzLoopView.tsx` | DETAIL |
| `pages/quran/ui/QuranMemorizationView.tsx` | DETAIL |
| `pages/quran/ui/QuranNumbersView.tsx` | DETAIL |
| `pages/quran/ui/QuranTilawaView.tsx` | DETAIL |
| `pages/worship/ui/AdhanHelpView.tsx` | DETAIL |
| `pages/worship/ui/AdhkarView.tsx` | UNWRAP |
| `pages/worship/ui/DailyWirdView.tsx` | DETAIL |
| `pages/worship/ui/DuasView.tsx` | DETAIL |
| `pages/worship/ui/PrayerRanksView.tsx` | DETAIL |
| `pages/worship/ui/QiblaView.tsx` | DETAIL |
| `pages/worship/ui/TasbihView.tsx` | DETAIL |
| `views/AboutPage.tsx` | DETAIL |
| `views/AcademicResearchPage.tsx` | UNWRAP |
| `views/AdabTalabIlmPage.tsx` | DETAIL |
| `views/AkhlaqPage.tsx` | UNWRAP |
| `views/AlamatSaahPage.tsx` | DETAIL |
| `views/AmrBilMarufPage.tsx` | UNWRAP |
| `views/AmradQalbiyyaPage.tsx` | DETAIL |
| `views/ArabicLanguagePage.tsx` | UNWRAP |
| `views/ArbaeenLovePage.tsx` | DETAIL |
| `views/ArkanImanPage.tsx` | DETAIL |
| `views/ArkanIslamPage.tsx` | DETAIL |
| `views/AssistantPage.tsx` | DETAIL |
| `views/AutoContentDetailPage.tsx` | DETAIL |
| `views/CalendarPage.tsx` | DETAIL |
| `views/CarModePage.tsx` | DETAIL |
| `views/CardsPage.tsx` | DETAIL |
| `views/CitationPublicPage.tsx` | DETAIL |
| `views/ContactPage.tsx` | DETAIL |
| `views/DalailNubuwwahPage.tsx` | DETAIL |
| `views/DiscoverIslamArticleDetailPage.tsx` | DETAIL |
| `views/DiscoverIslamContactPage.tsx` | DETAIL |
| `views/DiscoverIslamDoubtDetailPage.tsx` | DETAIL |
| `views/DiscoverIslamDoubtsPage.tsx` | DETAIL |
| `views/DiscoverIslamPage.tsx` | UNWRAP |
| `views/DiscoverIslamQuestionDetailPage.tsx` | DETAIL |
| `views/DiscoverIslamQuestionsPage.tsx` | DETAIL |
| `views/DurusImaniyyaPage.tsx` | UNWRAP |
| `views/DurusMutanawwiaPage.tsx` | UNWRAP |
| `views/FikrWaqiaPage.tsx` | UNWRAP |
| `views/HikamSalafPage.tsx` | DETAIL |
| `views/HowToBecomeMuslimPage.tsx` | DETAIL |
| `views/InstitutionsPage.tsx` | UNWRAP |
| `views/IslamStatsPage.tsx` | DETAIL |
| `views/IslamicDirectoryHubPage.tsx` | DETAIL |
| `views/IslamicLandmarkDetailPage.tsx` | DETAIL |
| `views/IslamicLandmarksPage.tsx` | UNWRAP |
| `views/IslamicSectsDetailPage.tsx` | DETAIL |
| `views/IslamicSectsPage.tsx` | UNWRAP |
| `views/IslamicStoriesPage.tsx` | UNWRAP |
| `views/JannaNaarPage.tsx` | UNWRAP |
| `views/KnowledgeGraphPage.tsx` | DETAIL |
| `views/KnowledgeSectionPage.tsx` | DETAIL |
| `views/MadhahibDetailPage.tsx` | DETAIL |
| `views/MadhahibPage.tsx` | DETAIL |
| `views/MalaikaPage.tsx` | UNWRAP |
| `views/MaqasidShariaPage.tsx` | DETAIL |
| `views/MawsuaatPage.tsx` | DETAIL |
| `views/MemorizationHubPage.tsx` | DETAIL |
| `views/MergedSectionHubPage.tsx` | UNWRAP |
| `views/MethodologyPage.tsx` | DETAIL |
| `views/MindMapPage.tsx` | DETAIL |
| `views/MosqueModePage.tsx` | DETAIL |
| `views/MutashabihatPage.tsx` | DETAIL |
| `views/MySubmissionsPage.tsx` | DETAIL |
| `views/NationDetailPage.tsx` | DETAIL |
| `views/NationsPage.tsx` | UNWRAP |
| `views/NewMuslimDayDetailPage.tsx` | DETAIL |
| `views/NewMuslimPathPage.tsx` | DETAIL |
| `views/OccasionsPage.tsx` | DETAIL |
| `views/PrivacyCenterPage.tsx` | DETAIL |
| `views/PrivacyPage.tsx` | DETAIL |
| `views/ProphetStoriesPage.tsx` | UNWRAP |
| `views/PropheticMedicinePage.tsx` | DETAIL |
| `views/ProphetsFamilyTreePage.tsx` | DETAIL |
| `views/QaPage.tsx` | DETAIL |
| `views/ResearchAssistantPage.tsx` | DETAIL |
| `views/ResearchDetailPage.tsx` | DETAIL |
| `views/ResearchSubmitPage.tsx` | DETAIL |
| `views/ResearcherProfilePage.tsx` | DETAIL |
| `views/SawmPage.tsx` | DETAIL |
| `views/ScientificAnnouncementDetailPage.tsx` | DETAIL |
| `views/SinsAndRightsDetailPage.tsx` | DETAIL |
| `views/SinsAndRightsPage.tsx` | DETAIL |
| `views/SourcesLicensesPage.tsx` | DETAIL |
| `views/StartHerePage.tsx` | DETAIL |
| `views/StudyRoomPage.tsx` | DETAIL |
| `views/SujoodSahwPage.tsx` | DETAIL |
| `views/SupportPage.tsx` | DETAIL |
| `views/TaharaPage.tsx` | DETAIL |
| `views/TarikhIslamiDetailPage.tsx` | DETAIL |
| `views/TawbaPage.tsx` | DETAIL |
| `views/TawhidPage.tsx` | UNWRAP |
| `views/TawhidTopicPage.tsx` | UNWRAP |
| `views/TazkiyaTopicsPage.tsx` | UNWRAP |
| `views/TermsPage.tsx` | DETAIL |
| `views/TopicPage.tsx` | UNWRAP |
| `views/TopicsIndexPage.tsx` | DETAIL |
| `views/TranscribePage.tsx` | DETAIL |
| `views/UniversitiesComparePage.tsx` | DETAIL |
| `views/UniversitiesPage.tsx` | UNWRAP |
| `views/UniversityDetailPage.tsx` | DETAIL |
| `views/UsraMujtamaPage.tsx` | DETAIL |
| `views/WasayaNabawiyyaPage.tsx` | DETAIL |
| `views/not-found.tsx` | DETAIL |

## Explicit non-claim

`APP_PAGE_CONTRACT_COMPLETE` remains false until content pages adopt AppPage/PageHeader beyond DetailScreen mark shells where needed.
