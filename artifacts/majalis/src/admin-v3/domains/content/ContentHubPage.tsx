import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/design-system/AppCard";
import { listCenterTools } from "../../centers/catalog";
import { AdminPageHeader, AdminLegacyChip } from "../../ui/primitives";

const NATIVE_IDS = new Set([
  "lessons",
  "sheikhs",
  "fawaid",
  "library",
  "islamic-stories",
  "prophet-stories",
  "arbaeen",
]);

const NATIVE = [
  { href: "/admin/v3/content/lessons", title: "الدروس", desc: "CRUD أصلي عبر API" },
  { href: "/admin/v3/content/sheikhs", title: "المشايخ", desc: "CRUD أصلي عبر API" },
  { href: "/admin/v3/content/fawaid", title: "الفوائد", desc: "CRUD أصلي عبر API" },
  { href: "/admin/v3/content/library", title: "المكتبة", desc: "CRUD أصلي FINAL-4" },
  { href: "/admin/v3/content/islamic-stories", title: "القصص الإسلامية", desc: "CRUD أصلي FINAL-4" },
  { href: "/admin/v3/content/prophet-stories", title: "قصص الأنبياء", desc: "محتوى واعتماد FINAL-4" },
  { href: "/admin/v3/content/arbaeen", title: "الأربعون في محبة الله", desc: "CRUD أصلي FINAL-4" },
] as const;

export function ContentHubPage() {
  const legacyTools = listCenterTools("content").filter((t) => !NATIVE_IDS.has(t.id));
  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="مركز المحتوى"
        description="المسارات الأصلية للمحتوى (FINAL-3/4) — بقية الأدوات عبر التوافق مع تصنيف صريح."
        badge="أصلي + توافق"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المحتوى" },
        ]}
      />
      <div className="av3-tool-grid">
        {NATIVE.map((n) => (
          <AppCard key={n.href} className="av3-tool-card av3-tool-card--native" data-ss-surface="admin-tool">
            <h3 className="av3-tool-card__title">{n.title}</h3>
            <p className="av3-tool-card__desc">{n.desc}</p>
            <Button asChild variant="primary">
              <Link href={n.href}>فتح</Link>
            </Button>
          </AppCard>
        ))}
      </div>
      <section className="av3-legacy-block" aria-label="أدوات توافق">
        <h3>
          أدوات أخرى <AdminLegacyChip />
        </h3>
        <div className="av3-tool-grid">
          {legacyTools.map((t) => (
            <AppCard key={t.id} className="av3-tool-card" data-ss-surface="admin-tool">
              <h3 className="av3-tool-card__title">{t.title}</h3>
              <p className="av3-tool-card__desc">{t.description}</p>
              <Button asChild variant="secondary">
                <Link href={t.href}>فتح (Legacy)</Link>
              </Button>
            </AppCard>
          ))}
        </div>
      </section>
    </div>
  );
}
