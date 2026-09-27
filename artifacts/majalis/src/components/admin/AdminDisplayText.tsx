import type { ReactNode } from "react";
import { normalizeAdminDisplayText } from "@/lib/admin-display-text";

type Props = {
  children: ReactNode;
  /** عند التمرير كنص خام (مفضّل على children النصية الملوّثة) */
  text?: unknown;
  as?: "span" | "p" | "div" | "h2" | "h3" | "label" | "td" | "th" | "li";
  className?: string;
};

/**
 * غلاف عرض إداري يفكّ تسلسلات Unicode الحرفية قبل الرسم.
 * استخدم `text` للقيم القادمة من API؛ أو children النصية.
 */
export function AdminDisplayText({
  children,
  text,
  as: Tag = "span",
  className,
}: Props) {
  const raw =
    text !== undefined
      ? text
      : typeof children === "string" || typeof children === "number"
        ? children
        : null;

  if (raw !== null) {
    return <Tag className={className}>{normalizeAdminDisplayText(raw)}</Tag>;
  }

  return <Tag className={className}>{children}</Tag>;
}
