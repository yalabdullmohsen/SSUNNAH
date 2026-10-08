/**
 * محفوظاتي — وحدات مسجّلة محليًا للمراجعة.
 */
import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { ButtonLink, EmptyState, ListGroup, ListRow, NavigationBar } from "@/design-system";
import {
  HIFZ_PATH_USER_TAGLINE,
  HIFZ_PROGRESS_USER_LABELS,
  isHifzPathEnabled,
  listMyHifzUnits,
  refreshDueHifzReviews,
} from "@/lib/memorization-path";
import { AR_UI_LOCALE } from "@/lib/numerals";

const PATH = "/hifz-path";

export default function HifzPathMyPage() {
  if (!isHifzPathEnabled()) {
    return <Redirect to="/memorization" />;
  }
  return <HifzPathMyShell />;
}

function HifzPathMyShell() {
  const [units, setUnits] = useState(() => {
    refreshDueHifzReviews();
    return listMyHifzUnits();
  });

  useEffect(() => {
    applyPageSeo({
      path: `${PATH}/my`,
      title: "محفوظاتي | مسار الحفظ | سُنّة",
      description: "متابعة الوحدات التي سجّلتها للمراجعة ضمن مسار الحفظ.",
      robots: "noindex, follow",
    });
    refreshDueHifzReviews();
    setUnits(listMyHifzUnits());
  }, []);

  return (
    <div className="sn-screen">
<NavigationBar title="محفوظاتي" subtitle="الوحدات التي سجّلتها ضمن محفوظاتك — بلا شهادة حفظ وبلا ادعاء تحقق آلي." />
<main className="sn-container sn-stack sn-stack--lg" dir="rtl">
        {units.length === 0 ? (
          <EmptyState title="لا وحدات في محفوظاتك بعد" description={`${HIFZ_PATH_USER_TAGLINE}. سجّل وحدة بعد بدء مسار منشور.`} action={<ButtonLink href={PATH} variant="secondary">العودة لمسار الحفظ</ButtonLink>} />
        ) : (
          <ListGroup>
            {units.map((u) => (
              <ListRow href={`${PATH}/p/${u.pathSlug}/u/${u.unitId}`} key={`${u.pathSlug}-${u.unitId}`} title={u.unitTitle} description={[`${u.pathTitle} · ${HIFZ_PROGRESS_USER_LABELS[u.state]}`, 
                  u.nextReviewAt
                    ? `المراجعة القادمة: ${new Date(u.nextReviewAt).toLocaleDateString(AR_UI_LOCALE)}`
                    : undefined
                ].filter(Boolean).join(" — ")} />
            ))}
          </ListGroup>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href={PATH} className="text-primary underline-offset-2 hover:underline">
            تصفّح المسارات المقترحة
          </Link>
        </p>
      </main>
    </div>
  );
}
