import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "@/components/ThemePreferenceProvider";
import { IconButton } from "@/components/design-system/Buttons";

/** زر وضع نهاري/ليلي لترويسة شيت المزيد (خارج أسطح التنقّل المحظورة). */
export function MoreSheetThemeToggle() {
  const { resolvedTheme, toggleDark } = useThemePreference();
  const isDark = resolvedTheme === "dark";
  const label = isDark
    ? "الوضع الحالي: ليلي — التحويل إلى النهاري"
    : "الوضع الحالي: نهاري — التحويل إلى الليلي";

  return (
    <IconButton
      type="button"
      className="more-sheet-theme-btn"
      onClick={toggleDark}
      label={label}
      aria-pressed={isDark}
      data-theme-toggle="1"
      tone="muted"
    >
      {isDark ? (
        <Moon size={18} strokeWidth={1.75} aria-hidden />
      ) : (
        <Sun size={18} strokeWidth={1.75} aria-hidden />
      )}
    </IconButton>
  );
}
