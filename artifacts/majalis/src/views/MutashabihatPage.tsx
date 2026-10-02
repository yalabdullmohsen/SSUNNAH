import { SectionIcon } from "@/components/ui/SectionIcon";
import { useEffect, useState, useMemo } from "react";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY, STATUS } from "@/lib/ui-copy";
import { fetchSurahDetail, type Ayah } from "@/lib/quran-api";
import {
  MUTASHABIHAT,
  MUTASHABIHAT_CATEGORIES,
  type MutashabihatPair,
} from "@/lib/mutashabihat-data";
import { ChevronDown, Eye, EyeOff, BookOpen } from "lucide-react";
import { DetailScreen } from "@/components/design-system/screens";
import { Button } from "@/components/ui/button";
import "@/styles/quran.css";

/* ─── نص الآية المجلوب ─────────────────────────────────────────── */
function AyahText({ surah, ayah: ayahNum, surahName }: { surah: number; ayah: number; surahName: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setText(null);
    fetchSurahDetail(surah)
      .then((detail) => {
        if (cancelled) return;
        const a = detail.ayahs.find((a: Ayah) => a.numberInSurah === ayahNum);
        setText(a?.text ?? STATUS.loadError);
      })
      .catch(() => {
        if (!cancelled) setText(STATUS.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surah, ayahNum]);

  return (
    <div className="mutash-ayah" aria-busy={loading}>
      {loading && !text ? (
        <span className="mutash-ayah__loading" role="status">
          تحديث الآية…
        </span>
      ) : (
        <>
          ﴿{text}﴾
          <span className="mutash-ayah__ref">
            — {surahName}: {ayahNum}
          </span>
        </>
      )}
    </div>
  );
}

/* ─── بطاقة المتشابهة ──────────────────────────────────────────── */
function MutashabihatCard({ pair }: { pair: MutashabihatPair }) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="mutash-card" data-open={open ? "1" : undefined}>
      <Button
        type="button"
        variant="ghost"
        className="mutash-card__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="mutash-card__head-main">
          <div className="mutash-card__chips">
            <span className="mutash-card__cat">{pair.category}</span>
            <span className="mutash-card__count">{pair.refs.length} آية</span>
          </div>
          <h3 className="mutash-card__title">{pair.title}</h3>
          <p className="mutash-card__desc">{pair.description}</p>
        </div>
        <span className="mutash-card__chevron">
          <ChevronDown
            size={18}
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        </span>
      </Button>

      {open && (
        <div className="mutash-card__body">
          <div className="mutash-ayah-block">
            {pair.refs.map((ref, i) => (
              <div key={i} style={{ marginBottom: "0.75rem" }}>
                <div className="mutash-ayah-label">
                  سورة {ref.surahName} — الآية {ref.ayah}
                </div>
                <AyahText surah={ref.surah} ayah={ref.ayah} surahName={ref.surahName} />
              </div>
            ))}
          </div>

          {pair.hint && (
            <div style={{ marginTop: "0.75rem" }}>
              <Button
                type="button"
                variant="ghost"
                className="mutash-hint-btn"
                onClick={() => setShowHint((s) => !s)}
              >
                {showHint ? <EyeOff size={14} /> : <Eye size={14} />}
                {showHint ? "إخفاء التلميح" : "عرض تلميح الاختلاف"}
              </Button>
              {showHint && (
                <div className="mutash-hint">
                  <SectionIcon name="💡" size={16} /> {pair.hint}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── الصفحة الرئيسية ──────────────────────────────────────────── */
export default function MutashabihatPage() {
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const [search, setSearch] = useState("");

  useEffect(() => {
    applyPageSeo({
      path: "/mutashabihat",
      title: "الآيات المتشابهات في القرآن | سُنّة",
      description:
        "نظام متخصص لدراسة الآيات المتشابهات في القرآن الكريم مع نصوص الآيات وتلميحات الاختلاف الدقيق.",
      keywords: ["الآيات المتشابهات", "متشابه القرآن", "حفظ القرآن", "تلاوة القرآن"],
      jsonLd: [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "الآيات المتشابهات في القرآن",
        description: "نظام متخصص لدراسة الآيات المتشابهات في القرآن الكريم.",
        url: "https://www.ssunnah.com/mutashabihat",
        inLanguage: "ar",
        publisher: { "@type": "Organization", name: "سُنّة", url: "https://www.ssunnah.com" },
        about: { "@type": "Book", name: "القرآن الكريم", inLanguage: "ar" },
      }],
    });
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === "الكل"
      ? MUTASHABIHAT
      : MUTASHABIHAT.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.includes(q) ||
          p.description.includes(q) ||
          p.refs.some((r) => r.surahName.includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  return (
    <DetailScreen compose="mark">
    <div className="mutash-page">
      <div className="mutash-hero">
        <span className="mutash-hero__icon"><SectionIcon name="📜" size={28} /></span>
        <h1 className="mutash-hero__title">الآيات المتشابهات في القرآن الكريم</h1>
        <p className="mutash-hero__sub">
          دراسة الآيات المتشابهة لفظًا مع بيان وجوه الاختلاف الدقيق بينها
          — مساعدة على الإتقان والحفظ الصحيح
        </p>
      </div>

      <div className="mutash-body">
        <div className="mutash-source">
          <BookOpen size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            <strong>المصادر العلمية:</strong> درة التنزيل للخطيب الإسكافي، البرهان في متشابه القرآن للسخاوي، ملاك التأويل للغرناطي. نصوص الآيات من api.alquran.cloud (المصحف العثماني، رواية حفص).
          </span>
        </div>

        <div className="mutash-tabs" role="tablist" aria-label="تصنيف الآيات المتشابهات">
          {["الكل", ...MUTASHABIHAT_CATEGORIES].map((cat) => (
            <Button
              key={cat}
              type="button"
              variant="ghost"
              role="tab"
              className="mutash-tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <input
          type="search"
          className="mutash-search"
          placeholder="ابحث بالعنوان أو اسم السورة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="البحث في الآيات المتشابهات"
        />

        <p className="mutash-meta">
          {filtered.length} {filtered.length === 1 ? "مجموعة" : "مجموعات"} متشابهة
        </p>

        {filtered.length === 0 ? (
          <p className="mutash-empty">{EMPTY.searchShort}</p>
        ) : (
          filtered.map((pair) => (
            <MutashabihatCard key={pair.id} pair={pair} />
          ))
        )}
      </div>
    </div>
    </DetailScreen>
  );
}
