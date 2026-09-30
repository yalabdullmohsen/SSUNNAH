import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  removeMyBookmark,
  type MyBookmark,
} from "@/lib/quran-my-bookmarks";
import {
  archiveBookmark,
  bookmarkHref,
  exportBookmarksJson,
  getBookmarkStats,
  getHifzProgress,
  getKhatmahProgress,
  getLastUsedBookmark,
  getReadingBookmark,
  getReviewProgress,
  importBookmarksJson,
  listFilteredBookmarks,
  setLastUsedBookmarkId,
  toggleBookmarkFavorite,
} from "@/lib/quran-my-bookmarks-ops";
import {
  getKhatmahTypeLabel,
  MUSHAF_BOOKMARK_KINDS,
  MUSHAF_MANAGER_GROUP_ORDER,
  resolveBookmarkColor,
  type MushafBookmarkKind,
} from "@/lib/quran-bookmark-kinds";
import { getSurahMeta } from "@/lib/quran-api";
import { toArabicIndicDigits as toArabicDigits } from "@/lib/numerals";
import { navigateTo } from "@/lib/navigation-intent";
import { LastReadingBookmarkCard } from "@/components/quran/LastReadingBookmarkCard";
import { FieldError, FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import "@/styles/reader-bookmarks-manager.css";

const SURAH_OPTIONS = Array.from({ length: 114 }, (_, i) => i + 1);

function itemProgressLine(b: MyBookmark): string {
  if (b.kind === "hifz") {
    const p = getHifzProgress(b);
    if (!p) return "";
    return ` · تقدم ${toArabicDigits(p.pct)}٪ (ص ${toArabicDigits(p.current)} → ${toArabicDigits(p.to)})`;
  }
  if (b.kind === "review") {
    const p = getReviewProgress(b);
    if (!p) return "";
    return ` · المراجعة الحالية: ص ${toArabicDigits(p.from)} → ص ${toArabicDigits(p.to)}`;
  }
  if (b.kind === "khatmah") {
    const p = getKhatmahProgress(b);
    if (!p) return "";
    return ` · ${getKhatmahTypeLabel(b.khatmaType)} · ${toArabicDigits(p.pagesDone)}/${toArabicDigits(p.pagesTotal)}`;
  }
  return "";
}

/**
 * شاشة مدير الفواصل — بحث · تصفية · تجميع · انتقال سريع.
 */
export default function MushafBookmarksView() {
  const [kind, setKind] = useState<MushafBookmarkKind | "all">("all");
  const [surah, setSurah] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [tick, setTick] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteBusyRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const confirmDeleteBookmark = useCallback(async () => {
    if (pendingDeleteId == null || deleteBusyRef.current) return;
    deleteBusyRef.current = true;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await removeMyBookmark(pendingDeleteId);
      setPendingDeleteId(null);
      refresh();
    } catch {
      setDeleteError("تعذّر حذف الفاصل. أعد المحاولة.");
    } finally {
      deleteBusyRef.current = false;
      setDeleteBusy(false);
    }
  }, [pendingDeleteId, refresh]);

  const items = useMemo(
    () =>
      listFilteredBookmarks({
        kind,
        surah,
        query,
        includeArchived,
      }),
    // tick يُحدّث بعد الحذف/الأرشفة
    [kind, surah, query, includeArchived, tick],
  );

  const stats = useMemo(() => getBookmarkStats(), [tick]);
  const last = useMemo(() => getLastUsedBookmark(), [tick]);
  const dark =
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark");

  const grouped = useMemo(() => {
    const map = new Map<MushafBookmarkKind, MyBookmark[]>();
    for (const b of items) {
      const list = map.get(b.kind) ?? [];
      list.push(b);
      map.set(b.kind, list);
    }
    const metaById = new Map(MUSHAF_BOOKMARK_KINDS.map((k) => [k.id, k]));
    return MUSHAF_MANAGER_GROUP_ORDER.map((id) => ({
      meta: metaById.get(id)!,
      items: map.get(id) ?? [],
    })).filter((g) => g.meta && g.items.length > 0);
  }, [items]);
  const reading = useMemo(() => getReadingBookmark(), [tick]);

  const openBookmark = (b: MyBookmark) => {
    setLastUsedBookmarkId(b.id);
    navigateTo(bookmarkHref(b));
  };

  const onExport = () => {
    const blob = new Blob([exportBookmarksJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sunnah-mushaf-bookmarks-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const result = await importBookmarksJson(text);
    if (result.ok) {
      setImportError(null);
      refresh();
      return;
    }
    setImportError(
      typeof result.error === "string" && result.error.trim()
        ? "تعذّر استيراد الملف. تحقّق من صيغة JSON ثم أعد المحاولة."
        : "تعذّر استيراد الملف.",
    );
  };

  return (
    <div className="rb-manager" dir="rtl" data-testid="mushaf-bookmarks-manager">
      <header className="rb-manager__header">
        <Link href="/mushaf" className="rb-manager__back">
          المصحف
        </Link>
        <h1 className="rb-manager__title">علامات المصحف</h1>
        <span className="rb-manager__count">{toArabicDigits(stats.total)}</span>
      </header>

      {importError ? (
        <FieldError id="rb-import-error" className="rb-manager__import-error">
          {importError}
        </FieldError>
      ) : null}

      <LastReadingBookmarkCard className="rb-manager__resume" />

      <section className="rb-manager__stats" aria-label="إحصائيات العلامات">
        <div>
          <strong>{toArabicDigits(stats.reading)}</strong>
          <span>قراءة</span>
        </div>
        <div>
          <strong>{toArabicDigits(stats.hifz)}</strong>
          <span>حفظ</span>
        </div>
        <div>
          <strong>{toArabicDigits(stats.review)}</strong>
          <span>مراجعة</span>
        </div>
        <div>
          <strong>{toArabicDigits(stats.khatmah)}</strong>
          <span>ختمات</span>
        </div>
        <div>
          <strong>{toArabicDigits(stats.custom)}</strong>
          <span>شخصي</span>
        </div>
      </section>

      {reading ? (
        <button
          type="button"
          className="rb-manager__last"
          onClick={() => openBookmark(reading)}
        >
          العودة إلى آخر موضع قراءة · ص {toArabicDigits(reading.page)}
        </button>
      ) : last ? (
        <button
          type="button"
          className="rb-manager__last"
          onClick={() => openBookmark(last)}
        >
          آخر علامة: {last.label}
        </button>
      ) : null}

      <div className="rb-manager__toolbar">
        <input
          className="rb-manager__search"
          dir="rtl"
          placeholder="بحث… مثال: الحفظ"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="بحث"
        />
        <div className="rb-manager__select-field">
          <FieldLabel className="sr-only">تصفية النوع</FieldLabel>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as MushafBookmarkKind | "all")}
          >
            <SelectTrigger className="rb-manager__select min-h-11 text-base" aria-label="تصفية النوع">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {MUSHAF_BOOKMARK_KINDS.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rb-manager__select-field">
          <FieldLabel className="sr-only">تصفية السورة</FieldLabel>
          <Select
            value={surah == null ? "all" : String(surah)}
            onValueChange={(v) => setSurah(v === "all" ? null : Number(v))}
          >
            <SelectTrigger className="rb-manager__select min-h-11 text-base" aria-label="تصفية السورة">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل السور</SelectItem>
              {SURAH_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {getSurahMeta(n).name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rb-manager__actions">
        <label className="rb-manager__check">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          الأرشيف
        </label>
        <button type="button" className="rb-manager__ghost" onClick={onExport}>
          تصدير
        </button>
        <button
          type="button"
          className="rb-manager__ghost"
          onClick={() => fileRef.current?.click()}
        >
          استيراد
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImportFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {grouped.length === 0 ? (
        <p className="rb-manager__empty" data-testid="mushaf-bookmarks-empty">
          لم يتم إنشاء أي علامة بعد
        </p>
      ) : (
        grouped.map((g) => (
          <section key={g.meta.id} className="rb-manager__group">
            <h2>
              <span
                className="rb-manager__swatch"
                style={{ background: resolveBookmarkColor(g.meta.id, null, dark) }}
              />
              {g.meta.label}
              <em>({toArabicDigits(g.items.length)})</em>
            </h2>
            <ul>
              {g.items.map((b) => {
                const surahNum = Number(b.ayahKey.split(":")[0]);
                const surahName =
                  surahNum >= 1 && surahNum <= 114
                    ? getSurahMeta(surahNum).name.replace(/^سُورَةُ\s*/u, "")
                    : "";
                const stamp = b.updatedAt || b.createdAt || b.date;
                return (
                  <li key={b.id} className={b.archived ? "is-archived" : undefined}>
                    <button
                      type="button"
                      className="rb-manager__item"
                      onClick={() => openBookmark(b)}
                    >
                      <span className="rb-manager__item-label">{b.label}</span>
                      {b.note ? <span className="rb-manager__item-note">{b.note}</span> : null}
                      <span className="rb-manager__item-meta">
                        الصفحة {toArabicDigits(b.page)}
                        {surahName ? ` · سورة ${surahName}` : ""}
                        {stamp ? ` · ${stamp.slice(0, 10)}` : ""}
                        {itemProgressLine(b)}
                      </span>
                    </button>
                    <div className="rb-manager__item-actions">
                      <button
                        type="button"
                        aria-label={b.favorite ? "إزالة من المفضلة" : "مفضلة"}
                        onClick={() => void toggleBookmarkFavorite(b.id).then(refresh)}
                      >
                        {b.favorite ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        aria-label={b.archived ? "استعادة" : "أرشفة"}
                        onClick={() => void archiveBookmark(b.id, !b.archived).then(refresh)}
                      >
                        {b.archived ? "↩" : "أرشيف"}
                      </button>
                      {pendingDeleteId === b.id ? (
                        <div
                          className="rb-manager__delete-confirm"
                          role="alertdialog"
                          aria-labelledby={`rb-del-title-${b.id}`}
                          aria-describedby={`rb-del-desc-${b.id}`}
                          data-testid="mushaf-bookmark-delete-confirm"
                        >
                          <p id={`rb-del-title-${b.id}`}>تأكيد حذف الفاصل</p>
                          <p id={`rb-del-desc-${b.id}`}>هل تريد حذف هذا الفاصل نهائيًا؟</p>
                          {typeof navigator !== "undefined" && navigator.onLine === false ? (
                            <p role="status">الحذف محلي على هذا الجهاز — يعمل دون اتصال.</p>
                          ) : null}
                          {deleteError ? (
                            <p role="alert">{deleteError}</p>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            aria-label="تأكيد حذف الفاصل"
                            data-testid="mushaf-bookmark-delete-yes"
                            disabled={deleteBusy}
                            aria-busy={deleteBusy}
                            onClick={() => void confirmDeleteBookmark()}
                          >
                            {deleteBusy ? "جاري الحذف…" : "حذف الفاصل"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            aria-label="إلغاء حذف الفاصل"
                            data-testid="mushaf-bookmark-delete-no"
                            disabled={deleteBusy}
                            onClick={() => {
                              setPendingDeleteId(null);
                              setDeleteError(null);
                            }}
                          >
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label="حذف الفاصل"
                          data-testid="mushaf-bookmark-delete"
                          onClick={() => {
                            setDeleteError(null);
                            setPendingDeleteId(b.id);
                          }}
                        >
                          حذف الفاصل
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
