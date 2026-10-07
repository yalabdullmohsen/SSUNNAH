import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/** نقش هندسي خفيف في زاوية واحدة — زخرفة فقط، لا يأخذ مساحة. */
function HeroPattern() {
  return (
    <svg className="sn-hero__pattern" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="20" y="20" width="60" height="60" />
        <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="22" />
      </g>
    </svg>
  );
}

/**
 * بطاقة خضراء نحيفة: وسم القسم + عنوان + وصف (سطران كحدّ أقصى).
 * بلا زر رجوع ولا إطار. إن كان NavigationBar يعرض العنوان نفسه فمرّر `title` بلا تكرار (لا تعرض الاثنين).
 */
export function PageHero({ tag, title, description, className }: { tag?: string; title: string; description?: string; className?: string }) {
  return (
    <section className={cn("sn-hero", className)} aria-label={title}>
      <HeroPattern />
      {tag ? <span className="sn-hero__tag">{tag}</span> : null}
      <h1 className="sn-hero__title">{title}</h1>
      {description ? <p className="sn-hero__desc">{description}</p> : null}
    </section>
  );
}

/** بطاقة إحصاء: رقم كبير + تسمية صغيرة. `value` نص جاهز من formatNumber (لا أرقام خام). */
export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="sn-stat" role="group" aria-label={`${label}: ${value}`}>
      <span className="sn-stat__value">{value}</span>
      <span className="sn-stat__label">{label}</span>
    </div>
  );
}

/** شبكة 2×2 لبطاقات الإحصاء. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("sn-stat-grid", className)}>{children}</div>;
}

/** تبويبات أفقية قابلة للتمرير، نص كل تبويب في سطر واحد. */
export function SegmentedTabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: ReadonlyArray<{ value: T; label: string }>; label: string }) {
  return (
    <div className="sn-seg-tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className="sn-seg-tabs__item sn-pressable" onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** قائمة اختيار بشكل Card (select أصلي لدعم VoiceOver ولوحة الاختيار الأصلية). */
export function Picker<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: ReadonlyArray<{ value: T; label: string }>; label: string }) {
  return (
    <label className="sn-picker">
      <span className="sn-picker__label" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
      <select className="sn-picker__select" value={value} onChange={(e) => onChange(e.target.value as T)} aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Icon name="chevron" size={20} className="sn-picker__chev" />
    </label>
  );
}
