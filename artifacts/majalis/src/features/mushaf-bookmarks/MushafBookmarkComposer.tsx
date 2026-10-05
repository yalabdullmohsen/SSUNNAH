import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  getBookmarkKindMeta,
  MUSHAF_KHATMAH_TYPES,
  MUSHAF_PRODUCT_BOOKMARK_KINDS,
  kindSupportsPageRange,
  type MushafBookmarkKind,
  type MushafKhatmahType,
} from "@/lib/quran-bookmark-kinds";
import { addTypedBookmark } from "@/lib/quran-my-bookmarks-ops";
import { haptics } from "@/lib/haptics";
import { getSurahMeta } from "@/lib/quran-api";
import { toArabicIndicDigits as toArabicDigits } from "@/lib/numerals";
import { parseVerseKey } from "@/features/mushaf-shared/mushaf-page-for-ayah";
import { MushafBookmarkEditorShell } from "./MushafBookmarkEditorShell";

import { Button } from "@/components/ui/button";
type Props = {
  verseKey: string;
  page: number;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

const CUSTOM_SWATCHES = ["#5c564c", "#3d6a96", "#2f6b4f", "#b06a32", "#5c4f7a", "#9a7a2e"] as const;

/**
 * Composer فاصل متقدم — Portal مرتبط بالـviewport (لا داخل حاوية صفحة المصحف).
 */
export const MushafBookmarkComposer = memo(function MushafBookmarkComposer({
  verseKey,
  page,
  onClose,
  onSaved,
}: Props) {
  const [kind, setKind] = useState<MushafBookmarkKind>("reading");
  const [note, setNote] = useState("");
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState<string>(CUSTOM_SWATCHES[0]!);
  const [rangeFrom, setRangeFrom] = useState(String(page));
  const [rangeTo, setRangeTo] = useState(String(page));
  const [khatmaType, setKhatmaType] = useState<MushafKhatmahType>("general");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  const parsed = parseVerseKey(verseKey);
  const heading = useMemo(() => {
    if (!parsed) return verseKey;
    return `${getSurahMeta(parsed.surah).name} · آية ${toArabicDigits(parsed.ayah)}`;
  }, [parsed, verseKey]);

  const save = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const meta = getBookmarkKindMeta(kind);
      const from = Number(rangeFrom) || page;
      const to = Number(rangeTo) || page;
      const result = await addTypedBookmark({
        ayahKey: verseKey,
        page,
        kind,
        label:
          kind === "reading"
            ? "آخر موضع قراءة"
            : kind === "khatmah"
              ? undefined
              : kind === "custom" && customName.trim()
                ? customName.trim()
                : kind === "hifz"
                  ? `حفظ · ص ${from}–${to}`
                  : kind === "review"
                    ? `مراجعة · ص ${from} → ${to}`
                    : `${meta.label} · ${heading}`,
        note: note.trim() || undefined,
        customName: kind === "custom" ? customName.trim() || undefined : undefined,
        customColor: kind === "custom" ? customColor : undefined,
        khatmaType: kind === "khatmah" ? khatmaType : undefined,
        rangeFromPage: kindSupportsPageRange(kind)
          ? kind === "khatmah"
            ? 1
            : from
          : undefined,
        rangeToPage: kindSupportsPageRange(kind)
          ? kind === "khatmah"
            ? 604
            : to
          : undefined,
      });
      if (!result.ok) {
        haptics.error();
        setError(result.error || "تعذّر الحفظ. بقيت ملاحظتك كما هي.");
        return;
      }
      haptics.success();
      onSaved?.(kind === "reading" ? "تم حفظ موضع القراءة" : "تم حفظ العلامة");
      onClose();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [
    verseKey,
    page,
    kind,
    note,
    customName,
    customColor,
    rangeFrom,
    rangeTo,
    khatmaType,
    heading,
    onClose,
    onSaved,
  ]);

  return (
    <MushafBookmarkEditorShell
      title="إضافة فاصل"
      subtitle={heading}
      ariaLabel="إضافة فاصل"
      testId="mushaf-bookmark-composer"
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            className="rb-composer__cancel rb-editor-shell__secondary"
            disabled={busy}
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="rb-composer__save rb-editor-shell__primary"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void save()}
          >
            {busy ? "جاري الحفظ…" : "حفظ الفاصل"}
          </Button>
        </>
      }
    >
      <div className="rb-composer" data-rb-composer="1">
        <div className="rb-composer__kinds" role="listbox" aria-label="نوع العلامة">
          {MUSHAF_PRODUCT_BOOKMARK_KINDS.map((k) => (
            <Button
              key={k.id}
              type="button"
              role="option"
              aria-selected={kind === k.id}
              className={`rb-composer__kind${kind === k.id ? " is-active" : ""}`}
              style={{ ["--rb-kind" as string]: k.color }}
              onClick={() => setKind(k.id)}
            >
              <span className="rb-composer__kind-dot" aria-hidden="true" />
              {k.actionLabel}
            </Button>
          ))}
        </div>

        {kind === "hifz" || kind === "review" ? (
          <div className="rb-composer__slots" role="group" aria-label="نطاق الصفحات">
            <label className="rb-composer__note">
              <span>{kind === "hifz" ? "بداية الحفظ" : "بداية المراجعة"}</span>
              <input
                className="rb-composer__input"
                inputMode="numeric"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
                aria-label="من صفحة"
              />
            </label>
            <label className="rb-composer__note">
              <span>{kind === "hifz" ? "الهدف القادم" : "نهاية المراجعة"}</span>
              <input
                className="rb-composer__input"
                inputMode="numeric"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                aria-label="إلى صفحة"
              />
            </label>
          </div>
        ) : null}

        {kind === "khatmah" ? (
          <div className="rb-composer__slots" role="group" aria-label="نوع الختمة">
            {MUSHAF_KHATMAH_TYPES.map((t) => (
              <Button
                key={t.id}
                type="button"
                className={`rb-composer__slot${khatmaType === t.id ? " is-active" : ""}`}
                aria-pressed={khatmaType === t.id}
                onClick={() => setKhatmaType(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        ) : null}

        {kind === "custom" ? (
          <div className="rb-composer__custom">
            <input
              className="rb-composer__input"
              dir="rtl"
              placeholder="اسم الفاصل"
              maxLength={48}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              aria-label="اسم الفاصل المخصص"
            />
            <div className="rb-composer__swatches" role="group" aria-label="لون مخصص">
              {CUSTOM_SWATCHES.map((c) => (
                <Button
                  key={c}
                  type="button"
                  className={`rb-composer__swatch${customColor === c ? " is-active" : ""}`}
                  style={{ background: c }}
                  aria-label={`لون ${c}`}
                  aria-pressed={customColor === c}
                  onClick={() => setCustomColor(c)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <label className="rb-composer__note">
          <span>ملاحظة اختيارية</span>
          <textarea
            dir="rtl"
            rows={2}
            maxLength={240}
            aria-label="ملاحظة اختيارية"
            placeholder={
              kind === "hifz"
                ? "هنا بداية الحفظ"
                : kind === "review"
                  ? "مراجعة الأسبوع القادم"
                  : "ملاحظة قصيرة"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {offline ? (
          <p className="rb-composer__offline" role="status">
            الحفظ محلي على هذا الجهاز — يعمل دون اتصال.
          </p>
        ) : null}

        {error ? (
          <p className="rb-composer__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </MushafBookmarkEditorShell>
  );
});
