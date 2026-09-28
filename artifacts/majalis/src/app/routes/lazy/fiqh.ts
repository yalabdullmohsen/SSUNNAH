/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const FatwaPolicyPage = lazy(() => import("@/pages/fiqh/FatwaPolicyPage"));

export const MaqasidShariaPage = lazy(() => import("@/views/MaqasidShariaPage"));

export const FiqhPage = lazy(() => import("@/pages/fiqh/FiqhPage"));

export const FiqhBookPage = lazy(() => import("@/pages/fiqh/FiqhBookPage"));

export const FiqhChapterPage = lazy(() => import("@/pages/fiqh/FiqhChapterPage"));

export const FiqhLessonPage = lazy(() => import("@/pages/fiqh/FiqhLessonPage"));

export const FiqhUsulPage = lazy(() => import("@/pages/fiqh/FiqhUsulPage"));

export const FiqhTopicPage = lazy(() => import("@/pages/fiqh/FiqhTopicPage"));

export const MadhahibPage = lazy(() => import("@/views/MadhahibPage"));

export const MadhahibDetailPage = lazy(() => import("@/views/MadhahibDetailPage"));

export const FiqhQawaidPage = lazy(() => import("@/pages/fiqh/FiqhQawaidPage"));

export const ZakatPage = lazy(() => import("@/pages/fiqh/ZakatPage"));

export const HajjPage = lazy(() => import("@/pages/fiqh/HajjPage"));

export const JanazaPage = lazy(() => import("@/pages/fiqh/JanazaPage"));

export const MawarithPage = lazy(() => import("@/pages/fiqh/MawarithPage"));

export const MawarithCalculatorPage = lazy(() => import("@/pages/fiqh/MawarithCalculatorPage"));

export const SalahGuidePage = lazy(() => import("@/pages/fiqh/SalahGuidePage"));

export const NikahPage = lazy(() => import("@/pages/fiqh/NikahPage"));

export const TalaqPage = lazy(() => import("@/pages/fiqh/TalaqPage"));

