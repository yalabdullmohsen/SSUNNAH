/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const LessonsPage = lazy(() => import("@/design-system/screens/LessonsScreen"));

export const CompetitionsPage = lazy(() => import("@/pages/competitions/CompetitionsPage"));

export const CompetitionDetailPage = lazy(() => import("@/pages/competitions/CompetitionDetailPage"));

export const TeachersIndexPage = lazy(() => import("@/pages/lessons/TeachersIndexPage"));

export const TeacherDetailPage = lazy(() => import("@/pages/lessons/TeacherDetailPage"));

export const LessonsArchivePage = lazy(() => import("@/pages/lessons/LessonsArchivePage"));

export const LessonDetailPage = lazy(() => import("@/design-system/screens/LessonDetailScreen"));

export const KuwaitLessonsPage = lazy(() => import("@/pages/lessons/KuwaitLessonsPage"));

export const AnnualCourseDetailPage = lazy(() => import("@/pages/lessons/AnnualCourseDetailPage"));

export const OccasionsLessonsHubPage = lazy(() => import("@/pages/lessons/OccasionsLessonsHubPage"));

export const MyLearningPage = lazy(() => import("@/pages/lessons/MyLearningPage"));

