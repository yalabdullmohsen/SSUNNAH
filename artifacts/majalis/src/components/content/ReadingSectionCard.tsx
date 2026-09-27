import { useId, useState, type ReactNode, type ToggleEvent } from "react";
import "@/styles/components/reading-section-card.css";
import "@/styles/knowledge-experience.css";

export type ReadingSectionVariant =
  | "default"
  | "summary"
  | "definition"
  | "evidence"
  | "quote"
  | "faq"
  | "lessons"
  | "sources"
  | "related"
  | "warning"
  | "outcomes"
  | "notes"
  | "timeline"
  | "concepts"
  | "ruling";

type ReadingSectionCardProps = {
  title: string;
  children: ReactNode;
  variant?: ReadingSectionVariant;
  className?: string;
  as?: "section" | "div";
  /** أقسام التفاصيل الطويلة — أكورديون مع حالة فتح/إغلاق ظاهرة */
  collapsible?: boolean;
  defaultOpen?: boolean;
};

/**
 * بطاقة قسم قراءة — إطار هادئ للنصوص الطويلة دون تغيير المحتوى.
 */
export function ReadingSectionCard({
  title,
  children,
  variant = "default",
  className = "",
  as: Tag = "section",
  collapsible = false,
  defaultOpen = false,
}: ReadingSectionCardProps) {
  const uid = useId();
  const titleId = `rsc-title-${uid.replace(/:/g, "")}`;
  const [open, setOpen] = useState(defaultOpen);
  const classes = `rsc soft-card soft-card--on-light rsc--${variant}${
    collapsible ? " rsc--accordion" : ""
  }${className ? ` ${className}` : ""}`;

  if (collapsible) {
    return (
      <details
        className={classes}
        data-kx-block={variant}
        data-rsc-accordion="1"
        open={open}
        onToggle={(event: ToggleEvent<HTMLDetailsElement>) => {
          setOpen(event.currentTarget.open);
        }}
      >
        <summary id={titleId} className="rsc__title rsc__summary">
          {title}
        </summary>
        <div className="rsc__body">{children}</div>
      </details>
    );
  }

  return (
    <Tag
      className={classes}
      data-kx-block={variant}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="rsc__title">
        {title}
      </h2>
      <div className="rsc__body">{children}</div>
    </Tag>
  );
}

type ReadingProseProps = {
  text: string;
  className?: string;
};

/** فقرة/نص طويل مع الحفاظ على فواصل الأسطر في البيانات. */
export function ReadingProse({ text, className = "" }: ReadingProseProps) {
  return (
    <p className={`rsc__prose${className ? ` ${className}` : ""}`}>{text}</p>
  );
}

type ReadingBulletListProps = {
  items: string[];
  className?: string;
};

export function ReadingBulletList({ items, className = "" }: ReadingBulletListProps) {
  if (!items.length) return null;
  return (
    <ul className={`rsc-list${className ? ` ${className}` : ""}`}>
      {items.map((item) => (
        <li key={item} className="rsc-list__item">
          {item}
        </li>
      ))}
    </ul>
  );
}
