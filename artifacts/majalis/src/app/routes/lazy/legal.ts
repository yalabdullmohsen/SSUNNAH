/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const AboutPage = lazy(() => import("@/views/AboutPage"));

export const SourcesLicensesPage = lazy(() => import("@/views/SourcesLicensesPage"));

export const SourcesDirectoryPage = lazy(() => import("@/pages/sources/SourcesDirectoryPage"));

export const SourceDetailPage = lazy(() => import("@/pages/sources/SourceDetailPage"));

export const PrivacyPage = lazy(() => import("@/views/PrivacyPage"));

export const PrivacyCenterPage = lazy(() => import("@/views/PrivacyCenterPage"));

export const TermsPage = lazy(() => import("@/views/TermsPage"));

export const ContactPage = lazy(() => import("@/views/ContactPage"));

export const MethodologyPage = lazy(() => import("@/views/MethodologyPage"));

