import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import {
  RESEARCH_CATEGORIES,
  RESEARCH_KIND_LABELS,
  ACADEMIC_LEVEL_LABELS,
  LICENSE_LABELS,
  REVIEW_STATUS_LABELS,
  PERSONAL_RESEARCH_NOTICE,
  RIGHTS_DISCLAIMER,
  submitResearch,
  listMySubmissions,
  type ResearchKind,
  type AcademicLevel,
  type LicenseType,
  type SubmitterRole,
  type ResearchSubmissionInput,
} from "@/lib/researches";
import "@/styles/pages/researches.css";
import { NavigationBar } from "@/design-system";
import { FieldLabel } from "@/components/design-system/FormFields";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AR_UI_LOCALE } from "@/lib/numerals";

const NONE = "__none__";

const initial: ResearchSubmissionInput = {
  title: "",
  kind: "undergraduate",
  categoryId: "fiqh",
  authorName: "",
  authorEmail: "",
  submitterRole: "author",
  language: "ar",
  abstract: "",
  keywords: "",
  license: "all_rights_reserved",
  acceptTerms: false,
  attestOwnership: false,
};

export default function ResearchSubmitPage() {
  const [form, setForm] = useState<ResearchSubmissionInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const mine = listMySubmissions();

  useEffect(() => {
    applyPageSeo({
      path: "/academic-research/submit",
      title: "أضف بحثًا | الأبحاث الشرعية",
      description: "قدّم بحثًا شرعيًا للمراجعة. لا يُنشر أي بحث مباشرة.",
      robots: "noindex,follow",
    });
  }, []);

  const set = <K extends keyof ResearchSubmissionInput>(key: K, value: ResearchSubmissionInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = submitResearch(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDoneId(res.submission.id);
    setForm(initial);
  };

  return (
    <div className="sn-screen">
      <NavigationBar title="أضف بحثًا" large={false} />
    <div className="sr-page">
      <p><Link href="/academic-research" className="sr-section__link">← الأبحاث الشرعية</Link></p>
      <h1 className="sr-detail__h1">أضف بحثًا</h1>
      <p className="sr-notice">
        لا يُنشر أي بحث مباشرة. الطلب يمر بفحص آلي ثم مراجعة. الأبحاث الشخصية لا تُعرض للعامة إلا بعد اعتماد مراجع مخوّل.
        {" "}{PERSONAL_RESEARCH_NOTICE}
      </p>
      <p className="sr-notice">{RIGHTS_DISCLAIMER}</p>

      {doneId && (
        <div className="sr-notice" role="status">
          تم استلام الطلب ({doneId}). الحالة الحالية: {REVIEW_STATUS_LABELS[listMySubmissions().find((s) => s.id === doneId)?.status || "submitted"]}.
          ستصلك تحديثات الحالة عند تغيّرها (محليًا في سجل طلباتك أدناه؛ والإشعارات عبر الخادم عند تفعيل قاعدة البيانات).
        </div>
      )}
      {error && <div className="sr-error" role="alert">{error}</div>}

      <form className="sr-form" onSubmit={onSubmit}>
        <label>عنوان البحث *
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label>العنوان بالإنجليزية
          <input value={form.titleEn || ""} onChange={(e) => set("titleEn", e.target.value)} />
        </label>
        <div className="sr-form__field">
          <FieldLabel>نوع البحث *</FieldLabel>
          <Select value={form.kind} onValueChange={(v) => set("kind", v as ResearchKind)}>
            <SelectTrigger className="min-h-11 text-base" aria-label="نوع البحث">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RESEARCH_KIND_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sr-form__field">
          <FieldLabel>التخصص الرئيسي *</FieldLabel>
          <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
            <SelectTrigger className="min-h-11 text-base" aria-label="التخصص الرئيسي">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sr-form__field">
          <FieldLabel>التخصص الفرعي</FieldLabel>
          <Select
            value={form.subcategoryId || NONE}
            onValueChange={(v) => set("subcategoryId", v === NONE ? undefined : v)}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="التخصص الفرعي">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {RESEARCH_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label>اسم الباحث *
          <input required value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
        </label>
        <label>البريد الإلكتروني (لا يُعرض للعامة) *
          <input required type="email" value={form.authorEmail} onChange={(e) => set("authorEmail", e.target.value)} />
        </label>
        <div className="sr-form__field">
          <FieldLabel>صفتك</FieldLabel>
          <Select
            value={form.submitterRole}
            onValueChange={(v) => set("submitterRole", v as SubmitterRole)}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="صفتك">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="author">الباحث نفسه</SelectItem>
              <SelectItem value="coauthor">مؤلف مشارك</SelectItem>
              <SelectItem value="supervisor">مشرف</SelectItem>
              <SelectItem value="university">جامعة</SelectItem>
              <SelectItem value="publisher">ناشر</SelectItem>
              <SelectItem value="aggregator">ناقل / مفهرس</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label>الباحثون المشاركون
          <input value={form.coauthors || ""} onChange={(e) => set("coauthors", e.target.value)} />
        </label>
        <label>المشرف
          <input value={form.supervisor || ""} onChange={(e) => set("supervisor", e.target.value)} />
        </label>
        <label>الجامعة
          <input value={form.university || ""} onChange={(e) => set("university", e.target.value)} />
        </label>
        <label>الكلية
          <input value={form.college || ""} onChange={(e) => set("college", e.target.value)} />
        </label>
        <label>القسم
          <input value={form.department || ""} onChange={(e) => set("department", e.target.value)} />
        </label>
        <div className="sr-form__field">
          <FieldLabel>الدرجة العلمية</FieldLabel>
          <Select
            value={form.academicLevel || NONE}
            onValueChange={(v) => set("academicLevel", (v === NONE ? undefined : v) as AcademicLevel | undefined)}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="الدرجة العلمية">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {Object.entries(ACADEMIC_LEVEL_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label>الدولة
          <input value={form.country || ""} onChange={(e) => set("country", e.target.value)} />
        </label>
        <label>سنة الإنجاز / النشر
          <input type="number" value={form.year || ""} onChange={(e) => set("year", e.target.value ? Number(e.target.value) : undefined)} />
        </label>
        <div className="sr-form__field">
          <FieldLabel>اللغة</FieldLabel>
          <Select
            value={form.language}
            onValueChange={(v) => set("language", v as "ar" | "en" | "other")}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="اللغة">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">الإنجليزية</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label>الملخص *
          <textarea required value={form.abstract} onChange={(e) => set("abstract", e.target.value)} />
        </label>
        <label>الكلمات المفتاحية (مفصولة بفاصلة)
          <input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} />
        </label>
        <label>أهداف البحث
          <textarea value={form.objectives || ""} onChange={(e) => set("objectives", e.target.value)} />
        </label>
        <label>منهج البحث
          <textarea value={form.methodology || ""} onChange={(e) => set("methodology", e.target.value)} />
        </label>
        <label>النتائج
          <textarea value={form.findings || ""} onChange={(e) => set("findings", e.target.value)} />
        </label>
        <label>التوصيات
          <textarea value={form.recommendations || ""} onChange={(e) => set("recommendations", e.target.value)} />
        </label>
        <label>رابط المصدر الأصلي
          <input type="url" value={form.sourceUrl || ""} onChange={(e) => set("sourceUrl", e.target.value)} />
        </label>
        <label>DOI
          <input value={form.doi || ""} onChange={(e) => set("doi", e.target.value)} />
        </label>
        <div className="sr-form__field">
          <FieldLabel>نوع الترخيص</FieldLabel>
          <Select value={form.license} onValueChange={(v) => set("license", v as LicenseType)}>
            <SelectTrigger className="min-h-11 text-base" aria-label="نوع الترخيص">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LICENSE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label>بيانات حقوق النشر
          <textarea value={form.copyrightNote || ""} onChange={(e) => set("copyrightNote", e.target.value)} />
        </label>
        <label>إذن النشر / إثبات الملكية (ملاحظة للإدارة — لا تُعرض للعامة)
          <textarea value={form.permissionProofNote || ""} onChange={(e) => set("permissionProofNote", e.target.value)} />
        </label>
        <p className="sr-notice">رفع ملف PDF متاح بعد تهيئة التخزين الآمن على الخادم، وفقط عند وجود إذن قانوني صريح. لا تُرفع ملفات محمية بلا ترخيص.</p>
        <label className="sr-form__check">
          <input type="checkbox" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} />
          أوافق على شروط الاستخدام وسياسة حقوق الباحثين.
        </label>
        <label className="sr-form__check">
          <input type="checkbox" checked={form.attestOwnership} onChange={(e) => set("attestOwnership", e.target.checked)} />
          أُقرّ بصحة المعلومات وعدم الاعتداء على حقوق الآخرين، وأنني مخوّل بتقديم هذا العمل.
        </label>
        <Button type="submit" variant="outline" className="sr-btn sr-btn--outline">
          إرسال للمراجعة
        </Button>
      </form>

      {mine.length > 0 && (
        <section className="sr-section" style={{ marginTop: "2rem" }}>
          <h2 className="sr-section__title">طلباتك</h2>
          <div className="sr-list">
            {mine.map((s) => (
              <div key={s.id} className="sr-card">
                <h3 className="sr-card__title">{s.title}</h3>
                <p className="sr-card__meta">
                  <span className="sr-badge">{REVIEW_STATUS_LABELS[s.status]}</span>
                  {s.isPersonal && <span className="sr-badge">شخصي</span>}
                  <span>{new Date(s.updatedAt).toLocaleString(AR_UI_LOCALE)}</span>
                </p>
                {s.statusNote && <p className="sr-card__abs">{s.statusNote}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    </div>
  );
}
