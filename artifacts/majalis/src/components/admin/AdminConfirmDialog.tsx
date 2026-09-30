import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/design-system/FormFields";

export type AdminConfirmRequest = {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
};

type Pending = AdminConfirmRequest & { resolve: (ok: boolean) => void };

/**
 * حوار تأكيد إداري موحّد — يستبدل تأكيد المتصفح الأصلي في مسارات Admin الحية.
 * يعتمد Button الرسمي؛ أنماط adm-modal من admin.css / admin-shell.
 */
export function AdminConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "تأكيد",
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="adm-modal__overlay" role="presentation">
      <div
        className="adm-modal__dialog adm-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="adm-confirm-title"
        aria-describedby="adm-confirm-body"
      >
        <div className="adm-modal__header">
          <h2 id="adm-confirm-title" className="adm-modal__title">
            {title}
          </h2>
        </div>
        <div className="adm-modal__body">
          <p id="adm-confirm-body">{body}</p>
        </div>
        <FormActions className="adm-modal__footer">
          <Button type="button" variant="secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
            إلغاء
          </Button>
          <Button
            type="button"
            variant={danger ? "destructive" : "primary"}
            onClick={onConfirm}
            disabled={busy}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </FormActions>
      </div>
    </div>
  );
}

/** وعد تأكيد للاستخدام في معالجات الحذف/النشر داخل Admin Legacy. */
export function useAdminConfirm(): {
  confirm: (req: AdminConfirmRequest) => Promise<boolean>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback((req: AdminConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...req, resolve });
    });
  }, []);

  const dialog = pending ? (
    <AdminConfirmDialog
      open
      title={pending.title}
      body={pending.body}
      confirmLabel={pending.confirmLabel}
      danger={pending.danger}
      onConfirm={() => {
        pending.resolve(true);
        setPending(null);
      }}
      onCancel={() => {
        pending.resolve(false);
        setPending(null);
      }}
    />
  ) : null;

  return { confirm, dialog };
}
