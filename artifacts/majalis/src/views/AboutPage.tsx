import { useEffect, useState } from "react";
import { Link } from "wouter";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";
import { ShareButtons } from "@/components/ContentActions";
import { applyPageSeo } from "@/lib/seo";
import { isWeb } from "@/lib/native-platform";
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL } from "@/lib/site-config";
import { NavigationBar } from "@/design-system";
import "@/styles/pages/learn-legal-v2.css";
import { AR_UI_LOCALE } from "@/lib/numerals";

type VersionInfo = {
  shortCommit?: string;
  commitSha?: string;
  builtAt?: string;
  buildTime?: string;
  branch?: string;
  ref?: string;
};

export default function AboutPage() {
  const [version, setVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    applyPageSeo({
      path: "/about",
      title: "حول التطبيق | سُنّة",
      description:
        "تعرّف على تطبيق سُنّة — رفيقك اليومي لطلب العلم من دروس العلماء والقرآن والفوائد في تجربة واحدة.",
      keywords: [
        "حول التطبيق",
        "تطبيق سُنّة",
        "تطبيق العلوم الشرعية",
        "دروس العلماء",
        "القرآن والأذكار",
        "تعلم العلوم الشرعية",
        "سُنّة",
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "سُنّة",
          url: SITE_URL,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          inLanguage: "ar",
          description:
            "تعرّف على تطبيق سُنّة — رفيقك اليومي لطلب العلم من دروس العلماء والقرآن والفوائد في تجربة واحدة.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      ],
    });
    void fetch("/version.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: VersionInfo | null) => {
        if (data) setVersion(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="sn-screen">
      <NavigationBar title="حول التطبيق" large={false} />
    <LegalPageLayout eyebrow="التطبيق" title="حول التطبيق">
      <LegalSection title="ماذا يقدّم التطبيق">
        <p>{SITE_DESCRIPTION}</p>
        <p>{SITE_TAGLINE}</p>
        <p>
          رفيقك اليومي لطلب العلم: دروس العلماء والسلاسل والقرآن والمصحف والفقه والحديث
          والأذكار ومواقيت الصلاة والبحث والمفضلة في تجربة عربية واحدة.
        </p>
      </LegalSection>

      <LegalSection title="أبرز ما ستجده">
        <ul>
          <li><strong>القرآن والمصحف:</strong> قراءة ومتابعة يومية هادئة مع مسار المصحف الرسمي.</li>
          <li><strong>الدروس والسلاسل:</strong> تعلّم من العلماء والدروس الموثقة بترتيب واضح.</li>
          <li><strong>الفقه والعقيدة والحديث:</strong> أبواب وموضوعات مرتبة لطلب العلم.</li>
          <li><strong>الأذكار ومواقيت الصلاة:</strong> أذكار يومية ومواقيت مع تنبيهات عند التوفر.</li>
          <li><strong>البحث والمفضلة:</strong> وصول سريع لما تحتاجه وحفظ ما ينفعك للمراجعة.</li>
          <li><strong>المسارات التعليمية:</strong> خطوات مرتبة لطالب العلم عند توفرها.</li>
        </ul>
      </LegalSection>

      <LegalSection title="تجربة الآيفون">
        <p>
          سُنّة مبنية كتطبيق أصلي للآيفون بنفس المحتوى: الدروس والعلماء والقرآن والمتابعة.
          {/* دعوة التحميل للموقع فقط — داخل التطبيق لا معنى لها */}
          {isWeb() ? " رابط التحميل من App Store يُعرض هنا فور النشر الرسمي." : null}
        </p>
      </LegalSection>

      <LegalSection title="رقم الإصدار">
        <p>
          الإصدار المعروض على الويب يتحدّث مع كل نشر إنتاجي.
          {version?.commitSha || version?.shortCommit ? (
            <>
              {" "}الإصدار الحالي:{" "}
              <strong dir="ltr">{version.commitSha || version.shortCommit}</strong>
              {version.branch || version.ref ? (
                <> (<span dir="ltr">{version.branch || version.ref}</span>)</>
              ) : null}
              {version.buildTime || version.builtAt ? (
                <> — بُني في {new Date(String(version.buildTime || version.builtAt)).toLocaleString(AR_UI_LOCALE)}</>
              ) : null}
              .
            </>
          ) : (
            <> يمكنك أيضاً الاطلاع على ملف <span dir="ltr">/version.json</span>.</>
          )}
        </p>
      </LegalSection>

      <LegalSection title="مصادر المحتوى">
        <p>
          يُستمد المحتوى من مصادر شرعية معتبرة قدر الإمكان، مع العزو والمراجعة. التفصيل المنهجي
          في صفحة <Link href="/methodology">منهجية التوثيق</Link>
          {" "}وصفحة <Link href="/data-licenses">المصادر والتراخيص</Link>.
        </p>
      </LegalSection>

      <LegalSection title="شكر ومراجع">
        <p>
          نشكر أهل العلم والمؤسسات التي أتاحت مراجع عامة يُستفاد منها في التعلّم، ونرحّب بأي
          تصويب عبر <Link href="/contact">تواصل معنا</Link>.
        </p>
      </LegalSection>
<ShareButtons title="حول التطبيق — سُنّة" url="https://www.ssunnah.com/about" />
    </LegalPageLayout>
    </div>
  );
}
