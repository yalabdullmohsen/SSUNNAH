/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const SiteMapPage = lazy(() => import("@/pages/account/SiteMapPage"));

export const FawaidPage = lazy(() => import("@/pages/account/FawaidPage"));

export const QuizPage = lazy(() => import("@/pages/account/QuizPage"));

export const LoginPage = lazyWithRetry(() => import("@/pages/account/LoginPage"), "LoginPage");

export const RegisterPage = lazyWithRetry(() => import("@/pages/account/RegisterPage"), "RegisterPage");

export const SettingsPage = lazy(() => import("@/pages/account/SettingsPage"));

export const FeatureTourPage = lazy(() => import("@/pages/account/FeatureTourPage"));

export const AccountDeletionPage = lazy(() => import("@/pages/account/AccountDeletionPage"));

export const SectionsPage = lazy(() => import("@/pages/account/SectionsPage"));

export const IslamicGlossaryPage = lazy(() => import("@/pages/account/IslamicGlossaryPage"));

export const FlashCardsPage = lazy(() => import("@/pages/account/FlashCardsPage"));

export const NotificationSettingsPage = lazy(() => import("@/pages/account/NotificationSettingsPage"));

export const NotificationsAndSoundPage = lazy(() => import("@/pages/account/NotificationsAndSoundPage"));

export const ProgressCenterPage = lazy(() => import("@/pages/account/ProgressCenterPage"));

export const OfflineCenterPage = lazy(() => import("@/pages/account/OfflineCenterPage"));

