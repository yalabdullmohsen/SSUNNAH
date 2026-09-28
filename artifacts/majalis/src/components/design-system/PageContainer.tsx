/**
 * حاوية صفحة عامة — عرض محتوى موحّد + خلوص الشريط السفلي ومناطق الأمان.
 * لا تُفرض على المصحف (immersive) ولا Admin v3.
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/page-container.css";

export type PageContainerWidth = "narrow" | "default" | "wide" | "full";

export type PageContainerProps = HTMLAttributes<HTMLElement> & {
  width?: PageContainerWidth;
  /** إزاحة لشريط التنقل السفلي */
  withBottomNavClearance?: boolean;
  as?: "main" | "div" | "section";
  children?: ReactNode;
};

const WIDTH_CLASS: Record<PageContainerWidth, string> = {
  narrow: "ss-page-container--narrow",
  default: "ss-page-container--default",
  wide: "ss-page-container--wide",
  full: "ss-page-container--full",
};

export function PageContainer({
  width = "default",
  withBottomNavClearance = true,
  as: Tag = "main",
  className,
  children,
  ...rest
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        "ss-page-container",
        WIDTH_CLASS[width],
        withBottomNavClearance && "ss-page-container--bottom-nav",
        className,
      )}
      data-ss-page-container=""
      data-width={width}
      dir="rtl"
      {...rest}
    >
      {children}
    </Tag>
  );
}
