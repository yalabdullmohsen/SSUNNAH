import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/ui-common";
import { PageLoadingGuard } from "@/components/PageLoadingGuard";
import { PageShell } from "@/components/layout/PageShell";
import { UnifiedLessonCard } from "@/components/lessons/UnifiedLessonCard";
import { ExploreAlsoNav } from "@/components/ExploreAlsoNav";
import { EmptyStateV2, NoResultsState } from "@/components/design-system";
import { SearchField } from "@/design-system";
import { applyPageSeo } from "@/lib/seo";
import { getUnifiedLessonsSplit } from "@/lib/lessons-service";
import { RequestManager } from "@/lib/request-manager";
import { beginAbortScope, abortScope } from "@/lib/route-abort";
import {
  DEFAULT_KUWAIT_FILTERS,
  filterKuwaitLessons,
  sortKuwaitLessons,
  type KuwaitLessonFilters,
  type KuwaitLessonRecord,
} from "@/lib/kuwait-lessons";
import { fromKuwaitLesson } from "@/lib/unified-lesson-card";
import { toArabicDigits } from "@/lib/utils";
import "@/styles/pages/lessons.css";

/**
 * أرشيف الدروس المنتهية — مسار مستقل /lessons/archive.
 * القائمة النشطة في /lessons لا تعرض المنتهي.
 */
export default function LessonsArchivePage() {
  const [archived, setArchived] = useState<KuwaitLessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KuwaitLessonFilters>({
    ...DEFAULT_KUWAIT_FILTERS,
  });

  useEffect(() => {
    applyPageSeo({
      path: "/lessons/archive",
      canonicalPath: "/lessons/archive",
      title: "أرشيف الدروس السابقة | سُنّة",
      description:
        "دروس ودورات انتهت مواعيدها — مؤرشفة تلقائياً من القائمة النشطة في سُنّة.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://www.ssunnah.com/" },
            { "@type": "ListItem", position: 2, name: "الدروس", item: "https://www.ssunnah.com/lessons" },
            {
              "@type": "ListItem",
              position: 3,
              name: "الأرشيف",
              item: "https://www.ssunnah.com/lessons/archive",
            },
          ],
        },
      ],
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const signal = beginAbortScope("lessons:archive");
    setLoading(true);
    setLoadError(null);
    RequestManager.run(
      "lessons:archive-split",
      () => getUnifiedLessonsSplit(),
      { signal, dedupeKey: "lessons:archive-split" },
    )
      .then(({ archived: rows }) => {
        if (!cancelled) setArchived(rows);
      })
      .catch((err) => {
        if (cancelled || (err as Error)?.name === "AbortError") return;
        setLoadError(String((err as Error)?.message || err));
        /* keep-previous: لا تفرّغ الأرشيف عند فشل إعادة الجلب */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abortScope("lessons:archive");
      RequestManager.cancel("lessons:archive-split");
    };
  }, []);

  const filtered = useMemo(
    () => sortKuwaitLessons(filterKuwaitLessons(archived, filters)),
    [archived, filters],
  );

  return (
    <PageShell density="medium" variant="wide" className="lessons-archive-page">
      <PageHeader
        title="أرشيف الدروس"
        subtitle="دروس ودورات انتهت مواعيدها. القائمة النشطة لا تعرض المنتهي."
      />

      <p className="lessons-archive-back">
        <Link href="/lessons">← العودة إلى الدروس النشطة</Link>
        {archived.length > 0 ? (
          <span className="lessons-archive-count">
            {" "}
            · {toArabicDigits(archived.length)} مؤرشَف
          </span>
        ) : null}
      </p>

      <div className="lessons-archive-search">
        <SearchField
          placeholder="بحث في العنوان أو الشيخ أو المسجد…"
          value={filters.search}
          onChange={(v) => setFilters((prev) => ({ ...prev, search: v }))}
          label="بحث في الأرشيف"
        />
      </div>

      <PageLoadingGuard
        loading={loading}
        error={loadError}
        onRetry={() => window.location.reload()}
        keepPrevious
      >
        {filtered.length === 0 ? (
          filters.search.trim() ? (
            <NoResultsState
              className="lessons-archive-empty"
              title="لا نتائج في الأرشيف"
              description="جرّب كلمات أخرى أو امسح البحث."
              onClear={() => setFilters((prev) => ({ ...prev, search: "" }))}
            />
          ) : (
            <EmptyStateV2
              className="lessons-archive-empty"
              title="لا دروس مؤرشفة حالياً"
              description="تصفّح الدروس النشطة للمتابعة."
              ctaLabel="تصفّح الدروس النشطة"
              href="/lessons"
            />
          )
        ) : (
          <div className="page-card-grid lesson-unified-grid">
            {filtered.map((lesson) => (
              <UnifiedLessonCard
                key={`archive-${lesson.id}`}
                lesson={fromKuwaitLesson(lesson, true)}
                compact
              />
            ))}
          </div>
        )}
      </PageLoadingGuard>

      <ExploreAlsoNav
        links={[
          { href: "/lessons", label: "الدروس النشطة" },
          { href: "/calendar", label: "التقويم" },
          { href: "/tarikh-islami", label: "التاريخ الإسلامي" },
        ]}
      />
    </PageShell>
  );
}
