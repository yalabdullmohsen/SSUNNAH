/**
 * زر الرجوع العائم أُلغي: الرجوع الوحيد هو NavigationBar (AppTopBar) في `design-system/shell`.
 * يبقى الملف لإعادة تصدير AppBackButton (للشاشات بلا شريط علوي: المصحف/المواقيت/الدخول) فقط.
 */
export { AppBackButton } from "@/components/common/AppBackButton";

export const FLOATING_BACK_DISABLED = true as const;
