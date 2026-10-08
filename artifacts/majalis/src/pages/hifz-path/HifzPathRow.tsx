/**
 * بطاقة/صف مسار حفظ — ContentRow للقوائم؛ زر واحد واضح.
 */
import { ListRow } from "@/design-system";
import {
  hifzCategoryLabel,
  hifzLevelLabel,
  type HifzPath,
} from "@/lib/memorization-path";

type Props = {
  path: HifzPath;
  /** نسبة تقدم حقيقية فقط؛ إن غابت لا تُعرض نسبة وهمية. */
  progressPercent?: number | null;
  /** هل للمستخدم تقدّم سابق على هذا المسار؟ */
  hasProgress?: boolean;
};

export function HifzPathRow({ path, progressPercent, hasProgress }: Props) {
  const unitsLabel =
    path.estimatedUnits > 0
      ? `${path.estimatedUnits} وحدة`
      : path.units.length > 0
        ? `${path.units.length} وحدة`
        : "وحدات قيد الاعتماد";
  const meta = [
    hifzLevelLabel(path.level),
    unitsLabel,
    hifzCategoryLabel(path.category),
  ].join(" · ");
  const cta = hasProgress ? "تابع" : "ابدأ الحفظ";
  const progressLabel =
    typeof progressPercent === "number" && Number.isFinite(progressPercent)
      ? `التقدم ${Math.max(0, Math.min(100, Math.round(progressPercent)))}%`
      : undefined;
  const sourceHint = path.sourceReference
    ? `المصدر: ${path.sourceReference}`
    : path.edition
      ? `النسخة: ${path.edition}`
      : undefined;

  return (
    <ListRow href={`/hifz-path/p/${path.slug}`} title={path.title} description={[meta, [path.shortDescription, sourceHint, progressLabel]
        .filter(Boolean)
        .join(" — ")].filter(Boolean).join(" — ")} trailing={<span className="shrink-0 whitespace-nowrap text-sm font-medium text-primary">{cta}</span>} />
  );
}
