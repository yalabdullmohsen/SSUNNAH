/**
 * مسار الحفظ — صفحة القسم (Hub).
 * خلف Feature Flag · لا مسارات منشورة بعد · Empty states حقيقية.
 */
import { useEffect, useMemo } from "react";
import { Link, Redirect } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { EmptyState, ListGroup, ListRow, NavigationBar, Card } from "@/design-system";
import {
  HIFZ_CATEGORIES,
  HIFZ_PATH_USER_TAGLINE,
  countPublishedHifzPaths,
  getHifzContinueTarget,
  hifzCategoryLabel,
  isHifzPathEnabled,
  listHifzDueReviewsToday,
  listPublishedHifzPaths,
  listPublishedHifzPathsByCategory,
} from "@/lib/memorization-path";
import { HifzPathRow } from "./HifzPathRow";

const PATH = "/hifz-path";

export default function HifzPathPage() {
  if (!isHifzPathEnabled()) {
    return <Redirect to="/memorization" />;
  }
  return <HifzPathHub />;
}

function HifzPathHub() {
  const published = useMemo(() => listPublishedHifzPaths(), []);
  const publishedCount = countPublishedHifzPaths();
  const continueTarget = getHifzContinueTarget();
  const dueToday = listHifzDueReviewsToday();

  useEffect(() => {
    applyPageSeo({
      path: PATH,
      title: "مسار الحفظ | سُنّة",
      description: HIFZ_PATH_USER_TAGLINE,
      keywords: ["مسار الحفظ", "حفظ", "سُنّة"],
      robots: "noindex, follow",
    });
  }, []);

  return (
    <div className="sn-screen">
<NavigationBar title="مسار الحفظ" subtitle={HIFZ_PATH_USER_TAGLINE} />
<main className="sn-container sn-stack sn-stack--lg" dir="rtl">

        <section className="mb-5" aria-labelledby="hifz-continue">
          <h2 id="hifz-continue" className="mb-2 text-base font-semibold">
            متابعة الحفظ
          </h2>
          {continueTarget ? (
            <ListGroup><ListRow href={
                continueTarget.unitId
                  ? `${PATH}/p/${continueTarget.pathSlug}/u/${continueTarget.unitId}`
                  : `${PATH}/p/${continueTarget.pathSlug}`
              } title={continueTarget.pathTitle} description={
                continueTarget.unitTitle
                  ? `تابع: ${continueTarget.unitTitle}`
                  : "تابع من حيث توقفت"
              } /></ListGroup>
          ) : (
            <Card><strong>لا متابعة جارية</strong> 
              ابدأ مسارًا منشورًا أو سجّل وحدة ضمن محفوظاتك عند توفرها.
            </Card>
          )}
        </section>

        <section className="mb-5" aria-labelledby="hifz-reviews">
          <h2 id="hifz-reviews" className="mb-2 text-base font-semibold">
            مراجعات اليوم
          </h2>
          {dueToday.length === 0 ? (
            <EmptyState title="لا مراجعات مستحقة اليوم" description="تظهر هنا الوحدات المستحقة للمراجعة بعد تسجيل التقدم." />
          ) : (
            <ListGroup>
              {dueToday.map((item) => (
                <ListRow href={`${PATH}/p/${item.pathSlug}/u/${item.unitId}`} key={`${item.pathSlug}-${item.unitId}`} title={item.unitTitle} description={[item.pathTitle, "مستحقة للمراجعة"].filter(Boolean).join(" — ")} />
              ))}
            </ListGroup>
          )}
        </section>

        <section className="mb-5" aria-labelledby="hifz-suggested">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 id="hifz-suggested" className="text-base font-semibold">
              المسارات المقترحة
            </h2>
            <Link
              href={`${PATH}/my`}
              className="text-sm text-primary underline-offset-2 hover:underline"
            >
              محفوظاتي
            </Link>
          </div>
          {published.length === 0 ? (
            <EmptyState title="لا مسارات منشورة بعد" description="مسارات الحفظ تُفتح للعامة بعد اعتماد المصدر والترخيص والمراجعة." />
          ) : (
            <ListGroup>
              {published.map((path) => (
                <HifzPathRow key={path.id} path={path} />
              ))}
            </ListGroup>
          )}
        </section>

        <section className="mb-5" aria-labelledby="hifz-categories">
          <h2 id="hifz-categories" className="mb-2 text-base font-semibold">
            التصنيفات
          </h2>
          <ListGroup>
            {HIFZ_CATEGORIES.map((category) => {
              const count = listPublishedHifzPathsByCategory(category).length;
              return (
                <ListRow href={`${PATH}/c/${category}`} key={category} title={hifzCategoryLabel(category)} description={
                    count > 0
                      ? `${count} مسار منشور`
                      : "لا مسارات منشورة بعد"
                  } />
              );
            })}
          </ListGroup>
        </section>

        <section className="mb-2" aria-labelledby="hifz-mine-entry">
          <h2 id="hifz-mine-entry" className="sr-only">
            محفوظاتي
          </h2>
          <ListGroup><ListRow href={`${PATH}/my`} title="محفوظاتي" description="متابعة الوحدات التي سجّلتها للمراجعة" /></ListGroup>
        </section>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {publishedCount === 0
            ? "لا محتوى منشور للعامة في هذا القسم حاليًا."
            : `${publishedCount} مسار منشور.`}
        </p>
      </main>
    </div>
  );
}
