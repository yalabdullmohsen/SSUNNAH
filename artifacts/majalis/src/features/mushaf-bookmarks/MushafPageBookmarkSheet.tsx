import { memo, useCallback, useMemo, useState } from "react";
import {
  MUSHAF_PRODUCT_BOOKMARK_KINDS,
  type MushafBookmarkProductKind,
} from "@/lib/quran-bookmark-kinds";
import { addTypedBookmark, setReadingBookmark } from "@/lib/quran-my-bookmarks-ops";
import { currentPageFirstAyah } from "@/lib/quran-ayah-page";
import { getSurahMeta } from "@/lib/quran-api";
import { toArabicIndicDigits as toArabicDigits } from "@/lib/numerals";
import { haptics } from "@/lib/haptics";
import { parseVerseKey } from "@/features/mushaf-madinah/mushaf-page-for-ayah";

type Props = {
  page: number;
  /** أول آية ظاهرة — إن وُجدت */
  ayahKey?: string | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

/**
 * ورقة حفظ علامة الصفحة — أربعة أنواع منتج، بلا تغطية لنص المصحف.
 */
export const MushafPageBookmarkSheet = memo(function MushafPageBookmarkSheet({
  page,
  ayahKey,
  onClose,
  onSaved,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [hifzRange, setHifzRange] = useState(false);
  const [fromPage, setFromPage] = useState(String(page));
  const [toPage, setToPage] = useState(String(page));

  const key = ayahKey && /^\d{1,3}:\d{1,3}$/.test(ayahKey) ? ayahKey : currentPageFirstAyah(page);
  const parsed = parseVerseKey(key);
  const surahName = useMemo(() => {
    if (!parsed) return "";
    return getSurahMeta(parsed.surah).name.replace(/^سُورَةُ\s*/u, "");
  }, [parsed]);

  const saveKind = useCallback(
    async (kind: MushafBookmarkProductKind) => {
      if (busy) return;
      setBusy(true);
      setError(null);
      let result: Awaited<ReturnType<typeof addTypedBookmark>>;
      if (kind === "reading") {
        result = await setReadingBookmark(page, key);
      } else if (kind === "hifz" && hifzRange) {
        const from = Math.min(604, Math.max(1, Number(fromPage) || page));
        const to = Math.min(604, Math.max(1, Number(toPage) || page));
        result = await addTypedBookmark({
          page,
          ayahKey: key,
          kind: "hifz",
          label: `حفظ · ص ${from}–${to}`,
          rangeFromPage: from,
          rangeToPage: to,
        });
      } else if (kind === "custom") {
        result = await addTypedBookmark({
          page,
          ayahKey: key,
          kind: "custom",
          customName: customName.trim() || "صفحة مميزة",
          label: customName.trim() || "صفحة مميزة",
        });
      } else {
        result = await addTypedBookmark({ page, ayahKey: key, kind });
      }
      setBusy(false);
      if (!result.ok) {
        haptics.error();
        setError(result.error);
        return;
      }
      haptics.success();
      onSaved?.(kind === "reading" ? "تم حفظ موضع القراءة" : "تم حفظ العلامة");
      onClose();
    },
    [busy, page, key, hifzRange, fromPage, toPage, customName, onClose, onSaved],
  );

  return (
    <div
      className="rb-page-sheet"
      data-testid="mushaf-page-bookmark-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="حفظ علامة في المصحف"
    >
      <div className="rb-page-sheet__head">
        <button type="button" className="rb-page-sheet__close" onClick={onClose} aria-label="إغلاق">
          إغلاق
        </button>
        <div>
          <p className="rb-page-sheet__eyebrow">علامة مصحف</p>
          <strong>
            الصفحة {toArabicDigits(page)}
            {surahName ? ` · ${surahName}` : ""}
          </strong>
        </div>
      </div>

      <div className="rb-page-sheet__actions" role="group" aria-label="نوع العلامة">
        {MUSHAF_PRODUCT_BOOKMARK_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            className="rb-page-sheet__action"
            style={{ ["--rb-kind" as string]: k.color }}
            disabled={busy}
            aria-label={k.actionLabel}
            onClick={() => {
              const productKind = k.id as MushafBookmarkProductKind;
              if (productKind === "custom") {
                setCustomOpen(true);
                return;
              }
              if (productKind === "hifz") {
                setHifzRange(true);
                return;
              }
              void saveKind(productKind);
            }}
          >
            <span className="rb-page-sheet__dot" aria-hidden="true" />
            {k.actionLabel}
          </button>
        ))}
      </div>

      {hifzRange ? (
        <div className="rb-page-sheet__range" aria-label="نطاق الحفظ">
          <p>حفظ من صفحة إلى صفحة</p>
          <div className="rb-page-sheet__range-row">
            <label>
              من
              <input
                inputMode="numeric"
                value={fromPage}
                onChange={(e) => setFromPage(e.target.value)}
                aria-label="من صفحة"
              />
            </label>
            <label>
              إلى
              <input
                inputMode="numeric"
                value={toPage}
                onChange={(e) => setToPage(e.target.value)}
                aria-label="إلى صفحة"
              />
            </label>
          </div>
          <button
            type="button"
            className="rb-page-sheet__confirm"
            disabled={busy}
            onClick={() => void saveKind("hifz")}
          >
            تأكيد علامة الحفظ
          </button>
        </div>
      ) : null}

      {customOpen ? (
        <div className="rb-page-sheet__custom">
          <input
            dir="rtl"
            maxLength={48}
            placeholder="مثال: صفحة أحب العودة إليها"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            aria-label="اسم العلامة المخصصة"
          />
          <button
            type="button"
            className="rb-page-sheet__confirm"
            disabled={busy}
            onClick={() => void saveKind("custom")}
          >
            حفظ العلامة المخصصة
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rb-page-sheet__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
