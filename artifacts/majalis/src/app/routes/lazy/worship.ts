/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const AdhkarPage = lazy(() => import("@/pages/worship/AdhkarPage"));

export const PrayerTimesPage = lazy(() => import("@/pages/worship/PrayerTimesPage"));

export const PrayerRanksPage = lazy(() => import("@/pages/worship/PrayerRanksPage"));

export const QiblaPage = lazy(() => import("@/pages/worship/QiblaPage"));

export const TasbihPage = lazy(() => import("@/pages/worship/TasbihPage"));

export const DailyWirdPage = lazy(() => import("@/pages/worship/DailyWirdPage"));

export const DuasPage = lazy(() => import("@/pages/worship/DuasPage"));

export const AdhanSettingsPage = lazy(() => import("@/pages/worship/AdhanSettingsPage"));

export const AdhanHelpPage = lazy(() => import("@/pages/worship/AdhanHelpPage"));

