import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { PageHeader, Empty } from "@/components/ui-common";
import { ShareButtons } from "@/components/ContentActions";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY } from "@/lib/ui-copy";
import { getShubhaBySlug, type DawahShubha } from "@/lib/dawah-service";
import { shubuhatCompletenessTier } from "@/lib/shubuhat-contract";
import { DiscoverIslamShell } from "@/components/discover-islam/DiscoverIslamShell";
import { DetailScreen } from "@/components/design-system/screens";
import { safeHttpHref } from "@/lib/sanitize";

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

export default function DiscoverIslamDoubtDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<DawahShubha | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    setItem(undefined);
    getShubhaBySlug(slug).then((s) => {
      setItem(s);
      if (s) {
        applyPageSeo({
          path: `/discover-islam/doubts/${slug}`,
          title: `${s.title} | ردود على الشبهات`,
          description: s.short_answer,
        });
      }
    });
  }, [slug]);

  if (item === undefined) {
    return (
      <DiscoverIslamShell detail>
        <PageHeader eyebrow="التعريف بالإسلام" title="الشبهة" />
      </DiscoverIslamShell>
    );
  }
  if (item === null) {
    return (
      <DiscoverIslamShell detail>
        <Empty text={EMPTY.data} />
      </DiscoverIslamShell>
    );
  }

  return (
    <DetailScreen compose="mark">
    <DiscoverIslamShell detail>
      <PageHeader eyebrow="تفنيد الشبهات" title={item.title} />

      <p className="page-desc dii-shubha-meta" style={{ marginBottom: "0.75rem" }}>
        <span>اللغة: العربية</span>
        {" · "}
        <span>آخر تحديث: {formatUpdatedAt(item.updated_at)}</span>
        {item.complexity_level ? (
          <>
            {" · "}
            <span>المستوى: {item.complexity_level === "basic" ? "مبتدئ" : item.complexity_level === "advanced" ? "متقدم" : "متوسط"}</span>
          </>
        ) : null}
      </p>

      <div className="dii-block dii-block--muted dii-shubha-text-card">
        <span className="page-tag">نص الشبهة</span>
        <p className="dii-detailed-answer">{item.shubha_text}</p>
      </div>

      {item.why_spread && (
        <div className="dii-block dii-block--muted">
          <span className="page-tag">سبب انتشارها</span>
          <p className="page-desc">{item.why_spread}</p>
        </div>
      )}

      <div className="dii-block dii-block--accent dii-answer-card">
        <span className="page-tag">الجواب المختصر</span>
        <p className="dii-short-answer">{item.short_answer}</p>
      </div>

      <div className="dii-block dii-block--muted">
        <span className="page-tag">التفنيد المفصّل</span>
        <p className="page-desc dii-detailed-answer">{item.detailed_refutation}</p>
      </div>

      {item.assumption_correction && (
        <div className="dii-block dii-block--muted">
          <span className="page-tag">تصحيح الافتراضات</span>
          <p className="page-desc">{item.assumption_correction}</p>
        </div>
      )}

      {item.historical_linguistic_context && (
        <div className="dii-block dii-block--muted">
          <span className="page-tag">السياق التاريخي واللغوي</span>
          <p className="page-desc">{item.historical_linguistic_context}</p>
        </div>
      )}

      {item.evidences?.length > 0 && (
        <section className="dii-section">
          <h2 className="page-section-title">الأدلة</h2>
          <ul className="dii-evidence-list">
            {item.evidences.map((e, i) => (
              <li key={i} className="dii-block dii-block--evidence dii-evidence-item">
                <span className="page-tag">{e.type === "quran" ? "قرآن" : "حديث"} — {e.ref}</span>
                <p>{e.text}</p>
                {e.grading && <p className="dii-evidence-grading">الدرجة: {e.grading}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.objections_and_responses?.length > 0 && (
        <section className="dii-section">
          <h2 className="page-section-title">اعتراضات وردود</h2>
          <div className="dii-objections">
            {item.objections_and_responses.map((o, i) => (
              <div key={i} className="dii-block dii-block--muted">
                <p className="dii-objection">{o.objection}</p>
                <p className="dii-response">{o.response}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {item.conclusion && (
        <div className="dii-block dii-block--accent">
          <span className="page-tag">الخلاصة</span>
          <p className="page-desc">{item.conclusion}</p>
        </div>
      )}

      {item.sources?.length > 0 ? (
        <section className="dii-section">
          <h2 className="page-section-title">المصادر</h2>
          <ul className="dii-sources-list">
            {item.sources.map((s, i) => (
              <li key={i}>{safeHttpHref(s.url) ? <a href={safeHttpHref(s.url)} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}{s.author ? ` — ${s.author}` : ""}</li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="dii-block dii-block--muted dii-section" role="note">
          <span className="page-tag">حدود العرض</span>
          <p className="page-desc">
            قائمة المصادر المرجعية لهذه الشبهة قيد الإكمال. الجواب التعليمي يعتمد على الأدلة المذكورة أعلاه، ولا يُقدَّم كفتوى شخصية ولا كردّ مولَّد بالذكاء الاصطناعي بلا مصدر معتمد.
            {shubuhatCompletenessTier(item) === "PROVENANCE_PARTIAL" ? " (حالة المصدر: جزئية)" : null}
          </p>
        </div>
      )}

      <div className="twh-share dii-section">
        <ShareButtons title={item.title} url={`https://www.ssunnah.com/discover-islam/doubts/${item.slug}`} />
        <Link href="/discover-islam/doubts" className="page-link-inline">كل الشبهات ←</Link>
        {" · "}
        <Link href="/discover-islam/contact" className="page-link-inline">الإبلاغ عن خطأ أو اقتراح مصدر ←</Link>
      </div>
    </DiscoverIslamShell>
  
    </DetailScreen>
  );
}
