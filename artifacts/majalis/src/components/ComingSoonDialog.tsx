import { Link } from "wouter";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
};

/** حوار احتياطي لمسار غير متاح — سلطة الشيت السفلي + زر إجراء. */
export function ComingSoonDialog({ open, title, onClose }: Props) {
  return (
    <AppBottomSheet
      open={open}
      onClose={onClose}
      title="قسم غير متاح"
      snap="auto"
      className="coming-soon-dialog"
      footer={
        <Button type="button" variant="primary" asChild>
          <Link href="/sections" onClick={onClose}>
            تصفّح دليل الأقسام
          </Link>
        </Button>
      }
    >
      <div className="coming-soon-dialog__body">
        <h2 className="coming-soon-dialog__title">{title}</h2>
        <p className="coming-soon-dialog__text">
          هذا القسم غير متاح الآن. تصفّح الأقسام من الشريط أو دليل الأقسام.
        </p>
      </div>
    </AppBottomSheet>
  );
}

export default ComingSoonDialog;
