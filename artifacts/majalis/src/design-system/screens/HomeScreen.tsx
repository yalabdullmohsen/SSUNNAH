import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AyahCard, Button, Card, ErrorState, EmptyState, Hscroll, HadithCard, Icon, IconLink, LessonCard,
  NavigationBar, ProgressBar, QuickGrid, SectionHeader, SkeletonCard, useToast, formatAyahRef,
  type LessonCardData, type QuickItem,
} from "@/design-system";
import { useAuth } from "@/components/AuthProvider";
import { getDailyAyah, getDailyDhikr, getDailyFaida, getDailyHadith } from "@/lib/daily-content";
import { getLatestContinueReading, getContinueReadingEntries } from "@/lib/continue-reading";
import { isLocalBookmarked, toggleLocalBookmark } from "@/lib/local-bookmarks";
import { getUnifiedActiveLessons } from "@/lib/lessons-service";
import { fromKuwaitLesson } from "@/lib/unified-lesson-card";
import { toArabicIndicDigits } from "@/lib/numerals";
import { dualDateLabel, greetingFor, pageFromMushafRoute } from "./home-utils";
import { PrayerHero } from "./PrayerHero";

const QUICK: readonly QuickItem[] = [
  { id: "mushaf", label: "المصحف", href: "/mushaf", icon: "quran" },
  { id: "tafsir", label: "التفسير", href: "/tafsir", icon: "tafsir" },
  { id: "adhkar", label: "الأذكار", href: "/adhkar", icon: "adhkar" },
  { id: "tasbih", label: "التسبيح", href: "/tasbih", icon: "tasbih" },
  { id: "qibla", label: "القبلة", href: "/qibla", icon: "qibla" },
  { id: "arbaeen", label: "الأربعون", href: "/arbaeen-nawawi", icon: "hadith" },
  { id: "hadith", label: "الحديث", href: "/hadith", icon: "hadith" },
  { id: "lessons", label: "الدروس", href: "/lessons", icon: "lessons" },
];

const START_FLAG = "sn-home-start-dismissed-v1";
const readFlag = () => { try { return localStorage.getItem(START_FLAG) === "1"; } catch { return false; } };

function ContinueCard() {
  const latest = useMemo(() => getLatestContinueReading(), []);
  const page = latest?.section === "mushaf" ? pageFromMushafRoute(latest.route) : null;
  return (
    <Card variant="featured" aria-label="تابع">
      <div className="sn-stack">
        {latest ? (
          <Link href={latest.route} className="sn-continue-row sn-pressable">
            <span className="sn-row-item__icon"><Icon name="quran" size={20} /></span>
            <span className="sn-row-item__body">
              <span className="sn-row-item__title">تابع: {latest.title}</span>
              {page ? <span className="sn-row-item__desc">الصفحة {toArabicIndicDigits(page)} من {toArabicIndicDigits(604)}</span> : null}
            </span>
            <Icon name="chevron" size={20} className="sn-row-item__chev" />
          </Link>
        ) : (
          <Link href="/mushaf" className="sn-continue-row sn-pressable">
            <span className="sn-row-item__icon"><Icon name="quran" size={20} /></span>
            <span className="sn-row-item__body">
              <span className="sn-row-item__title">ابدأ قراءة المصحف</span>
              <span className="sn-row-item__desc">يُحفظ موضعك تلقائيًا</span>
            </span>
            <Icon name="chevron" size={20} className="sn-row-item__chev" />
          </Link>
        )}
        {page ? <ProgressBar value={(page / 604) * 100} label="تقدّم قراءة المصحف" /> : null}
        <Link href="/my-learning" className="sn-continue-row sn-pressable">
          <span className="sn-row-item__icon"><Icon name="check" size={20} /></span>
          <span className="sn-row-item__body"><span className="sn-row-item__title">الورد اليومي</span></span>
          <Icon name="chevron" size={20} className="sn-row-item__chev" />
        </Link>
      </div>
    </Card>
  );
}

function shareText(title: string, text: string, toast: (m: string, tone?: "default" | "danger") => void) {
  const body = `${text}\n\n— ${title}`;
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    void navigator.share({ title, text: body }).catch(() => undefined);
    return;
  }
  void navigator.clipboard?.writeText(body).then(() => toast("تم النسخ"), () => toast("تعذّر النسخ", "danger"));
}

function DailyContent() {
  const toast = useToast();
  const ayah = useMemo(() => getDailyAyah(), []);
  const hadith = useMemo(() => getDailyHadith(), []);
  const dhikr = useMemo(() => getDailyDhikr(), []);
  const faida = useMemo(() => getDailyFaida(), []);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => ({
    ayah: isLocalBookmarked("ayah", ayah.id), hadith: isLocalBookmarked("hadith", hadith.id),
    dhikr: isLocalBookmarked("dhikr", dhikr.id), faida: isLocalBookmarked("faida", faida.id),
  }));
  const save = useCallback((key: string, id: string, title: string, href: string) => {
    const on = toggleLocalBookmark({ contentType: key, contentId: id, title, href });
    setSaved((s) => ({ ...s, [key]: on }));
    toast(on ? "تم الحفظ" : "أُزيل من المحفوظات");
  }, [toast]);
  const ayahRef = formatAyahRef(ayah.surah.replace(/^سورة\s+/, ""), ayah.ayahNumber);
  return (
    <section className="sn-stack" aria-label="محتوى اليوم">
      <SectionHeader title="محتوى اليوم" />
      <Hscroll label="محتوى اليوم">
        <div className="sn-today-card" role="listitem">
          <AyahCard text={ayah.text} surah={ayah.surah.replace(/^سورة\s+/, "")} ayah={ayah.ayahNumber} saved={saved.ayah}
            onSave={() => save("ayah", ayah.id, ayahRef, "/mushaf")} onShare={() => shareText(ayahRef, ayah.text, toast)} />
        </div>
        <div className="sn-today-card" role="listitem">
          <HadithCard text={hadith.text} source={[hadith.narrator, hadith.source].filter(Boolean).join(" — ")} saved={saved.hadith}
            onSave={() => save("hadith", hadith.id, hadith.source, "/hadith")} onShare={() => shareText(hadith.source, hadith.text, toast)} />
        </div>
        <div className="sn-today-card" role="listitem">
          <HadithCard text={dhikr.text} source={dhikr.source || "ذكر اليوم"} saved={saved.dhikr}
            onSave={() => save("dhikr", dhikr.id, dhikr.source || "ذكر", "/adhkar")} onShare={() => shareText("ذكر اليوم", dhikr.text, toast)} />
        </div>
        <div className="sn-today-card" role="listitem">
          <HadithCard text={faida.text} source={faida.author_name || faida.category || "فائدة اليوم"} saved={saved.faida}
            onSave={() => save("faida", faida.id, faida.category || "فائدة", "/fawaid")} onShare={() => shareText("فائدة اليوم", faida.text, toast)} />
        </div>
      </Hscroll>
    </section>
  );
}

function UpcomingLessons() {
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [items, setItems] = useState<Array<LessonCardData & { href: string }>>([]);
  const load = useCallback(() => {
    setState("loading");
    getUnifiedActiveLessons()
      .then(({ lessons }) => {
        const mapped = (Array.isArray(lessons) ? lessons : []).map((l) => fromKuwaitLesson(l)).sort((a, b) => a.nextOccurrenceMs - b.nextOccurrenceMs).slice(0, 6);
        setItems(mapped.map((l) => ({ id: l.id, title: l.title, sheikh: l.sheikhName, when: [l.day, l.time].filter(Boolean).join(" · "), place: l.mosque, href: l.detailsHref || "/lessons" })));
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);
  return (
    <section className="sn-stack" aria-label="الدروس القادمة">
      <SectionHeader title="الدروس القادمة" actionLabel="عرض الكل" actionHref="/lessons" />
      {state === "loading" ? <SkeletonCard /> : null}
      {state === "error" ? <ErrorState onRetry={load} /> : null}
      {state === "ready" && items.length === 0 ? <EmptyState icon="lessons" title="لا دروس قادمة الآن" description="تابع الدروس لاحقًا أو تصفّح الأرشيف." /> : null}
      {state === "ready" && items.length > 0 ? (
        <Hscroll label="الدروس القادمة">
          {items.map((l) => (<div key={l.id} className="sn-lesson-slot" role="listitem"><LessonCard lesson={l} href={l.href} /></div>))}
        </Hscroll>
      ) : null}
    </section>
  );
}

function StartHere() {
  const [dismissed, setDismissed] = useState(() => readFlag() || getContinueReadingEntries(1).length > 0);
  if (dismissed) return null;
  const dismiss = () => { try { localStorage.setItem(START_FLAG, "1"); } catch { /* ignore */ } setDismissed(true); };
  return (
    <Card variant="featured" aria-label="ابدأ من هنا">
      <div className="sn-stack">
        <p className="sn-t-footnote sn-t-secondary">للزائر الجديد</p>
        <h2 className="sn-t-title2">ابدأ من هنا</h2>
        <p className="sn-t-subhead sn-t-secondary">القرآن والأذكار والدروس الموثّقة في مكان واحد. ابدأ بالمصحف أو بدرس قريب منك.</p>
        <div className="sn-row">
          <Button variant="primary" onClick={() => { dismiss(); window.location.assign("/mushaf"); }}>افتح المصحف</Button>
          <Button variant="tertiary" onClick={dismiss}>إخفاء</Button>
        </div>
      </div>
    </Card>
  );
}

export default function HomeScreen() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="sn-screen" data-testid="home-screen">
      <NavigationBar
        title={greetingFor()}
        subtitle={dualDateLabel()}
        trailing={<>
          <IconLink icon="search" label="بحث" href="/search" />
          <IconLink icon={isLoggedIn ? "user" : "login"} label={isLoggedIn ? "حسابي" : "تسجيل الدخول"} href={isLoggedIn ? "/profile" : "/login"} />
        </>}
      />
      <div className="sn-container sn-stack sn-stack--lg">
        <PrayerHero />
        <ContinueCard />
        <section className="sn-stack" aria-label="وصول سريع">
          <SectionHeader title="وصول سريع" />
          <QuickGrid items={QUICK} />
        </section>
        <DailyContent />
        <UpcomingLessons />
        <StartHere />
      </div>
    </div>
  );
}
