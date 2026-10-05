import type { KeyboardEvent } from "react";

/**
 * لوحة المفاتيح لنمط WAI-ARIA Tabs (تفعيل تلقائي + roving tabIndex).
 * يُربط على كل عنصر role="tab" (يُحدَّد الـtablist الأب تلقائيًا): الأسهم تنقل بين التبويبات (اتجاه RTL مُراعى —
 * السهم الأيسر = التالي في RTL)، Home/End لأول/آخر تبويب، والتبويب المُركَّز يُفعَّل فورًا.
 * التبويبات غير النشطة تحمل tabIndex=-1 فلا يصلها Tab؛ هذا المعالج هو طريقها الوحيد.
 */
const NAV_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

export function onTablistKeyDown(e: KeyboardEvent<HTMLElement>): void {
  if (!NAV_KEYS.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
  const list = e.currentTarget.closest<HTMLElement>('[role="tablist"]');
  if (!list) return;
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
    (tab) =>
      tab.closest('[role="tablist"]') === list &&
      !tab.hasAttribute("disabled") &&
      tab.getAttribute("aria-disabled") !== "true",
  );
  const current = tabs.indexOf(document.activeElement as HTMLElement);
  if (current < 0 || tabs.length < 2) return;

  let next: number;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = tabs.length - 1;
  else {
    const rtl = getComputedStyle(list).direction === "rtl";
    const forward = (e.key === "ArrowRight") !== rtl;
    next = (current + (forward ? 1 : -1) + tabs.length) % tabs.length;
  }
  e.preventDefault();
  const target = tabs[next]!;
  target.focus();
  target.click();
}
