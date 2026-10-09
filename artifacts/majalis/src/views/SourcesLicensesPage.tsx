import { useEffect } from "react";
import { Link } from "wouter";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";
import { ShareButtons } from "@/components/ContentActions";
import { applyPageSeo } from "@/lib/seo";
import { NavigationBar } from "@/design-system";
import {
  CONTENT_TYPES,
  RIGHTS_SENTENCE,
  STATUS_LABEL,
  unknownLicenseEntries,
  type SourceEntry,
} from "@/data/content-sources";

function SourceList({ entries }: { entries: SourceEntry[] }) {
  return (
    <ul className="cs-list">
      {entries.map((e) => (
        <li key={e.name} className="cs-item" data-status={e.status}>
          <div className="cs-item__head">
            <strong dir="auto">{e.name}</strong>
            <span className="cs-badge" data-status={e.status}>
              {STATUS_LABEL[e.status]}
            </span>
          </div>
          <p className="cs-item__row">
            <span className="cs-item__key">ما أخذناه:</span> {e.took}
          </p>
          <p className="cs-item__row">
            <span className="cs-item__key">الترخيص:</span> {e.license}
          </p>
          {e.url ? (
            <a className="cs-item__link" href={e.url} target="_blank" rel="noopener noreferrer" dir="ltr">
              {e.url}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function SourcesLicensesPage() {
  useEffect(() => {
    applyPageSeo({
      path: "/data-licenses",
      title: "المصادر والتراخيص | سُنّة",
      description:
        "مصادر كل ما في سُنّة: القرآن والتفسير والتلاوات والأحاديث والأذكار والمواقيت والدروس والخطوط والمكتبات ونموذج التسميع، مع ترخيص كل مصدر.",
      keywords: ["مصادر", "تراخيص", "سُنّة", "حقوق"],
    });
  }, []);

  const unknown = unknownLicenseEntries();

  return (
    <div className="sn-screen">
      <NavigationBar title="المصادر والتراخيص" large={false} />
      <LegalPageLayout eyebrow="الشفافية" title="المصادر والتراخيص" updatedAt="2026-10-09">
        <LegalSection title="الحقوق">
          <p className="cs-rights" data-testid="rights-sentence">
            {RIGHTS_SENTENCE}
          </p>
          <p>
            لا نعيد استضافة الدروس والمنشورات الخارجية؛ تُعرض كمعلومة وجدول ورابط للمصدر.{" "}
            <Link href="/methodology">منهجية التوثيق</Link> · <Link href="/sources">دليل الجهات</Link>
          </p>
        </LegalSection>

        {CONTENT_TYPES.map((t) => (
          <LegalSection key={t.id} title={t.label}>
            <div data-content-type={t.id}>
              <SourceList entries={t.entries} />
            </div>
          </LegalSection>
        ))}

        <LegalSection title="مصادر لم يُحسم ترخيصها">
          <p>
            لا ندّعي لها ترخيصًا مفتوحًا. تُراجَع مع المالك قبل أي اعتماد، وما لم يثبت إذنه
            يبقى معروضًا بالإسناد فقط أو يُسحب.
          </p>
          <ul className="cs-unknown" data-testid="unknown-license-list">
            {unknown.map((e) => (
              <li key={`${e.typeId}-${e.name}`}>
                <strong dir="auto">{e.name}</strong> <span className="cs-item__key">({e.typeLabel})</span>
              </li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title="الإبلاغ">
          <p>
            بلاغات الحقوق أو خطأ في النسبة عبر <Link href="/contact">تواصل معنا</Link> — أولوية قصوى.
          </p>
        </LegalSection>
        <ShareButtons title="المصادر والتراخيص — سُنّة" url="https://www.ssunnah.com/data-licenses" />
      </LegalPageLayout>
    </div>
  );
}
