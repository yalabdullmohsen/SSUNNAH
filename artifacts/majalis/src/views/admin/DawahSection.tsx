import { AdminTabs } from "@/components/admin/AdminLayout";
import { useCallback, useEffect, useState } from "react";
import { useAdminShell } from "@/views/admin/AdminShell";
import { SkeletonCardGrid } from "@/components/ui-common";
import { Button } from "@/components/ui/button";
import {
  adminListDawahQueue,
  adminUpdateDawahStatus,
  adminListContactRequests,
  adminUpdateContactStatus,
} from "@/lib/dawah-service";

type QueueTable = "dawah_questions" | "dawah_shubuhat" | "dawah_articles" | "new_muslim_path";
const TABS: { id: QueueTable | "contacts"; label: string }[] = [
  { id: "dawah_questions", label: "الأسئلة" },
  { id: "dawah_shubuhat", label: "الشبهات" },
  { id: "dawah_articles", label: "المقالات" },
  { id: "new_muslim_path", label: "مسار المسلم الجديد" },
  { id: "contacts", label: "طلبات التواصل" },
];

const STAGE_ORDER = ["draft", "editorial_review", "scientific_review", "translation_review", "approved", "published"];
function nextStage(current: string): string {
  const idx = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
}

export function DawahSection() {
  const { showSuccess, showError } = useAdminShell();
  const [tab, setTab] = useState<QueueTable | "contacts">("dawah_questions");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const task = tab === "contacts" ? adminListContactRequests("new") : adminListDawahQueue(tab);
    task.then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const advance = async (id: string, currentStatus: string) => {
    setBusy(true);
    try {
      const target = nextStage(currentStatus);
      const r = await adminUpdateDawahStatus(tab as QueueTable, id, target, target === "approved" || target === "published");
      if (!r.ok) { showError("تعذّر التحديث"); return; }
      showSuccess(target === "published" ? "نُشرت المادة" : "تم نقلها للمرحلة التالية");
      load();
    } finally { setBusy(false); }
  };

  const reject = async (id: string) => {
    setBusy(true);
    try {
      const r = await adminUpdateDawahStatus(tab as QueueTable, id, "draft", false);
      if (!r.ok) { showError("تعذّر الرفض"); return; }
      showSuccess("أُعيدت المادة إلى المسودات");
      load();
    } finally { setBusy(false); }
  };

  const resolveContact = async (id: string) => {
    setBusy(true);
    try {
      await adminUpdateContactStatus(id, "responded");
      showSuccess("تم تحديث حالة الطلب");
      load();
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="arp-header">
        <div>
          <h2 className="arp-title">التعريف بالإسلام — لوحة المحتوى</h2>
          <p className="arp-subtitle">مراجعة الأسئلة والشبهات والمقالات ومسار المسلم الجديد، وطلبات التواصل مع الدعاة.</p>
        </div>
      </div>

      <AdminTabs
        items={TABS}
        value={tab}
        onChange={(id) => setTab(id as QueueTable | "contacts")}
        ariaLabel="طوابير التعريف بالإسلام"
        idPrefix="dawah"
      />

      {loading ? <SkeletonCardGrid count={4} /> : (
        <div className="arp-list">
          {items.length === 0 && <p className="arp-empty">لا عناصر بانتظار المراجعة.</p>}
          {tab !== "contacts" && items.map((item) => (
            <article key={item.id} className="arp-card">
              <div className="arp-card-grid">
                <div>
                  <div className="arp-card-meta-row">
                    <div>
                      <strong>{item.title || item.title_ar}</strong>
                      <span className="arp-decision-badge" style={{ "--arp-db-bg": "rgba(23,61,53,0.08)", "--arp-db-color": "var(--mj-brand-deep)" } as React.CSSProperties}>
                        {item.status}
                      </span>
                      <p className="arp-card-subtext">{(item.short_answer || item.summary_ar || "").slice(0, 160)}</p>
                    </div>
                    <div className="arp-card-actions">
                      <Button type="button" variant="primary" disabled={busy} onClick={() => advance(item.id, item.status)} className="arp-approve-btn">
                        {item.status === "approved" ? "نشر" : "الموافقة والانتقال للمرحلة التالية"}
                      </Button>
                      <Button type="button" variant="ghost" disabled={busy} onClick={() => reject(item.id)} className="arp-small-btn">إعادة لمسودة</Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {tab === "contacts" && items.map((c: any) => (
            <article key={c.id} className="arp-card">
              <div className="arp-card-grid">
                <div>
                  <div className="arp-card-meta-row">
                    <div>
                      <strong>{c.is_anonymous ? "طلب مجهول" : c.name || "بدون اسم"}</strong>
                      <span className="arp-decision-badge" style={{ "--arp-db-bg": "rgba(23,61,53,0.08)", "--arp-db-color": "var(--mj-brand-deep)" } as React.CSSProperties}>
                        {c.lang} · {c.preferred_daee_gender}
                      </span>
                      <p className="arp-card-subtext">{c.topic}</p>
                      <p className="arp-card-subtext">وسيلة التواصل: {c.contact_method} — {c.contact_value}</p>
                    </div>
                    <div className="arp-card-actions">
                      <Button type="button" variant="primary" disabled={busy} onClick={() => resolveContact(c.id)} className="arp-approve-btn">وُضع الرد</Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DawahSection;
