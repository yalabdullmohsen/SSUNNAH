import { memo, useCallback, useMemo, useState } from "react";
import {
  MUSHAF_KHATMAH_TYPES,
  MUSHAF_PRODUCT_BOOKMARK_KINDS,
  type MushafBookmarkProductKind,
  type MushafKhatmahType,
} from "@/lib/quran-bookmark-kinds";
import {
  addTypedBookmark,
  setReadingBookmark,
  startKhatmah,
} from "@/lib/quran-my-bookmarks-ops";
import { currentPageFirstAyah } from "@/lib/quran-ayah-page";
import { getSurahMeta } from "@/lib/quran-api";
import { toArabicIndicDigits as toArabicDigits } from "@/lib/numerals";
import { haptics } from "@/lib/haptics";
import { parseVerseKey } from "@/features/mushaf-madinah/mushaf-page-for-ayah";
import { MushafBookmarkEditorShell } from "./MushafBookmarkEditorShell";

import { Button } from "@/components/ui/button";
type Props = {
  page: number;
  /** أول آية ظاهرة — إن وُجدت */
  ayahKey?: string | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

type DetailKind = "hifz" | "review" | "custom" | "khatmah";

/**
 * ورقة حفظ علامة الصفحة — Portal مرتبط بالـviewport.
 */
export const MushafPageBookmarkSheet = memo(function MushafPageBookmarkSheet({
  page,
  ayahKey,
  onClose,
  onSaved,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailKind | null>(null);
  const [customName, setCustomName] = useState("");
  const [note, setNote] = useState("");
  const [fromPage, setFromPage] = useState(String(page));
  const [toPage, setToPage] = useState(String(page));
  const [khatmaType, setKhatmaType] = useState<MushafKhatmahType>("general");

  const key = ayahKey && /^\d{1,3}:\d{1,3}$/.test(ayahKey) ? ayahKey : currentPageFirstAyah(page);
  const parsed = parseVerseKey(key);
  const surahName = useMemo(() => {
    if (!parsed) return "";
    return getSurahMeta(parsed.surah).name.replace(/^سُورَةُ\s*/u, "");
  }, [parsed]);

  const subtitle = `الصفحة ${toArabicDigits(page)}${surahName ? ` · ${surahName}` : ""}`;

  const finishOk = useCallback(
    (message: string) => {
      haptics.success();
      onSaved?.(message);
      onClose();
    },
    [onClose, onSaved],
  );

  const saveReading = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await setReadingBookmark(page, key);
    setBusy(false);
    if (!result.ok) {
      haptics.error();
      setError(result.error);
      return;
    }
    finishOk("تم حفظ موضع القراءة");
  }, [busy, page, key, finishOk]);

  const saveDetail = useCallback(async () => {
    if (busy || !detail) return;
    setBusy(true);
    setError(null);
    const from = Math.min(604, Math.max(1, Number(fromPage) || page));
    const to = Math.min(604, Math.max(1, Number(toPage) || page));
    const noteTrim = note.trim() || undefined;
    let result: Awaited<ReturnType<typeof addTypedBookmark>>;

    if (detail === "khatmah") {
      result = await startKhatmah(page, khatmaType, noteTrim);
    } else if (detail === "hifz") {
      result = await addTypedBookmark({
        page,
        ayahKey: key,
        kind: "hifz",
        label: `حفظ · ص ${from}–${to}`,
        note: noteTrim,
        rangeFromPage: from,
        rangeToPage: to,
      });
    } else if (detail === "review") {
      result = await addTypedBookmark({
        page,
        ayahKey: key,
        kind: "review",
        label: `مراجعة · ص ${from} → ${to}`,
        note: noteTrim,
        rangeFromPage: from,
        rangeToPage: to,
      });
    } else {
      result = await addTypedBookmark({
        page,
        ayahKey: key,
        kind: "custom",
        customName: customName.trim() || "صفحة مميزة",
        label: customName.trim() || "صفحة مميزة",
        note: noteTrim,
      });
    }

    setBusy(false);
    if (!result.ok) {
      haptics.error();
      setError(result.error);
      return;
    }
    finishOk(
      detail === "khatmah"
        ? "تم بدء الختمة"
        : detail === "hifz"
          ? "تم حفظ علامة الحفظ"
          : detail === "review"
            ? "تم حفظ علامة المراجعة"
            : "تم حفظ العلامة الشخصية",
    );
  }, [
    busy,
    detail,
    fromPage,
    toPage,
    page,
    key,
    note,
    khatmaType,
    customName,
    finishOk,
  ]);

  return (
    <MushafBookmarkEditorShell
      title="إضافة علامة"
      subtitle={subtitle}
      ariaLabel="حفظ علامة في المصحف"
      testId="mushaf-page-bookmark-sheet"
      onClose={onClose}
      footer={
        detail ? (
          <>
            <Button
              type="button"
              className="rb-page-sheet__ghost rb-editor-shell__secondary"
              disabled={busy}
              onClick={() => setDetail(null)}
            >
              رجوع
            </Button>
            <Button
              type="button"
              className="rb-page-sheet__confirm rb-editor-shell__primary"
              disabled={busy}
              onClick={() => void saveDetail()}
            >
              {busy ? "جاري الحفظ…" : "حفظ"}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            className="rb-page-sheet__ghost rb-editor-shell__secondary"
            disabled={busy}
            onClick={onClose}
          >
            إلغاء
          </Button>
        )
      }
    >
      <div className="rb-page-sheet" data-rb-page-sheet="1">
        {!detail ? (
          <div className="rb-page-sheet__actions" role="group" aria-label="نوع العلامة">
            {MUSHAF_PRODUCT_BOOKMARK_KINDS.map((k) => (
              <Button
                key={k.id}
                type="button"
                className="rb-page-sheet__action"
                style={{ ["--rb-kind" as string]: k.color }}
                disabled={busy}
                aria-label={k.actionLabel}
                onClick={() => {
                  const productKind = k.id as MushafBookmarkProductKind;
                  if (productKind === "reading") {
                    void saveReading();
                    return;
                  }
                  setDetail(productKind);
                  setFromPage(String(page));
                  setToPage(String(page));
                }}
              >
                <span className="rb-page-sheet__dot" aria-hidden="true" />
                {k.actionLabel}
              </Button>
            ))}
          </div>
        ) : (
          <div className="rb-page-sheet__range" aria-label="تفاصيل العلامة">
            {detail === "hifz" ? (
              <>
                <p>بداية الحفظ · الموضع الحالي · الهدف القادم</p>
                <div className="rb-page-sheet__range-row">
                  <label>
                    من
                    <input
                      inputMode="numeric"
                      value={fromPage}
                      onChange={(e) => setFromPage(e.target.value)}
                      aria-label="بداية الحفظ"
                    />
                  </label>
                  <label>
                    الهدف
                    <input
                      inputMode="numeric"
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                      aria-label="هدف الحفظ"
                    />
                  </label>
                </div>
                <p className="rb-page-sheet__hint">الموضع الحالي: ص {toArabicDigits(page)}</p>
              </>
            ) : null}

            {detail === "review" ? (
              <>
                <p>نطاق المراجعة</p>
                <div className="rb-page-sheet__range-row">
                  <label>
                    من
                    <input
                      inputMode="numeric"
                      value={fromPage}
                      onChange={(e) => setFromPage(e.target.value)}
                      aria-label="بداية المراجعة"
                    />
                  </label>
                  <label>
                    إلى
                    <input
                      inputMode="numeric"
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                      aria-label="نهاية المراجعة"
                    />
                  </label>
                </div>
              </>
            ) : null}

            {detail === "khatmah" ? (
              <div className="rb-page-sheet__khatmah" role="group" aria-label="نوع الختمة">
                {MUSHAF_KHATMAH_TYPES.map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    className={`rb-page-sheet__chip${khatmaType === t.id ? " is-active" : ""}`}
                    aria-pressed={khatmaType === t.id}
                    onClick={() => setKhatmaType(t.id)}
                  >
                    {t.label}
                  </Button>
                ))}
                <p className="rb-page-sheet__hint">تتبع التقدم على ٦٠٤ صفحة</p>
              </div>
            ) : null}

            {detail === "custom" ? (
              <input
                dir="rtl"
                maxLength={48}
                placeholder="مثال: صفحة أحب العودة إليها"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                aria-label="اسم العلامة الشخصية"
              />
            ) : null}

            <label className="rb-page-sheet__note">
              <span>ملاحظة اختيارية</span>
              <input
                dir="rtl"
                maxLength={240}
                placeholder={
                  detail === "hifz"
                    ? "هنا بداية الحفظ"
                    : detail === "review"
                      ? "مراجعة الأسبوع القادم"
                      : "ملاحظة قصيرة"
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label="ملاحظة اختيارية"
              />
            </label>
          </div>
        )}

        {error ? (
          <p className="rb-page-sheet__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </MushafBookmarkEditorShell>
  );
});
