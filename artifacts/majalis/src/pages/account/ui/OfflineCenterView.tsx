import { useEffect, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import {
  estimateOfflineFootprintHint,
  listOfflinePackStatus,
  type OfflinePackStatus,
} from "@/lib/knowledge-platform";
import "@/styles/pages/knowledge-platform-p0.css";
import "@/styles/pages/learn-legal-v2.css";
import { PageHeaderV2, EmptyStateV2, OfflineStateV2 } from "@/components/design-system";

export default function OfflineCenterView() {
  const [packs, setPacks] = useState<OfflinePackStatus[]>([]);
  const [hint, setHint] = useState("…");
  const [online, setOnline] = useState(true);
  const [engineOk, setEngineOk] = useState(true);

  useEffect(() => {
    applyPageSeo({
      path: "/offline",
      title: "مركز دون اتصال | سُنّة",
      description: "عرض الحزم المحلية المتاحة للعمل دون شبكة، دون تنزيل تلقائي.",
    });
    void (async () => {
      const status = await listOfflinePackStatus();
      setPacks(status.packs);
      setOnline(status.online);
      setEngineOk(status.engineAvailable);
      setHint(await estimateOfflineFootprintHint());
    })();
  }, []);

  return (
    <main className="kp-page" dir="rtl">
      <PageHeaderV2
        title="مركز دون اتصال"
        description="جرد للحزم المحلية. لا تنزيل تلقائي من هذه الصفحة — استخدم إعدادات المصحف أو المخزن للتنزيل."
      />
      {!online ? (
        <OfflineStateV2
          title="أنت غير متصل الآن"
          description="يعرض هذا المركز الحزم المحلية فقط — بلا تنزيل جديد ودون ادّعاء حداثة البيانات."
          availableHint="استخدم المصحف أو المخزن عند عودة الشبكة لتنزيل المحتوى."
          offlineCenterHref="/mushaf"
          offlineCenterLabel="فتح المصحف"
        />
      ) : null}
      <p className="kp-meta" aria-live="polite">
        الشبكة: {online ? "متصلة" : "غير متصلة"} · المحرك: {engineOk ? "متاح" : "غير متاح"}
      </p>
      <p className="kp-note">{hint}</p>

      <section className="kp-section" aria-labelledby="kp-packs">
        <h2 id="kp-packs" className="kp-section__title">المخازن المحلية</h2>
        {packs.length === 0 ? (
          <EmptyStateV2
            title="لا حزم محلية"
            description="لم تُعثر على مخازن محلية بعد. يمكنك تنزيل المحتوى من المصحف أو المخزن."
            ctaLabel="فتح المصحف"
            href="/mushaf"
          />
        ) : (
          <ul className="kp-list kp-list--packs" aria-label="الحزم المحلية">
            {packs.map((p) => (
              <li key={p.store}>
                <strong>{p.label}</strong>
                <span className="kp-meta" aria-label={p.available ? `${p.recordCount} سجل` : "فارغ"}>
                  {p.available ? `${p.recordCount} سجل` : "فارغ"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="kp-section">
        <h2 className="kp-section__title">اختصارات</h2>
        <ul className="kp-list">
          <li>
            <Link href="/mushaf">المصحف</Link>
          </li>
          <li>
            <Link href="/quran/offline-player">مشغّل القرآن دون اتصال</Link>
          </li>
          <li>
            <Link href="/vault">المخزن</Link>
          </li>
          <li>
            <Link href="/settings">الإعدادات</Link>
          </li>
          <li>
            <Link href="/progress">مركز التقدّم</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
