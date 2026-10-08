/**
 * غلاف موحّد لقسم التعريف بالإسلام — hub والقوائم والتفاصيل.
 */
import type { ReactNode } from "react";
import { NavigationBar } from "@/design-system";
import "@/styles/discover-islam.css";

type Props = {
  children: ReactNode;
  /** صفحة قراءة داخلية (تفاصيل سؤال/شبهة/مقال…) */
  detail?: boolean;
  className?: string;
};

export function DiscoverIslamShell({ children, detail = false, className }: Props) {
  const classes = [
    "page-shell",
    "narrow",
    "content-hub-page",
    "dii-page",
    detail ? "dii-page--detail" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="sn-screen">
    <NavigationBar title="التعريف بالإسلام" large={false} />
      <div className={classes}>{children}</div>
    </div>
  );
}
