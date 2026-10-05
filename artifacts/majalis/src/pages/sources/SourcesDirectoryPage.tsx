import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { SectionLobby } from "@/components/lobby/SectionLobby";
import { feedForAccount, loadHarvestAccounts, loadHarvestFeed } from "@/lib/harvest-feed";
import { applyPageSeo } from "@/lib/seo";
import "@/styles/pages/sources-directory.css";

export default function SourcesDirectoryPage() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof loadHarvestAccounts>>>([]);
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof loadHarvestFeed>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyPageSeo({
      path: "/sources",
      title: "دليل الجهات | سُنّة",
      description: "دليل الحسابات والجهات الدعوية والتعليمية في الكويت — روابط مباشرة للمصدر دون إعادة استضافة المحتوى.",
      keywords: ["دليل جهات", "دروس الكويت", "حلقات قرآن", "مصادر"],
    });
    let cancelled = false;
    setLoading(true);
    Promise.all([loadHarvestAccounts(), loadHarvestFeed()])
      .then(([a, f]) => {
        if (cancelled) return;
        setAccounts(a);
        setFeed(f);
      })
      .catch(() => {
        /* keep-previous: لا تفرّغ الدليل عند فشل إعادة الجلب */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = useMemo(() => accounts.filter((a) => a.enabled), [accounts]);

  return (
    <SectionLobby
      lobbyId="hub"
      title="دليل الجهات"
      groups={[]}
      className="sources-directory-page"
    >
      <p className="sources-policy-note">
        المحتوى مملوك لأصحابه. سُنّة يعرض روابط المصدر فقط — عنوان، شيخ، وقت، مكان،
        ورابط المنشور — دون إعادة استضافة نص طويل أو صور كاملة.
        {" "}
        <Link href="/data-licenses">المصادر والتراخيص</Link>
        {" · "}
        <a href="https://github.com/yalabdullmohsen/SSUNNAH/blob/main/artifacts/majalis/docs/SOURCES_POLICY.md" target="_blank" rel="noopener noreferrer">
          سياسة المصادر
        </a>
      </p>
      <p className="sources-policy-note">
        بيانات التلاوة وتوقيت الآيات لبعض القرّاء مقدَّمة من{" "}
        <a href="https://quran.foundation" target="_blank" rel="noopener noreferrer">Quran Foundation</a>
        {" "}عبر واجهتها البرمجية. والنص القرآني المستخدم في البحث والمطابقة من{" "}
        <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a>
        {" "}(CC BY 3.0).
      </p>
      <div className="sources-directory-grid" aria-busy={loading}>
        {enabled.map((acc) => {
          const count = feedForAccount(feed, acc.id).length;
          return (
            <Link key={acc.id} href={`/sources/${acc.id}`} className="sources-directory-card">
              <span className="sources-directory-card__kind">{acc.kind}</span>
              <h2 className="sources-directory-card__title">{acc.name_ar}</h2>
              <p className="sources-directory-card__meta">
                {acc.platform} · {acc.region_ar}
                {count > 0 ? ` · ${count} منشور` : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </SectionLobby>
  );
}
