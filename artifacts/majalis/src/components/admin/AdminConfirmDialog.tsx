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

export type AdminAlertRequest = string | { title?: string; body: string };

type AlertPending = { title: string; body: string; resolve: () => void };

/** تنبيه إداري — يستبدل window.alert في مسارات Admin الحية. */
export function useAdminAlert(): {
  alert: (req: AdminAlertRequest) => Promise<void>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<AlertPending | null>(null);
  const okRef = useRef<HTMLButtonElement>(null);

  const alert = useCallback((req: AdminAlertRequest) => {
    const title = typeof req === "string" ? "تنبيه" : req.title || "تنبيه";
    const body = typeof req === "string" ? req : req.body;
    return new Promise<void>((resolve) => {
      setPending({ title, body, resolve });
    });
  }, []);

  useEffect(() => {
    if (!pending) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        pending.resolve();
        setPending(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending]);

  const dialog = pending ? (
    <div className="adm-modal__overlay" role="presentation">
      <div
        className="adm-modal__dialog adm-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="adm-alert-title"
        aria-describedby="adm-alert-body"
      >
        <div className="adm-modal__header">
          <h2 id="adm-alert-title" className="adm-modal__title">
            {pending.title}
          </h2>
        </div>
        <div className="adm-modal__body">
          <p id="adm-alert-body">{pending.body}</p>
        </div>
        <FormActions className="adm-modal__footer">
          <Button
            type="button"
            variant="primary"
            ref={okRef}
            onClick={() => {
              pending.resolve();
              setPending(null);
            }}
          >
            حسناً
          </Button>
        </FormActions>
      </div>
    </div>
  ) : null;

  return { alert, dialog };
}

export type AdminPromptRequest = {
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  required?: boolean;
};

type PromptPending = AdminPromptRequest & { resolve: (value: string | null) => void };

/** نموذج إدخال إداري — يستبدل window.prompt في مسارات Admin الحية. */
export function useAdminPrompt(): {
  prompt: (req: AdminPromptRequest) => Promise<string | null>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<PromptPending | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompt = useCallback((req: AdminPromptRequest) => {
    setValue(req.defaultValue || "");
    setBusy(false);
    return new Promise<string | null>((resolve) => {
      setPending({ ...req, resolve });
    });
  }, []);

  useEffect(() => {
    if (!pending) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) {
        pending.resolve(null);
        setPending(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, busy]);

  const close = (result: string | null) => {
    if (!pending) return;
    pending.resolve(result);
    setPending(null);
    setBusy(false);
  };

  const submit = () => {
    if (!pending || busy) return;
    const trimmed = value.trim();
    if (pending.required !== false && !trimmed) return;
    setBusy(true);
    close(trimmed || "");
  };

  const dialog = pending ? (
    <div className="adm-modal__overlay" role="presentation">
      <div
        className="adm-modal__dialog adm-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-prompt-title"
      >
        <div className="adm-modal__header">
          <h2 id="adm-prompt-title" className="adm-modal__title">
            {pending.title}
          </h2>
        </div>
        <form
          className="adm-modal__body"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="av3-field" htmlFor="adm-prompt-input">
            <span className="av3-field__label">{pending.label || "القيمة"}</span>
            <input
              ref={inputRef}
              id="adm-prompt-input"
              className="adm-input"
              value={value}
              placeholder={pending.placeholder || ""}
              onChange={(e) => setValue(e.target.value)}
              required={pending.required !== false}
            />
          </label>
          <FormActions className="adm-modal__footer">
            <Button type="button" variant="secondary" onClick={() => close(null)} disabled={busy}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" loading={busy}>
              {pending.confirmLabel || "تأكيد"}
            </Button>
          </FormActions>
        </form>
      </div>
    </div>
  ) : null;

  return { prompt, dialog };
}
