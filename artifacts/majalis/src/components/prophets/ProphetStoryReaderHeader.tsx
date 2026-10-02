/**
 * رأس قراءة مركّز لقصص الأنبياء — رجوع موحّد + عنوان فقط.
 * يظهر فقط داخل ProphetStoryReader (مسار immersive).
 * بلا استماع ولا تكبير/تصغير خط (PR-1 إعادة التصميم).
 */
import type { ReactNode } from "react";
import { AppBackButton } from "@/components/common/AppBackButton";

type Props = {
  title: string;
  /** @deprecated يُتجاهل — الرجوع عبر AppBackButton + fallbackHref */
  onBack?: () => void;
  /** اختياري — إجراءات حقيقية فقط؛ لا تُمرَّر أدوات استماع/خط */
  actions?: ReactNode;
  fallbackHref?: string;
};

export function ProphetStoryReaderHeader({
  title,
  actions,
  fallbackHref = "/prophets",
}: Props) {
  return (
    <header
      className="prophet-reader-header"
      data-component="ProphetStoryReaderHeader"
      data-testid="prophet-reader-header"
      data-has-actions={actions ? "1" : "0"}
    >
      <AppBackButton
        variant="inline"
        fallbackHref={fallbackHref}
        className="prophet-reader-header__back mj-pressable"
        label="رجوع"
        aria-label="العودة إلى قائمة الأنبياء"
        data-testid="prophet-reader-back"
      />
      <h1 className="prophet-reader-header__title">{title}</h1>
      {actions ? <div className="prophet-reader-header__actions">{actions}</div> : null}
    </header>
  );
}
