/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const SearchPage = lazy(() => import("@/design-system/screens/SearchScreen"));

export const ReadingPlansPage = lazy(() => import("@/pages/library/ReadingPlansPage"));

