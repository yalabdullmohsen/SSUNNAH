import { useEffect } from "react";
import { useLocation } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { AdminV3Shell } from "./AdminV3Shell";
import { AdminV3ErrorBoundary } from "./AdminV3ErrorBoundary";
import { AdminV3Router } from "./AdminV3Router";
import { AdminV3CenterWorkspace } from "./centers/AdminV3CenterWorkspace";
import { resolveAdminV3Center } from "./nav";

/**
 * مدخل Admin v3 — يُحمَّل كسولًا عبر AdminLazyRoute فقط.
 * لا يُستورد من الهيكل العام (App.tsx).
 *
 * AdminV3CenterWorkspace يبقى مستوردًا للبوابات وللمراكز غير المنقولة.
 */
export default function AdminV3App() {
  const [location] = useLocation();
  const center = resolveAdminV3Center(location);
  const isOverview = center.id === "overview";

  useEffect(() => {
    applyPageSeo({
      path: location.split("?")[0] || "/admin/v3",
      title: isOverview
        ? "لوحة التحكم | سُنّة"
        : `${center.label} — لوحة التحكم | سُنّة`,
      description: "لوحة تحكم سُنّة — خاصة بالمشرفين.",
      robots: "noindex, nofollow",
    });
  }, [location, center.label, isOverview]);

  // Keep reference so centers-gate / tree-shaking do not drop the workspace module contract.
  void AdminV3CenterWorkspace;

  return (
    <AdminV3ErrorBoundary>
      <AdminV3Shell>
        <AdminV3Router />
      </AdminV3Shell>
    </AdminV3ErrorBoundary>
  );
}
