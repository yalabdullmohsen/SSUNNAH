/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const QuranEnginePage = lazy(() => import("@/pages/quran/QuranEnginePage"));

export const QuranCirclesPage = lazy(() => import("@/pages/quran/QuranCirclesPage"));

export const SurahIndexPage = lazy(() => import("@/pages/quran/SurahIndexPage"));

export const QuranSearchPage = lazy(() => import("@/pages/quran/QuranSearchPage"));

export const RevelationOrderPage = lazy(() => import("@/pages/quran/RevelationOrderPage"));

export const MakkiMadaniPage = lazy(() => import("@/pages/quran/MakkiMadaniPage"));

export const MushafReaderPage = lazy(() => import("@/pages/quran/MushafReaderPage"));

export const MushafBookmarksPage = lazy(() => import("@/pages/quran/MushafBookmarksPage"));

export const QuranHubPage = lazy(() => import("@/pages/quran/QuranHubPage"));

export const QuranNumbersPage = lazy(() => import("@/pages/quran/QuranNumbersPage"));

export const QuranPeoplePage = lazy(() => import("@/pages/quran/QuranPeoplePage"));

export const QuranPersonDetailPage = lazy(() => import("@/pages/quran/QuranPersonDetailPage"));

export const SurahStoriesPage = lazy(() => import("@/pages/quran/SurahStoriesPage"));

export const QuranTajweedPage = lazy(() => import("@/pages/quran/QuranTajweedPage"));

export const TajweedChapterPage = lazy(() => import("@/pages/quran/TajweedChapterPage"));

export const QuranQiraatPage = lazy(() => import("@/pages/quran/QuranQiraatPage"));

export const QuranSevenAhrufPage = lazy(() => import("@/pages/quran/QuranSevenAhrufPage"));

export const QuranTilawaPage = lazy(() => import("@/pages/quran/QuranTilawaPage"));

export const QuranUlumTermsPage = lazy(() => import("@/pages/quran/QuranUlumTermsPage"));

export const SurahStoryDetailRoute = lazy(() =>
  import("@/pages/quran/SurahStoriesPage").then(m => ({
    default: ({ params }: { params?: Record<string, string> }) => {
      const n = parseInt(params?.number ?? "1", 10);
      return <m.SurahStoryDetailPage surahNumber={Number.isNaN(n) ? 1 : n} />;
    },
  }))
);

export const QuranMemorizationPage = lazy(() => import("@/pages/quran/QuranMemorizationPage"));

export const QuranMemorizationPlansPage = lazy(() => import("@/pages/quran/QuranMemorizationPlansPage"));

export const QuranHifzLoopPage = lazy(() => import("@/pages/quran/QuranHifzLoopPage"));

export const QuranWorshipHubPage = lazy(() => import("@/pages/quran/QuranWorshipHubPage"));

export const QuranOfflinePlayerPage = lazy(() => import("@/pages/quran/QuranOfflinePlayerPage"));

export const UlumQuranPage = lazy(() => import("@/pages/quran/UlumQuranPage"));

export const QuranKnowledgeHubPage = lazy(() => import("@/pages/quran/QuranKnowledgeHubPage"));

export const MemorizationHubPage = lazy(() => import("@/views/MemorizationHubPage"));

export const HifzPathPage = lazy(() => import("@/pages/hifz-path/HifzPathPage"));

export const HifzPathMyPage = lazy(() => import("@/pages/hifz-path/HifzPathMyPage"));

export const HifzPathCategoryPage = lazy(
  () => import("@/pages/hifz-path/HifzPathCategoryPage"),
);

export const HifzPathDetailPage = lazy(
  () => import("@/pages/hifz-path/HifzPathDetailPage"),
);

export const HifzPathUnitPage = lazy(() => import("@/pages/hifz-path/HifzPathUnitPage"));

export const TafsirPage = lazy(() => import("@/pages/quran/TafsirPage"));

export const DuasQuranPage = lazy(() => import("@/pages/quran/DuasQuranPage"));

