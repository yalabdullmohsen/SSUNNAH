/**
 * صفحة مسار حفظ — ملخص · وحدات · مصدر · السابق/التالي.
 * لا نص شرعي مخزّن هنا؛ الوحدات عبر مراجع موثّقة فقط.
 */
import { useEffect, useMemo } from "react";
import { Link, Redirect, useParams } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { ButtonLink, Card, EmptyState, ListGroup, ListRow, NavigationBar, SectionHeader } from "@/design-system";
import {
  HIFZ_PATH_USER_TAGLINE,
  HIFZ_PROGRESS_USER_LABELS,
  getPublishedHifzPathBySlug,
  getUnitProgress,
  hifzCategoryLabel,
  hifzLevelLabel,
  isHifzPathEnabled,
  listPublishedHifzPaths,
  listPublishedUnitsForPath,
  pathProgressPercent,
} from "@/lib/memorization-path";

const PATH = "/hifz-path";

export default function HifzPathDetailPage() {
  if (!isHifzPathEnabled()) {
    return <Redirect to="/memorization" />;
  }
  return <HifzPathDetailShell />;
}

function HifzPathDetailShell() {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug ?? "";
  const path = useMemo(
    () => (slug ? getPublishedHifzPathBySlug(slug) : null),
    [slug],
  );

  const allPublished = useMemo(() => listPublishedHifzPaths(), []);
  const nav = useMemo(() => {
    if (!path) return { prev: null as string | null, next: null as string | null };
    const idx = allPublished.findIndex((p) => p.id === path.id);
    return {
      prev: idx > 0 ? allPublished[idx - 1]?.slug ?? null : null,
      next:
        idx >= 0 && idx < allPublished.length - 1
          ? allPublished[idx + 1]?.slug ?? null
          : null,
    };
  }, [allPublished, path]);

  const units = useMemo(
    () => (path ? listPublishedUnitsForPath(path) : []),
    [path],
  );

  const progressPct = useMemo(() => {
    if (!path) return null;
    return pathProgressPercent(
      path.slug,
      units.map((u) => u.unitId),
    );
  }, [path, units]);

  useEffect(() => {
    applyPageSeo({
      path: `${PATH}/p/${slug || "unknown"}`,
      title: path
        ? `${path.title} | مسار الحفظ | سُنّة`
        : "مسار غير متاح | سُنّة",
      description: path?.shortDescription ?? HIFZ_PATH_USER_TAGLINE,
      robots: "noindex, follow",
    });
  }, [path, slug]);

  if (!path) {
    return (
      <div className="sn-screen">
<NavigationBar title="مسار الحفظ" />
<main className="sn-container" dir="rtl">
          <EmptyState title="المسار غير متاح" description="لا يُعرض للعامة إلا المسارات المنشورة بعد اعتماد المصدر والترخيص." action={<ButtonLink href={PATH} variant="secondary">العودة لمسار الحفظ</ButtonLink>} />
        </main>
      </div>
    );
  }

  return (
    <div className="sn-screen">
<NavigationBar title={path.title} subtitle={`${hifzCategoryLabel(path.category)} · ${path.shortDescription ?? HIFZ_PATH_USER_TAGLINE}`} />
<main className="sn-container sn-stack sn-stack--lg" dir="rtl">

        <section className="sn-stack"><SectionHeader title="ملخص" />
          <p className="text-sm text-muted-foreground">
            المستوى: {hifzLevelLabel(path.level)}
            {path.estimatedUnits > 0
              ? ` · ${path.estimatedUnits} وحدة تقديرية`
              : ""}
          </p>
          {path.learningObjectives && path.learningObjectives.length > 0 ? (
            <ul className="mt-2 list-disc pr-5 text-sm">
              {path.learningObjectives.map((obj) => (
                <li key={obj}>{obj}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="sn-stack"><SectionHeader title="التقدم والمراجعة" />
          {progressPct == null ? (
            <Card>
              لا تقدّم مسجّل بعد. عند توفر تجربة الوحدة يمكنك استخدام «أتممت هذه
              الوحدة» أو «سجلتها ضمن محفوظاتي» — بلا شهادة حفظ.
            </Card>
          ) : (
            <Card><strong>{`التقدم ${progressPct}%`}</strong> 
              نسبة حقيقية من الوحدات التي سجّلتها ذاتيًا — ليست شهادة حفظ.
            </Card>
          )}
        </section>

        <section className="sn-stack"><SectionHeader title="خطة الوحدات" />
          {units.length === 0 ? (
            <EmptyState title="لا وحدات منشورة بعد" description="الوحدات تُنشر بعد مطابقة النص بالمصدر المعتمد." />
          ) : (
            <ListGroup>
              {units.map((unit) => {
                const prog = getUnitProgress(path.slug, unit.unitId);
                return (
                  <ListRow href={`${PATH}/p/${path.slug}/u/${unit.unitId}`} key={unit.unitId} title={unit.title} description={[`الوحدة ${unit.sequence}${
                      prog
                        ? ` · ${HIFZ_PROGRESS_USER_LABELS[prog.state]}`
                        : ""
                    }`, prog ? "تابع" : "ابدأ الحفظ"].filter(Boolean).join(" — ")} />
                );
              })}
            </ListGroup>
          )}
        </section>

        <section className="sn-stack"><SectionHeader title="المصدر والنسخة" />
          <dl className="grid gap-1 text-sm">
            <div>
              <dt className="inline font-medium">المرجع: </dt>
              <dd className="inline">
                {path.sourceReference ?? "يُحدَّد قبل النشر"}
              </dd>
            </div>
            {path.edition ? (
              <div>
                <dt className="inline font-medium">الطبعة/النسخة: </dt>
                <dd className="inline">{path.edition}</dd>
              </div>
            ) : null}
            {path.revisionPlan ? (
              <div>
                <dt className="inline font-medium">خطة المراجعة: </dt>
                <dd className="inline">{path.revisionPlan}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <nav
          className="mt-6 flex items-center justify-between gap-3 text-sm"
          aria-label="تنقّل المسارات"
        >
          {nav.prev ? (
            <Link
              href={`${PATH}/p/${nav.prev}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              السابق
            </Link>
          ) : (
            <span className="text-muted-foreground">السابق</span>
          )}
          <Link
            href={PATH}
            className="text-muted-foreground underline-offset-2 hover:underline"
          >
            كل المسارات
          </Link>
          {nav.next ? (
            <Link
              href={`${PATH}/p/${nav.next}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              التالي
            </Link>
          ) : (
            <span className="text-muted-foreground">التالي</span>
          )}
        </nav>
      </main>
    </div>
  );
}
