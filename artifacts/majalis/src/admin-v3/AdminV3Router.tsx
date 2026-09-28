import { useLocation } from "wouter";
import { AdminV3Dashboard } from "./AdminV3Dashboard";
import { AdminV3CenterWorkspace } from "./centers/AdminV3CenterWorkspace";
import { ReviewInboxPage } from "./domains/reviews/ReviewInboxPage";
import { ContentHubPage } from "./domains/content/ContentHubPage";
import { EntityCrudPage } from "./domains/content/EntityCrudPage";
import { TaxonomyPage } from "./domains/taxonomy/TaxonomyPage";
import { UsersPage } from "./domains/community/UsersPage";
import { AnalyticsPage, AuditPage, SettingsOpsPage } from "./domains/ops/OpsPages";
import { resolveAdminV3Center } from "./nav";

/**
 * Domain router for Admin v3 — path-based, no query as primary state.
 */
export function AdminV3Router() {
  const [location] = useLocation();
  const path = (location.split("?")[0] || "/admin/v3").replace(/\/+$/, "") || "/admin/v3";

  if (path === "/admin/v3") return <AdminV3Dashboard />;

  if (path === "/admin/v3/reviews") return <ReviewInboxPage />;

  if (path === "/admin/v3/content/lessons") return <EntityCrudPage kind="lessons" />;
  if (path === "/admin/v3/content/sheikhs") return <EntityCrudPage kind="sheikhs" />;
  if (path === "/admin/v3/content/fawaid") return <EntityCrudPage kind="fawaid" />;
  if (path === "/admin/v3/content") return <ContentHubPage />;

  if (path === "/admin/v3/taxonomy") return <TaxonomyPage />;
  if (path === "/admin/v3/community") return <UsersPage />;
  if (path === "/admin/v3/analytics") return <AnalyticsPage />;
  if (path === "/admin/v3/settings") return <SettingsOpsPage />;
  if (path === "/admin/v3/audit") return <AuditPage />;

  // Fallback: catalog workspace for unknown/aliased centers
  const center = resolveAdminV3Center(path);
  if (center.id === "overview") return <AdminV3Dashboard />;
  return <AdminV3CenterWorkspace />;
}
