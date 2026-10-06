/**
 * بطاقة «متابعة القراءة» — مصحف / مركز القرآن / متابعة التعلّم.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getReadingBookmark, bookmarkHref } from "@/lib/quran-my-bookmarks-ops";
import { loadPagePosition, loadReadingAyahKey, getSurahMeta } from "@/lib/quran-api";
import { currentPageFirstAyah } from "@/lib/quran-ayah-page";
import { toArabicDigits } from "@/lib/utils";
import "@/styles/components/last-reading-bookmark-card.css";

type Resume = {
  page: number;
  surahName: string;
  href: string;
  fromBookmark: boolean;
  savedAtLabel: string | null;
};

function formatSavedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

function resolveResume(): Resume | null {
  const bm = getReadingBookmark();
  if (bm) {
    const surah = Number(bm.ayahKey.split(":")[0]);
    const name =
      surah >= 1 && surah <= 114
        ? getSurahMeta(surah).name.replace(/^سُورَةُ\s*/u, "")
        : "";
    return {
      page: bm.page,
      surahName: name,
      href: bookmarkHref(bm),
      fromBookmark: true,
      savedAtLabel: formatSavedAt(bm.updatedAt || bm.createdAt),
    };
  }
  const page = loadPagePosition();
  if (page == null || page < 1) return null;
  // صفحة 1 بلا آية محفوظة (أو 1:1) ≠ استئناف ذي معنى — لا «آخر قراءة» وهمية
  const savedKey = loadReadingAyahKey();
  if (page === 1 && (!savedKey || savedKey === "1:1")) return null;
  const key = loadReadingAyahKey() || currentPageFirstAyah(page);
  const surah = Number(key.split(":")[0]);
  const name =
    surah >= 1 && surah <= 114
      ? getSurahMeta(surah).name.replace(/^سُورَةُ\s*/u, "")
      : "";
  return {
    page,
    surahName: name,
    href: `/mushaf/page/${page}${key ? `?ayah=${key}` : ""}`,
    fromBookmark: false,
    savedAtLabel: null,
  };
}

type Props = {
  className?: string;
  compact?: boolean;
};

export function LastReadingBookmarkCard({ className = "", compact = false }: Props) {
  const [resume, setResume] = useState<Resume | null>(() => resolveResume());

  useEffect(() => {
    const refresh = () => setResume(resolveResume());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!resume) return null;

  return (
    <section
      className={`lrb-card ${compact ? "lrb-card--compact" : ""} ${className}`.trim()}
      data-testid="last-reading-bookmark-card"
      aria-label="متابعة القراءة"
    >
      <div className="lrb-card__body">
        <p className="lrb-card__eyebrow">متابعة القراءة</p>
        <h3 className="lrb-card__title">
          الصفحة {toArabicDigits(resume.page)}
          {resume.surahName ? (
            <>
              <span aria-hidden="true"> · </span>
              سورة {resume.surahName}
            </>
          ) : null}
        </h3>
        {!compact && resume.savedAtLabel ? (
          <p className="lrb-card__sub">وقت الحفظ: {resume.savedAtLabel}</p>
        ) : !compact ? (
          <p className="lrb-card__sub">آخر موضع قراءة</p>
        ) : null}
      </div>
      <Link href={resume.href} className="lrb-card__cta">
        متابعة
      </Link>
      <progress
        className="lrb-card__progress"
        max={604}
        value={Math.min(resume.page, 604)}
        aria-label={`التقدّم في المصحف: صفحة ${toArabicDigits(resume.page)} من ٦٠٤`}
      />
    </section>
  );
}
