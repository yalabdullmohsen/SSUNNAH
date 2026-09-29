import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  buildFaidaShareText,
  copyShareText,
  nativeShareFaida,
  resolveShareUrl,
  whatsappShareUrl,
} from "@/lib/share-faida";
import { openExternalUrl } from "@/lib/capacitor-utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";
import "@/styles/components/share-faida.css";

type Props = {
  title: string;
  url?: string;
  className?: string;
  /** default: بطاقة كاملة — icons: نسخ + مشاركة بأيقونات فقط */
  variant?: "default" | "icons";
};

/**
 * زر مشاركة موحّد — Web Share API · واتساب · نسخ.
 */
export function ShareFaida({ title, url, className = "", variant = "default" }: Props) {
  const shareUrl = useMemo(() => resolveShareUrl(url), [url]);
  const shareText = useMemo(() => buildFaidaShareText(title, shareUrl), [title, shareUrl]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleNative = async () => {
    setBusy(true);
    try {
      const result = await nativeShareFaida(title, shareUrl);
      if (result === "copied") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyShareText(shareText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    void openExternalUrl(whatsappShareUrl(shareText));
  };

  if (variant === "icons") {
    return (
      <div className={`share-faida share-faida--icons ${className}`.trim()} dir="rtl">
        <IconButton
          label={copied ? "تم النسخ" : "نسخ"}
          className="share-faida__icon-btn"
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={15} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <Copy size={15} strokeWidth={2} aria-hidden="true" />
          )}
        </IconButton>
        <IconButton
          label="مشاركة"
          className="share-faida__icon-btn share-faida__icon-btn--primary"
          onClick={handleNative}
          disabled={busy}
          loading={busy}
        >
          <Share2 size={15} strokeWidth={2} aria-hidden="true" />
        </IconButton>
      </div>
    );
  }

  return (
    <div className={`share-faida ${className}`.trim()} dir="rtl">
      <p className="share-faida__label">شارك الفائدة</p>
      <div className="share-faida__actions">
        <Button
          type="button"
          variant="primary"
          size="small"
          className="share-faida__btn share-faida__btn--primary"
          onClick={handleNative}
          disabled={busy}
          loading={busy}
          aria-label="مشاركة الصفحة"
          iconStart={<Share2 size={16} strokeWidth={2} aria-hidden="true" />}
        >
          مشاركة
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          className="share-faida__btn"
          onClick={handleWhatsApp}
          aria-label="مشاركة عبر واتساب"
        >
          واتساب
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="small"
          className="share-faida__btn"
          onClick={handleCopy}
          aria-label={copied ? "تم النسخ" : "نسخ"}
          iconStart={
            copied ? (
              <Check size={15} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <Copy size={15} strokeWidth={2} aria-hidden="true" />
            )
          }
        >
          {copied ? "تم" : "نسخ"}
        </Button>
      </div>
    </div>
  );
}
