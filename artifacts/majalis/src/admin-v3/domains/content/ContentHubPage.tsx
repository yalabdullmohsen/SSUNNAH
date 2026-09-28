import { Link } from "wouter";
import { listCenterTools } from "../../centers/catalog";
import { AdminPageHeader, AdminLegacyChip } from "../../ui/primitives";

const NATIVE_IDS = new Set(["lessons", "sheikhs", "fawaid"]);

const NATIVE = [
  { href: "/admin/v3/content/lessons", title: "الدروس", desc: "CRUD أصلي عبر API" },
  { href: "/admin/v3/content/sheikhs", title: "المشايخ", desc: "CRUD أصلي عبر API" },
  { href: "/admin/v3/content/fawaid", title: "الفوائد", desc: "CRUD أصلي عبر API" },
] as const;

export function ContentHubPage() {
  const legacyTools = listCenterTools("content").filter((t) => !NATIVE_IDS.has(t.id));
  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="مركز المحتوى"
        description="المسارات الأصلية للدروس والمشايخ والفوائد — بقية الأدوات عبر التوافق."
        badge="أصلي + توافق"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المحتوى" },
        ]}
      />
      <div className="av3-tool-grid">
        {NATIVE.map((n) => (
          <article key={n.href} className="av3-tool-card av3-tool-card--native">
            <h3 className="av3-tool-card__title">{n.title}</h3>
            <p className="av3-tool-card__desc">{n.desc}</p>
            <Link href={n.href} className="av3-btn av3-btn--primary">
              فتح
            </Link>
          </article>
        ))}
      </div>
      <section className="av3-legacy-block" aria-label="أدوات توافق">
        <h3>
          أدوات أخرى <AdminLegacyChip />
        </h3>
        <div className="av3-tool-grid">
          {legacyTools.map((t) => (
            <article key={t.id} className="av3-tool-card">
              <h3 className="av3-tool-card__title">{t.title}</h3>
              <p className="av3-tool-card__desc">{t.description}</p>
              <Link href={t.href} className="av3-btn">
                فتح (Legacy)
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
