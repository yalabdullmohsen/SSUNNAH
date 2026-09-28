/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const AutoContentDetailPage = lazy(() => import("@/views/AutoContentDetailPage"));

export const AdminPage = lazyWithRetry(() => import("@/views/AdminPage"), "AdminPage");

export const AdminV3App = lazyWithRetry(() => import("@/admin-v3/AdminV3App"), "AdminV3App");

export const AdminEntryBridge = lazyWithRetry(
  () => import("@/admin-v3/AdminEntryBridge"),
  "AdminEntryBridge",
);

export const LessonImportImagePage = lazyWithRetry(() => import("@/views/admin/LessonImportImagePage"), "LessonImportImagePage");

export const LessonImportUrlPage = lazyWithRetry(() => import("@/views/admin/LessonImportUrlPage"), "LessonImportUrlPage");

export const AutomationSourcesPage = lazyWithRetry(() => import("@/views/admin/AutomationSourcesPage"), "AutomationSourcesPage");

export const AutomationReviewPage = lazyWithRetry(() => import("@/views/admin/AutomationReviewPage"), "AutomationReviewPage");

export const ReviewHubPage = lazyWithRetry(() => import("@/views/admin/ReviewHubPage"), "ReviewHubPage");

export const AutomationDashboardPage = lazyWithRetry(() => import("@/views/admin/AutomationDashboardPage"), "AutomationDashboardPage");

export const AutomationCenterPage = lazyWithRetry(() => import("@/views/admin/AutomationCenterPage"), "AutomationCenterPage");

export const AutonomousPlatformPage = lazyWithRetry(() => import("@/views/admin/AutonomousPlatformPage"), "AutonomousPlatformPage");

export const InstagramIntegrationPage = lazyWithRetry(() => import("@/views/admin/InstagramIntegrationPage"), "InstagramIntegrationPage");

export const MajlisKnowledgeEnginePage = lazyWithRetry(() => import("@/views/admin/MajlisKnowledgeEnginePage"), "MajlisKnowledgeEnginePage");

export const AdminDashboardPage = lazyWithRetry(() => import("@/views/admin/AdminDashboardPage"), "AdminDashboardPage");

export const AutoContentPage = lazyWithRetry(() => import("@/views/admin/AutoContentPage"), "AutoContentPage");

export const ContentProductionDashboardPage = lazyWithRetry(
  () => import("@/views/admin/ContentProductionDashboardPage"),
  "ContentProductionDashboardPage",
);

export const FeatureStatusPage = lazyWithRetry(() => import("@/views/admin/FeatureStatusPage"), "FeatureStatusPage");

export const InternalStatusPage = lazyWithRetry(() => import("@/views/internal/InternalStatusPage"), "InternalStatusPage");

export const UniversitiesAdminPage = lazyWithRetry(() => import("@/views/admin/UniversitiesAdminPage"), "UniversitiesAdminPage");

