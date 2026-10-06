import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, Icon, IconLink, LinkCard, ListGroup, ListRow, NavigationBar, ProgressBar, SearchField, Segmented, SectionHeader } from "@/design-system";
import { JUZ_START_PAGES, getSurahList } from "@/lib/quran-api";
import { getLatestContinueReading } from "@/lib/continue-reading";
import { toArabicIndicDigits } from "@/lib/numerals";
import { pageFromMushafRoute } from "./home-utils";

/** القرآن: بحث · آخر موضع · تبديل السور/الأجزاء · قائمة السور بأرقام مزخرفة · دخول للتفسير والتلاوة وعلوم القرآن. */
export default function QuranHubScreen() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<"surahs" | "juz">("surahs");
  const [q, setQ] = useState("");
  const surahs = useMemo(() => getSurahList(), []);
  const latest = useMemo(() => getLatestContinueReading(), []);
  const page = latest?.section === "mushaf" ? pageFromMushafRoute(latest.route) : null;
  return (
    <div className="sn-screen" data-testid="quran-hub-screen">
      <NavigationBar title="القرآن" subtitle="المصحف والتفسير والتلاوة" trailing={<IconLink icon="search" label="بحث شامل" href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <SearchField value={q} onChange={setQ} onSubmit={() => q.trim() && navigate(`/quran/search?q=${encodeURIComponent(q.trim())}`)} placeholder="ابحث في آيات القرآن" label="بحث في القرآن" />
        <LinkCard href={latest?.section === "mushaf" ? latest.route : "/mushaf"} variant="featured">
          <div className="sn-stack">
            <div className="sn-row">
              <span className="sn-row-item__icon"><Icon name="quran" size={20} /></span>
              <span className="sn-row-item__body">
                <span className="sn-row-item__title">{latest?.section === "mushaf" ? `تابع: ${latest.title}` : "ابدأ قراءة المصحف"}</span>
                <span className="sn-row-item__desc">{page ? `الصفحة ${toArabicIndicDigits(page)} من ${toArabicIndicDigits(604)}` : "يُحفظ موضعك تلقائيًا"}</span>
              </span>
            </div>
            {page ? <ProgressBar value={(page / 604) * 100} label="تقدّم القراءة" /> : null}
          </div>
        </LinkCard>
        <ListGroup label="استكشف">
          <ListRow icon="tafsir" title="التفسير" description="تفاسير موثّقة آية بآية" href="/tafsir" />
          <ListRow icon="tilawa" title="التلاوة" description="استماع بأصوات القرّاء" href="/quran-hub/tilawa" />
          <ListRow icon="lightbulb" title="علوم القرآن" description="المكي والمدني والقراءات والتجويد" href="/quran-sciences" />
        </ListGroup>
        <Segmented<"surahs" | "juz"> label="عرض" value={view} onChange={setView} options={[{ value: "surahs", label: "السور" }, { value: "juz", label: "الأجزاء" }]} />
        {view === "surahs" ? (
          <ListGroup>
            {surahs.filter((s) => !q.trim() || s.name.includes(q.trim())).map((s) => (
              <ListRow key={s.number} iconNode={<span className="sn-ornament" aria-hidden="true">{toArabicIndicDigits(s.number)}</span>} title={s.name} description={`${s.revelation} · ${toArabicIndicDigits(s.ayahs)} آية`} href={`/mushaf/${s.number}`} />
            ))}
          </ListGroup>
        ) : (
          <>
            <SectionHeader title="الأجزاء الثلاثون" />
            <ListGroup>
              {JUZ_START_PAGES.map((p, i) => (
                <ListRow key={p} iconNode={<span className="sn-ornament" aria-hidden="true">{toArabicIndicDigits(i + 1)}</span>} title={`الجزء ${toArabicIndicDigits(i + 1)}`} description={`يبدأ من الصفحة ${toArabicIndicDigits(p)}`} href={`/mushaf/page/${p}`} />
              ))}
            </ListGroup>
          </>
        )}
        <Card variant="standard"><p className="sn-t-footnote sn-t-secondary">نص المصحف مأخوذ من مصادر موثّقة بلا تعديل — راجع صفحة المصادر.</p></Card>
      </div>
    </div>
  );
}
