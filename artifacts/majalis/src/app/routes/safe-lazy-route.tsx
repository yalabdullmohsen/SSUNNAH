/**
 * غلاف مسار كسول موحّد — يُستخدم من AppRoutes بدل تكرار Suspense/ErrorBoundary.
 */
import { Suspense, type ComponentType } from "react";
import { useParams } from "wouter";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazyRouteFallback } from "@/components/LazyRouteFallback";

export function SafeLazyRoute({ component: Component }: { component: ComponentType<any> }) {
  const params = useParams();
  return (
    <ErrorBoundary>
      <Suspense fallback={<LazyRouteFallback />}>
        <Component params={params} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function AdminLazyRoute({ component: Component }: { component: ComponentType }) {
  return (
    <AdminRouteGuard>
      <ErrorBoundary>
        <Suspense fallback={<LazyRouteFallback />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    </AdminRouteGuard>
  );
}
