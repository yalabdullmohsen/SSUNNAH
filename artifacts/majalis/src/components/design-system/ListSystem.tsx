import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ContentRow } from "@/components/design-system/IdentitySurfaces";
import { SettingsList } from "@/components/design-system/SettingsList";
import { VirtualList, type VirtualListProps } from "@/components/VirtualList";

/**
 * List authorities — thin façades over existing surfaces.
 * See docs/design/LIST_AUTHORITY_MAP.md
 */

type ListShellProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/** قائمة بسيطة — صفوف قراءة عبر ContentRow (أو أبناء متوافقة). */
export function SimpleList({ children, className, "aria-label": label }: ListShellProps) {
  return (
    <ul className={cn("ss-list ss-list--simple", className)} aria-label={label}>
      {children}
    </ul>
  );
}

/** قائمة تفاعلية — نفس الهيكل مع صفوف قابلة للتفعيل. */
export function InteractiveList({ children, className, "aria-label": label }: ListShellProps) {
  return (
    <ul className={cn("ss-list ss-list--interactive", className)} aria-label={label}>
      {children}
    </ul>
  );
}

/** قائمة تنقّل — SettingsList أو غلاف صفوف رابط. */
export function NavigationList(props: ComponentProps<typeof SettingsList>) {
  return <SettingsList {...props} className={cn("ss-list ss-list--nav", props.className)} />;
}

/** قائمة نتائج طويلة — VirtualList. */
export function ResultList<T>(props: VirtualListProps<T>) {
  return <VirtualList {...props} />;
}

export { ContentRow, SettingsList, VirtualList };
