import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "@/components/design-system/FormFields";
import { HIJRI_MONTHS } from "@/lib/hijri-utils";

export type HijriMonthSelectProps = {
  /** رقم الشهر 1..12، أو "" لخيار "كل الأشهر" */
  value: number | "";
  onChange: (value: number | "") => void;
  /** إضافة خيار "كل الأشهر" في الأعلى (مناسب للفلاتر) */
  includeAll?: boolean;
  allLabel?: string;
  /** إظهار مؤشر ★ بجانب الأشهر الحُرُم */
  markSacred?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  disabled?: boolean;
  /** تسمية مرئية اختيارية */
  label?: string;
};

/**
 * قائمة اختيار الأشهر الهجرية — مرتّبة حسب ترتيبها الصحيح (1..12) لا أبجدياً،
 * مع مؤشر للأشهر الحُرُم. مصدر موحّد للنماذج والفلاتر والجداول.
 * يستخدم Select الرسمي (لا native select).
 */
export function HijriMonthSelect({
  value,
  onChange,
  includeAll = false,
  allLabel = "كل الأشهر",
  markSacred = true,
  id,
  name,
  className,
  style,
  disabled,
  label,
  ...rest
}: HijriMonthSelectProps) {
  const strValue = value === "" ? (includeAll ? "all" : undefined) : String(value);
  const aria = rest["aria-label"] ?? "اختر الشهر الهجري";

  return (
    <div className={className} style={style}>
      {label ? (
        <FieldLabel htmlFor={id} className="mb-1.5 block">
          {label}
        </FieldLabel>
      ) : null}
      {name ? <input type="hidden" name={name} value={value === "" ? "" : String(value)} /> : null}
      <Select
        disabled={disabled}
        value={strValue}
        onValueChange={(v) => {
          onChange(v === "all" || v === "" ? "" : Number(v));
        }}
      >
        <SelectTrigger id={id} aria-label={aria} className="min-h-11 w-full">
          <SelectValue placeholder={includeAll ? allLabel : "الشهر الهجري"} />
        </SelectTrigger>
        <SelectContent>
          {includeAll ? <SelectItem value="all">{allLabel}</SelectItem> : null}
          {HIJRI_MONTHS.map((m) => (
            <SelectItem key={m.number} value={String(m.number)}>
              {markSacred && m.sacred ? `${m.name} ★` : m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default HijriMonthSelect;
