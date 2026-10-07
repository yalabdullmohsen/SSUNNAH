import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, Icon, IconLink, LinkCard, ListGroup, ListRow, NavigationBar, ProgressBar, SearchField, Segmented, SectionHeader } from "@/design-system";
import { JUZ_START_PAGES, getSurahList } from "@/lib/quran-api";
import { getLatestContinueReading } from "@/lib/continue-reading";
import { toArabicIndicDigits } from "@/lib/numerals";
import { pageFromMushafRoute } from "./home-utils";
import { S } from "@/design-system/strings";

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
      <NavigationBar title={S.quranHub_01} subtitle={S.quranHub_02} trailing={<IconLink icon="search" label={S.quranHub_03} href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <SearchField value={q} onChange={setQ} onSubmit={() => q.trim() && navigate(`/quran/search?q=${encodeURIComponent(q.trim())}`)} placeholder={S.quranHub_04} label={S.quranHub_05} />
        <LinkCard href={latest?.section === "mushaf" ? latest.route : "/mushaf"} variant="featured">
          <div className="sn-stack">
            <div className="sn-row">
              <span className="sn-row-item__icon"><Icon name="quran" size={20} /></span>
              <span className="sn-row-item__body">
                <span className="sn-row-item__title">{latest?.section === "mushaf" ? `تابع: ${latest.title}` : S.home_10}</span>
                <span className="sn-row-item__desc">{page ? `الصفحة ${toArabicIndicDigits(page)} من ${toArabicIndicDigits(604)}` : S.home_11}</span>
              </span>
            </div>
            {page ? <ProgressBar value={(page / 604) * 100} label={S.quranHub_06} /> : null}
          </div>
        </LinkCard>
        <ListGroup label={S.quranHub_07}>
          <ListRow icon="tafsir" title={S.home_02} description={S.quranHub_08} href="/tafsir" />
          <ListRow icon="tilawa" title={S.quranHub_09} description={S.quranHub_10} href="/quran-hub/tilawa" />
          <ListRow icon="lightbulb" title={S.quranHub_11} description={S.quranHub_12} href="/quran-sciences" />
          <ListRow icon="tilawa" title={S.quranHub_20} description={S.quranHub_21} href="/quran/recitation-test-ai" />
        </ListGroup>
        <Segmented<"surahs" | "juz"> label={S.quranHub_13} value={view} onChange={setView} options={[{ value: "surahs", label: S.quranHub_14 }, { value: "juz", label: S.quranHub_15 }]} />
        {view === "surahs" ? (
          <ListGroup>
            {surahs.filter((s) => !q.trim() || s.name.includes(q.trim())).map((s) => (
              <ListRow key={s.number} iconNode={<span className="sn-ornament" aria-hidden="true">{toArabicIndicDigits(s.number)}</span>} title={s.name} description={`${s.revelation} · ${toArabicIndicDigits(s.ayahs)} آية`} href={`/mushaf/${s.number}`} />
            ))}
          </ListGroup>
        ) : (
          <>
            <SectionHeader title={S.quranHub_16} />
            <ListGroup>
              {JUZ_START_PAGES.map((p, i) => (
                <ListRow key={p} iconNode={<span className="sn-ornament" aria-hidden="true">{toArabicIndicDigits(i + 1)}</span>} title={`الجزء ${toArabicIndicDigits(i + 1)}`} description={`يبدأ من الصفحة ${toArabicIndicDigits(p)}`} href={`/mushaf/page/${p}`} />
              ))}
            </ListGroup>
          </>
        )}
        <Card variant="standard"><p className="sn-t-footnote sn-t-secondary">{S.quranHub_17}</p></Card>
      </div>
    </div>
  );
}
