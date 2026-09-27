import { useEffect } from "react";
import { useLocation } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { AdminV3Shell } from "./AdminV3Shell";
import { AdminV3ErrorBoundary } from "./AdminV3ErrorBoundary";
import { AdminV3Dashboard } from "./AdminV3Dashboard";
import { AdminV3CenterWorkspace } from "./centers/AdminV3CenterWorkspace";
import { resolveAdminV3Center } from "./nav";

/**
 * مدخل Admin v3 — يُحمَّل كسولًا عبر AdminLazyRoute فقط.
 * لا يُستورد من الهيكل العام (App.tsx).
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

  return (
    <AdminV3ErrorBoundary>
      <AdminV3Shell>{isOverview ? <AdminV3Dashboard /> : <AdminV3CenterWorkspace />}</AdminV3Shell>
    </AdminV3ErrorBoundary>
  );
}
