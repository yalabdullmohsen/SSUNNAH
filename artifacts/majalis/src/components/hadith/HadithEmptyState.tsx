import { EmptyStateV2 } from "@/components/design-system";

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
    nextStep: "تصفّح الصحيحين المتاحين محليًا، أو افتح الأربعين النووية.",
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
 * حالة فارغة موحّدة لقسم الحديث — عنوان + شرح + خطوة تالية + إجراء واحد مفيد.
 */
export function HadithEmptyState({
  kind,
  onClearFilters,
  onRetry,
  className = "",
}: HadithEmptyStateProps) {
  const spec = SPECS[kind];

  let href = spec.href;
  let onCtaClick: (() => void) | undefined;
  let ctaLabel = spec.ctaLabel;

  if (spec.useClear && onClearFilters) {
    onCtaClick = onClearFilters;
    href = undefined;
  } else if (spec.useRetry && onRetry) {
    onCtaClick = onRetry;
    href = undefined;
  } else if (spec.useClear && !onClearFilters) {
    href = "/hadith/sahih";
    ctaLabel = "عرض أحاديث البخاري";
  } else if (spec.useRetry && !onRetry) {
    href = "/arbaeen-nawawi";
    ctaLabel = "فتح الأربعين النووية";
  }

  // مسار بديل ثانوي عبر nextStep إن كان الإجراء مسح فلاتر
  const nextStep =
    kind === "network_required" || kind === "unavailable_locally"
      ? `${spec.nextStep} · أو: فتح الأربعين النووية (/arbaeen-nawawi)`
      : spec.nextStep;

  return (
    <EmptyStateV2
      className={`hadith-empty-state${className ? ` ${className}` : ""}`}
      data-hadith-empty={kind}
      title={spec.title}
      description={spec.description}
      nextStep={nextStep}
      ctaLabel={ctaLabel}
      href={href}
      onCtaClick={onCtaClick}
    />
  );
}

/** اختصارات إجراءات شائعة لربط الواجهة */
export const HADITH_EMPTY_ACTIONS = {
  clearFilters: "مسح عوامل التصفية",
  bukhari: "عرض أحاديث البخاري",
  muslim: "عرض أحاديث مسلم",
  arbaeen: "فتح الأربعين النووية",
  retry: "إعادة المحاولة",
} as const;
