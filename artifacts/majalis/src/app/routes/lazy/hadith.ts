/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const HadithPage = lazy(() => import("@/pages/hadith/HadithPage"));

export const HadithByIdPage = lazy(() => import("@/pages/hadith/HadithByIdPage"));

export const HadithSahihPage = lazy(() => import("@/pages/hadith/HadithSahihPage"));

export const HadithDaifPage = lazy(() => import("@/pages/hadith/HadithDaifPage"));

export const HadithMawduPage = lazy(() => import("@/pages/hadith/HadithMawduPage"));

export const HadithBooksPage = lazy(() => import("@/pages/hadith/HadithBooksPage"));

export const HadithBooksAndRulingsPage = lazy(() => import("@/pages/hadith/HadithBooksAndRulingsPage"));

export const ArbaeenLovePage = lazy(() => import("@/views/ArbaeenLovePage"));

export const ArbaeenNawawiPage = lazy(() => import("@/pages/hadith/ArbaeenNawawiPage"));

export const ArbaeenHadithDetailPage = lazy(() => import("@/pages/hadith/ArbaeenHadithDetailPage"));

export const SunnahStudiesPage = lazy(() => import("@/pages/hadith/SunnahStudiesPage"));

export const HadithSciencePage = lazy(() => import("@/pages/hadith/HadithSciencePage"));

