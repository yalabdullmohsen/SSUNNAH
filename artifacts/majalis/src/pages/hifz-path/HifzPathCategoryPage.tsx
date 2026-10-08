/**
 * تصنيف مسار حفظ — يعرض المسارات المنشورة فقط.
 */
import { useEffect, useMemo } from "react";
import { Link, Redirect, useParams } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { ButtonLink, EmptyState, ListGroup, NavigationBar } from "@/design-system";
import {
  HIFZ_PATH_USER_TAGLINE,
  hifzCategoryLabel,
  isHifzCategory,
  isHifzPathEnabled,
  listPublishedHifzPathsByCategory,
} from "@/lib/memorization-path";
import { HifzPathRow } from "./HifzPathRow";

const PATH = "/hifz-path";

export default function HifzPathCategoryPage() {
  if (!isHifzPathEnabled()) {
    return <Redirect to="/memorization" />;
  }
  return <HifzPathCategoryShell />;
}

function HifzPathCategoryShell() {
  const params = useParams<{ category?: string }>();
  const raw = params.category ?? "";
  const valid = isHifzCategory(raw);

  const paths = useMemo(
    () => (valid ? listPublishedHifzPathsByCategory(raw) : []),
    [raw, valid],
  );

  const title = valid ? hifzCategoryLabel(raw) : "تصنيف غير معروف";

  useEffect(() => {
    applyPageSeo({
      path: `${PATH}/c/${raw || "unknown"}`,
      title: `${title} | مسار الحفظ | سُنّة`,
      description: HIFZ_PATH_USER_TAGLINE,
      robots: "noindex, follow",
    });
  }, [raw, title]);

  if (!valid) {
    return (
      <div className="sn-screen">
<NavigationBar title="مسار الحفظ" />
<main className="sn-container" dir="rtl">
          <EmptyState title="تصنيف غير معروف" description="هذا التصنيف ليس ضمن مسارات الحفظ المعتمدة." action={<ButtonLink href={PATH} variant="secondary">العودة لمسار الحفظ</ButtonLink>} />
        </main>
      </div>
    );
  }

  return (
    <div className="sn-screen">
<NavigationBar title={title} subtitle={`${"مسار الحفظ"} · ${HIFZ_PATH_USER_TAGLINE}`} />
<main className="sn-container sn-stack sn-stack--lg" dir="rtl">
        {paths.length === 0 ? (
          <EmptyState title="لا مسارات منشورة في هذا التصنيف" description="يُعرض المنشور فقط بعد اعتماد المصدر والترخيص والمراجعة." action={<ButtonLink href={PATH} variant="secondary">العودة لمسار الحفظ</ButtonLink>} />
        ) : (
          <ListGroup>
            {paths.map((path) => (
              <HifzPathRow key={path.id} path={path} />
            ))}
          </ListGroup>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href={PATH} className="text-primary underline-offset-2 hover:underline">
            كل المسارات
          </Link>
        </p>
      </main>
    </div>
  );
}
