import { memo, useEffect, useState, lazy, Suspense } from "react";
import { applyPageSeo } from "@/lib/seo";
import { Link } from "wouter";
import { Bell, Compass, HandHeart, MapPin, CircleDot, Settings2 } from "lucide-react";
import {
  useSharedPrayerData,
  useSharedPrayerSlot,
  useSharedPrayerCountdownLive,
} from "@/components/prayer/PrayerCountdownProvider";
import { markPrayer } from "@/lib/prayer-performance-marks";
import { recordDevMount, recordDevRender } from "@/lib/dev-mount-counters";
import {
  formatTime12,
  type PrayerSlot,
} from "@/lib/prayer-times";
import {
  getHighLatitudeRule,
  getPrayerCalcMethod,
  getPrayerMadhab,
  PRAYER_CALC_METHODS,
  setHighLatitudeRule,
  setPrayerCalcMethod,
  setPrayerMadhab,
  type HighLatitudeRuleId,
  type PrayerCalcMethodId,
  type PrayerMadhabId,
} from "@/lib/prayer-calc-prefs";
import { getActivePrayerLocation } from "@/lib/prayer-location-prefs";
import { PrayerLocationPicker } from "@/components/prayer/PrayerLocationPicker";
import { toArabicDigits } from "@/lib/utils";
import { DashboardScreen } from "@/components/design-system/screens";
import { RANKS } from "@/lib/prayer-ranks-data";
import "@/styles/pages/prayer-times.css";
import "@/styles/pages/worship-history-v2.css";

import { Button } from "@/components/ui/button";
import { AppBackButton } from "@/components/common/AppBackButton";
import { FieldLabel } from "@/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AR_UI_LOCALE } from "@/lib/numerals";
const PrayerAnnualTimetable = lazy(() =>
  import("@/components/prayer/PrayerAnnualTimetable").then((m) => ({
    default: m.PrayerAnnualTimetable,
  })),
);

const PRAYER_AR: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

function formatHijri(raw: string | null): string {
  if (!raw) return "";
  const [d, m, y] = raw.split("-").map(Number);
  if (!d || !m || !y) return raw;
  const monthName = HIJRI_MONTHS[(m - 1)] ?? "";
  return `${d} ${monthName} ${y} هـ`;
}

function zoneDateReadable(timeZone: string): string {
  return new Intl.DateTimeFormat(AR_UI_LOCALE, {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function zoneNowSeconds(timeZone: string): { totalMinutes: number; seconds: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const s = Number(parts.find((p) => p.type === "second")?.value || 0);
  return { totalMinutes: h * 60 + m, seconds: s };
}

function secondsUntilPrayer(
  prayerMinutes: number | null,
  timeZone: string,
): { seconds: number; isTomorrow: boolean } {
  if (prayerMinutes == null) return { seconds: 0, isTomorrow: false };
  const now = zoneNowSeconds(timeZone);
  if (prayerMinutes > now.totalMinutes) {
    return { seconds: (prayerMinutes - now.totalMinutes) * 60 - now.seconds, isTomorrow: false };
  }
  return {
    seconds: (24 * 60 - now.totalMinutes + prayerMinutes) * 60 - now.seconds,
    isTomorrow: true,
  };
}

function formatHms(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return toArabicDigits(
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
  );
}

/** عرض 12 ساعة عربي (ص/م) — الحسابات تبقى على time24/minutes داخليًا */
function displayTime12(p: PrayerSlot): string {
  const labeled = (p.time || "").trim();
  if (labeled && /[صم]/.test(labeled)) return labeled;
  const raw = (p.time24 || labeled).trim();
  return raw ? formatTime12(raw) : "—";
}

/** حالة مختصرة لكل صف في قائمة المواقيت */
function rowStatusLabel(
  key: string,
  nextKey: string | undefined,
  inGrace: boolean,
  graceKey: string | undefined,
  past: boolean,
): string {
  if (inGrace && key === graceKey) return "مضى على الأذان";
  if (key === nextKey && !inGrace) return "قادمة";
  if (inGrace && key === nextKey) return "حان وقتها";
  if (past) return "مضت";
  return "قادمة";
}

/** قيمة العدّ فقط — تشترك في السياق الحي دون إعادة رسم صفحة المواقيت. */
const PrayerHeroCountdownValue = memo(function PrayerHeroCountdownValue({
  pinnedKey,
  displayMinutes,
  timeZone,
  inGrace,
  nextKey,
}: {
  pinnedKey: string | null;
  displayMinutes: number | null;
  timeZone: string;
  inGrace: boolean;
  nextKey: string;
}) {
  const countdown = useSharedPrayerCountdownLive();
  const displayHms =
    pinnedKey && pinnedKey !== nextKey
      ? formatHms(secondsUntilPrayer(displayMinutes, timeZone).seconds)
      : inGrace && countdown?.sinceHms
        ? countdown.sinceHms
        : (countdown?.remainingHms ?? "--:--:--");
  return <span className="pts-hero__countdown-value">{displayHms}</span>;
});

export default function PrayerTimesPage() {
  const [locLabel, setLocLabel] = useState(() => getActivePrayerLocation().label);
  const [locToken, setLocToken] = useState(0);
  const [govOpen, setGovOpen] = useState(false);
  const [ranksOpen, setRanksOpen] = useState(false);
  const [calcMethod, setCalcMethod] = useState<PrayerCalcMethodId>(() => getPrayerCalcMethod());
  const [madhab, setMadhab] = useState<PrayerMadhabId>(() => getPrayerMadhab());
  const [highLat, setHighLat] = useState<HighLatitudeRuleId>(() => getHighLatitudeRule());

  recordDevRender("prayerPage");

  useEffect(() => {
    recordDevMount("prayerPage");
    markPrayer("prayer:route-mount");
    markPrayer("prayer:first-frame");
    let stableRaf = 0;
    let interactiveRaf = 0;
    stableRaf = requestAnimationFrame(() => {
      markPrayer("prayer:first-stable-frame");
      interactiveRaf = requestAnimationFrame(() => {
        markPrayer("prayer:interactive");
      });
    });
    return () => {
      cancelAnimationFrame(stableRaf);
      cancelAnimationFrame(interactiveRaf);
    };
  }, []);

  useEffect(() => {
    applyPageSeo({
      path: "/prayer-times",
      title: "مواقيت الصلاة العالمية دون اتصال | سُنّة",
      description: "محرك مواقيت صلاة عالمي دون اتصال لأي مدينة، مع إمساكية سنوية وعدّ تنازلي وتنبيهات محلية.",
      keywords: ["مواقيت الصلاة", "إمساكية", "دون اتصال", "الفجر", "الأذان"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "مواقيت الصلاة العالمية",
          url: "https://www.ssunnah.com/prayer-times",
          description: "مواقيت الصلوات الخمس لأي مدينة في العالم بحساب فلكي محلي",
          provider: { "@type": "Organization", name: "سُنّة", url: "https://www.ssunnah.com" },
        },
      ],
    });
  }, []);

  const { data, loading, reload } = useSharedPrayerData();
  const slot = useSharedPrayerSlot();
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const timeZone = data?.timezone || getActivePrayerLocation().timeZone;

  useEffect(() => {
    void locToken;
    setLocLabel(getActivePrayerLocation().label);
  }, [locToken]);

  function handleCalcMethod(id: PrayerCalcMethodId) {
    setPrayerCalcMethod(id);
    setCalcMethod(id);
    setPinnedKey(null);
    reload();
  }

  function handleMadhab(id: PrayerMadhabId) {
    setPrayerMadhab(id);
    setMadhab(id);
    setPinnedKey(null);
    reload();
  }

  function handleHighLat(id: HighLatitudeRuleId) {
    setHighLatitudeRule(id);
    setHighLat(id);
    setPinnedKey(null);
    reload();
  }

  const headerChrome = (
    <header className="pts-header">
      <h1 className="pts-title">الصلاة</h1>
      <p className="pts-dates">
        <span>{zoneDateReadable(timeZone)}</span>
      </p>
    </header>
  );

  const toolsBar = (
    <div className="pts-toolbar" role="group" aria-label="أدوات الصفحة">
      <Button
        type="button"
        className="pts-location pts-location--chip"
        onClick={() => setGovOpen((v) => !v)}
        aria-expanded={govOpen}
        aria-controls="pts-gov-panel" variant="ghost">
        <MapPin size={15} strokeWidth={2} aria-hidden="true" />
        <span>{locLabel}</span>
      </Button>
      <Link href="/adhan-settings" className="pts-settings" aria-label="إعدادات الصلاة والأذان">
        <Settings2 size={16} strokeWidth={2} aria-hidden="true" />
        <span>إعدادات</span>
      </Link>
      <AppBackButton
        variant="inline"
        fallbackHref="/"
        className="pts-back"
        label="رجوع"
        aria-label="رجوع"
      />
    </div>
  );

  const locationPanel = govOpen ? (
    <div id="pts-gov-panel" className="pts-gov-panel" role="region" aria-label="إعدادات الموقع والحساب">
      <PrayerLocationPicker
        onChanged={(next) => {
          setLocLabel(next.label);
          setLocToken((n) => n + 1);
          setPinnedKey(null);
          reload();
        }}
      />
      <details className="pts-more">
        <summary>خيارات متقدمة</summary>
        <div className="pts-more__body">
          <div className="pts-method">
            <FieldLabel htmlFor="pts-calc-method" className="pts-method__label">
              طريقة الحساب
            </FieldLabel>
            <Select
              value={calcMethod}
              onValueChange={(v) => handleCalcMethod(v as PrayerCalcMethodId)}
            >
              <SelectTrigger
                id="pts-calc-method"
                className="pts-method__select min-h-11 text-base"
                aria-label="طريقة الحساب"
                dir="rtl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRAYER_CALC_METHODS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pts-method">
            <FieldLabel htmlFor="pts-madhab" className="pts-method__label">
              مذهب العصر
            </FieldLabel>
            <Select value={madhab} onValueChange={(v) => handleMadhab(v as PrayerMadhabId)}>
              <SelectTrigger
                id="pts-madhab"
                className="pts-method__select min-h-11 text-base"
                aria-label="مذهب العصر"
                dir="rtl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shafi">شافعي / مالكي / حنبلي</SelectItem>
                <SelectItem value="Hanafi">حنفي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pts-method">
            <FieldLabel htmlFor="pts-highlat" className="pts-method__label">
              مناطق خطوط العرض العالية
            </FieldLabel>
            <Select value={highLat} onValueChange={(v) => handleHighLat(v as HighLatitudeRuleId)}>
              <SelectTrigger
                id="pts-highlat"
                className="pts-method__select min-h-11 text-base"
                aria-label="مناطق خطوط العرض العالية"
                dir="rtl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">تلقائي موصى به</SelectItem>
                <SelectItem value="MiddleOfTheNight">منتصف الليل</SelectItem>
                <SelectItem value="SeventhOfTheNight">سُبع الليل</SelectItem>
                <SelectItem value="TwilightAngle">زاوية الشفق</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Suspense fallback={<div className="pts-timetable-skel" aria-hidden="true" />}>
            <PrayerAnnualTimetable />
          </Suspense>
        </div>
      </details>
    </div>
  ) : null;

  const shortcuts = (
    <nav className="pts-dock" aria-label="أدوات الصلاة">
      <Link href="/adhkar" className="pts-dock__item">
        <span className="pts-dock__icon"><HandHeart size={18} strokeWidth={1.8} /></span>
        <span>الأذكار</span>
      </Link>
      <Link href="/tasbih" className="pts-dock__item">
        <span className="pts-dock__icon"><CircleDot size={18} strokeWidth={1.8} /></span>
        <span>التسبيح</span>
      </Link>
      <Link href="/adhan-settings" className="pts-dock__item">
        <span className="pts-dock__icon"><Bell size={18} strokeWidth={1.8} /></span>
        <span>تنبيهات الأذان</span>
      </Link>
      <Link href="/qibla" className="pts-dock__item">
        <span className="pts-dock__icon"><Compass size={18} strokeWidth={1.8} /></span>
        <span>القبلة</span>
      </Link>
    </nav>
  );

  // هيكل فوري — سطح زيتوني محجوز المساحة؛ بلا إطار أبيض أو hint كريمي
  // slot يتغير عند تبديل الصلاة/السماح فقط — لا كل ثانية
  if (!slot) {
    return (
      <div className="pts-screen pts-screen--with-nav pts-screen--boot" dir="rtl">
        {headerChrome}
        {toolsBar}
        {locationPanel}
        {loading ? (
          <div role="status" aria-busy="true" aria-label="تحديث المواقيت">
            <div className="pts-boot-hero" aria-hidden="true" />
            <div className="pts-boot-row" aria-hidden="true" />
            <div className="pts-boot-row" aria-hidden="true" />
            <div className="pts-boot-row" aria-hidden="true" />
            <div className="pts-boot-row" aria-hidden="true" />
            <div className="pts-boot-row" aria-hidden="true" />
          </div>
        ) : (
          <p className="pts-error" role="alert">
            اختر مدينتك لعرض مواقيت الصلاة بدقة. لا نعرض أوقاتًا تقديرية.
          </p>
        )}
        {!govOpen && (
          <Button
            type="button"
            className="pts-retry"
            onClick={() => setGovOpen(true)}
            aria-label="اختيار المدينة" variant="primary">
            اختيار المدينة
          </Button>
        )}
        <Button type="button" className="pts-retry pts-retry--ghost" onClick={reload} aria-label="إعادة محاولة تحميل المواقيت" variant="ghost">
          إعادة المحاولة
        </Button>
        {shortcuts}
      </div>
    );
  }

  const prayers: PrayerSlot[] = (data?.prayers ?? []).filter((p) => p.time);
  const nowInfo = zoneNowSeconds(timeZone);
  const inGrace = !pinnedKey && slot.inGrace;
  const ranKey = slot.nextKey;
  const displayKey = pinnedKey ?? (inGrace ? ranKey : slot.nextKey);
  const displayItem = prayers.find((p) => p.key === displayKey);
  const displayName = PRAYER_AR[displayKey] ?? slot.nextName;
  const hijriStr = formatHijri(data?.date?.hijri ?? null);

  let isTomorrow = false;
  if (pinnedKey && pinnedKey !== slot.nextKey) {
    isTomorrow = secondsUntilPrayer(displayItem?.minutes ?? null, timeZone).isTomorrow;
  }

  const heroStatus = pinnedKey && pinnedKey !== slot.nextKey
    ? (isTomorrow ? "غداً" : "قادمة")
    : inGrace
      ? "انتهت"
      : "قادمة";

  const heroLabel = pinnedKey && pinnedKey !== slot.nextKey
    ? "الوقت المتبقي لـ"
    : inGrace
      ? "مضى على الأذان"
      : "الصلاة القادمة";

  const isNext = (key: string) => key === slot.nextKey;
  const isPinned = (key: string) => key === displayKey;
  const isPast = (p: PrayerSlot) =>
    p.minutes != null && p.minutes < nowInfo.totalMinutes && !isNext(p.key) && !(inGrace && p.key === ranKey);

  const visibleRanks = ranksOpen ? RANKS : RANKS.slice(0, 2);

  return (
    <DashboardScreen compose="mark">
    <div className="pts-screen pts-screen--with-nav" dir="rtl">
      {headerChrome}
      {hijriStr ? <p className="pts-hijri">{hijriStr}</p> : null}

      <section className="pts-hero pts-hero--compact" aria-label="العداد التنازلي">
        <div className="pts-hero__content">
          <div className="pts-hero__status-row">
            <p className="pts-hero__label">{heroLabel}</p>
            <span className={`pts-badge pts-badge--${inGrace && !pinnedKey ? "done" : "next"}`}>
              {heroStatus}
            </span>
          </div>
          <h2 className="pts-hero__name">
            {displayKey === "Sunrise" ? displayName : `صلاة ${displayName}`}
          </h2>
          {displayItem ? (
            <p className="pts-hero__clock" dir="ltr">
              <span className="pts-hero__clock-label">وقت الأذان</span>
              <span className="pts-hero__clock-value">{displayTime12(displayItem)}</span>
            </p>
          ) : null}
          <div
            className="pts-hero__countdown"
            dir="ltr"
            aria-live="polite"
            aria-atomic="true"
            aria-label={inGrace && !pinnedKey ? "مضى على الأذان" : "الوقت المتبقي"}
          >
            <span className="pts-hero__countdown-label">
              {inGrace && !pinnedKey ? "مضى" : "متبقي"}
            </span>
            <PrayerHeroCountdownValue
              pinnedKey={pinnedKey}
              displayMinutes={displayItem?.minutes ?? null}
              timeZone={timeZone}
              inGrace={inGrace}
              nextKey={slot.nextKey}
            />
          </div>
          {inGrace && !pinnedKey && (
            <p className="pts-hero__hint">حتى مرور ٣٥ دقيقة ثم الانتقال للصلاة التالية</p>
          )}
          {pinnedKey && pinnedKey !== slot.nextKey && (
            <Button type="button" className="pts-hero__reset" onClick={() => setPinnedKey(null)} variant="ghost">
              العودة للصلاة القادمة
            </Button>
          )}
        </div>
      </section>

      {toolsBar}
      {locationPanel}
      {shortcuts}

      <section className="pts-ranks" aria-labelledby="pts-ranks-title">
        <div className="pts-ranks__head">
          <h2 id="pts-ranks-title" className="pts-ranks__title">مراتب الناس في الصلاة</h2>
          <Link href="/prayer-ranks" className="pts-ranks__more">
            التفاصيل
          </Link>
        </div>
        <ol className="pts-ranks__list">
          {visibleRanks.map((rank, index) => (
            <li key={rank.title} className="pts-ranks__item">
              <span className="pts-ranks__num">{toArabicDigits(index + 1)}</span>
              <div className="pts-ranks__body">
                <p className="pts-ranks__label">{rank.label}</p>
                <p className="pts-ranks__ruling">{rank.ruling}</p>
              </div>
            </li>
          ))}
        </ol>
        {RANKS.length > 2 && (
          <Button
            type="button"
            className="pts-ranks__toggle"
            onClick={() => setRanksOpen((v) => !v)}
            aria-expanded={ranksOpen} variant="ghost">
            {ranksOpen ? "طيّ القائمة" : "عرض الكل"}
          </Button>
        )}
      </section>

      {prayers.length > 0 && (
        <nav className="pts-list" aria-label="صلوات اليوم">
          {prayers.map((p) => {
            const next = isNext(p.key);
            const pinned = isPinned(p.key);
            const past = isPast(p);
            const status = rowStatusLabel(p.key, slot.nextKey, inGrace, ranKey, past);
            return (
              <Button
                key={p.key}
                type="button"
                className={[
                  "pts-row",
                  next || (inGrace && p.key === ranKey) ? "pts-row--next" : "",
                  pinned && !next ? "pts-row--pinned" : "",
                  past ? "pts-row--past" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setPinnedKey(p.key === pinnedKey ? null : p.key)}
                aria-pressed={pinned}
                aria-label={`${PRAYER_AR[p.key] ?? p.name}، ${displayTime12(p)}، ${status}`} variant="ghost">
                <span className="pts-row__meta">
                  <span className="pts-row__name">{PRAYER_AR[p.key] ?? p.name}</span>
                  <span className="pts-row__status">{status}</span>
                </span>
                {next || (inGrace && p.key === ranKey) ? (
                  <span className="pts-row__mark" aria-hidden="true" />
                ) : null}
                <span className="pts-row__time" dir="ltr">{displayTime12(p)}</span>
              </Button>
            );
          })}
        </nav>
      )}
    </div>
    </DashboardScreen>
  );
}
