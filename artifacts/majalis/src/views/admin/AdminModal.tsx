import * as React from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";

interface AdminModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const autoId = React.useId();
  const canLink = React.Children.count(children) === 1 && React.isValidElement(children);
  const child = canLink
    ? React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: (children as React.ReactElement<{ id?: string }>).props.id ?? autoId,
      })
    : children;
  return (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={canLink ? ((children as React.ReactElement<{ id?: string }>).props.id ?? autoId) : undefined}>
        {label}
      </label>
      {child}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="adm-field-row">{children}</div>;
}

export function AdminModal({ title, open, onClose, onSave, saving, children }: AdminModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    // نقر الخلفية للإغلاق مصحوب بمعالج Escape فعلي (أعلاه) وزر إغلاق ظاهر —
    // مساران بديلان كاملان بلوحة المفاتيح.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="adm-modal__overlay" onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="adm-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal__header">
          <IconButton type="button" label="إغلاق" onClick={onClose} className="adm-modal__close" tone="muted">
            ×
          </IconButton>
          <h2 className="adm-modal__title">{title}</h2>
        </div>
        <div className="adm-modal__body">{children}</div>
        <div className="adm-modal__footer">
          <Button
            type="button"
            variant="primary"
            onClick={onSave}
            disabled={saving}
            loading={saving}
            className={`adm-modal__save${saving ? " adm-modal__save--saving" : ""}`}
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving} className="adm-modal__cancel">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
