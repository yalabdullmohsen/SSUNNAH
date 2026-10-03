import {
  EmptyStateV2,
  ErrorStateV2,
  NoResultsState,
  OfflineStateV2,
} from "@/components/design-system";

export type HadithEmptyKind =
  | "no_results"
  | "network_required"
  | "network_failed"
  | "unavailable_locally"
  | "filter_empty"
  | "load_failed";

export type HadithEmptyStateProps = {
  kind: HadithEmptyKind;
  /** إجراء مسح الفلاتر */
  onClearFilters?: () => void;
  /** إعادة المحاولة */
  onRetry?: () => void;
  className?: string;
};

type Spec = {
  title: string;
  description: string;
  nextStep: string;
  ctaLabel: string;
  href?: string;
  useClear?: boolean;
  useRetry?: boolean;
};

const SPECS: Record<HadithEmptyKind, Spec> = {
  no_results: {
    title: "لا نتائج مطابقة",
    description: "لم يُعثر على أحاديث تطابق عبارة البحث الحالية.",
    nextStep: "جرّب كلمات أقصر، أو امسح عوامل التصفية، أو تصفّح البخاري.",
    ctaLabel: "مسح عوامل التصفية",
    useClear: true,
  },
  filter_empty: {
    title: "لا أحاديث لهذه التصفية",
    description: "تركيبة الفلاتر الحالية لا تُرجع نتائج من المجموعة المتاحة.",
    nextStep: "امسح عوامل التصفية أو اختر صحيح البخاري أو صحيح مسلم.",
    ctaLabel: "مسح عوامل التصفية",
    useClear: true,
  },
  network_required: {
    title: "هذه المجموعة تتطلب اتصالًا",
    description: "المحتوى غير مخزّن محليًا بالكامل ويعتمد على الكتالوج الشبكي.",
    nextStep: "تصفّح الصحيحين المتاحين محليًا، أو افتح مسار الأربعين النووية.",
    ctaLabel: "عرض أحاديث البخاري",
    href: "/hadith/sahih",
  },
  network_failed: {
    title: "تعذّر الاتصال بكتالوج الكتب",
    description: "فشل جلب المجموعة من الشبكة. الصحيحان المحلّيان ما زالا متاحين.",
    nextStep: "أعد المحاولة عند تحسّن الاتصال، أو انتقل إلى الأحاديث الصحيحة المحلية.",
    ctaLabel: "إعادة المحاولة",
    useRetry: true,
  },
  unavailable_locally: {
    title: "المجموعة غير متاحة محليًا",
    description: "لا توجد نسخة محلية كاملة لهذه المجموعة في التطبيق حاليًا.",
    nextStep: "عرض أحاديث البخاري أو مسلم، أو فتح مسار الأربعين النووية.",
    ctaLabel: "عرض أحاديث مسلم",
    href: "/hadith/sahih",
  },
  load_failed: {
    title: "تعذّر تحميل الأحاديث",
    description: "لم نتمكّن من جلب البيانات الأولية. قد تكون مشكلة مؤقتة في التحميل.",
    nextStep: "أعد المحاولة، أو افتح الأربعين النووية إن كنت بحاجة لمسار تعليمي سريع.",
    ctaLabel: "إعادة المحاولة",
    useRetry: true,
  },
};

/**
 * حالة حديث موحّدة — NoResults / Offline / Error حسب النوع (Feedback V2).
 */
export function HadithEmptyState({
  kind,
  onClearFilters,
  onRetry,
  className = "",
}: HadithEmptyStateProps) {
  const spec = SPECS[kind];
  const cls = `hadith-empty-state${className ? ` ${className}` : ""}`;

  if (kind === "no_results" || kind === "filter_empty") {
    return (
      <NoResultsState
        className={cls}
        data-hadith-empty={kind}
        title={spec.title}
        description={`${spec.description} ${spec.nextStep}`}
        clearLabel={spec.ctaLabel}
        onClear={onClearFilters}
      />
    );
  }

  if (kind === "network_required" || kind === "unavailable_locally") {
    return (
      <OfflineStateV2
        className={cls}
        data-hadith-empty={kind}
        title={spec.title}
        description={spec.description}
        availableHint={`${spec.nextStep} · أو: الأربعين النووية (/arbaeen-nawawi)`}
        onRetry={onRetry}
        offlineCenterHref={spec.href ?? "/hadith/sahih"}
        offlineCenterLabel={spec.ctaLabel}
      />
    );
  }

  if (kind === "network_failed" || kind === "load_failed") {
    return (
      <ErrorStateV2
        className={cls}
        data-hadith-empty={kind}
        title={spec.title}
        description={`${spec.description} ${spec.nextStep}`}
        retryLabel={spec.ctaLabel}
        onRetry={onRetry}
        homeHref="/arbaeen-nawawi"
        homeLabel="فتح الأربعين النووية"
      />
    );
  }

  /* احتياطي — عائلة EmptyStateV2 تبقى في العقد */
  return (
    <EmptyStateV2
      className={cls}
      data-hadith-empty={kind}
      title={spec.title}
      description={spec.description}
      nextStep={spec.nextStep}
      ctaLabel={spec.ctaLabel}
      href={spec.href}
    />
  );
}

/** للتوافق مع المستوردين الذين يفضّلون تسمية Empty */
export const HadithEmpty = HadithEmptyState;
