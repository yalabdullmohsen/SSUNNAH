/**
 * Canonical widget envelope publisher.
 * Reads existing app engines / daily content. Does not recalculate prayer or Hijri math in Swift.
 */
import { isIOS, isNative } from "@/lib/capacitor-utils";
import {
  DAILY_FAIDA_POOL,
  getDailyAyah,
  getDailyDhikr,
  getDailyFaida,
  getDailyHadith,
  getDayIndex,
  pickDailyItem,
} from "@/lib/daily-content";
import { DAILY_TICKER_DHIKR } from "@/lib/daily-ticker-dhikr";
import { resolveTimeOfDay } from "@/lib/daily-context";
import { getTodayProgress } from "@/lib/daily-progress";
import { ISLAMIC_OCCASIONS } from "@/lib/islamic-occasions-seed";
import { loadLastPageSync, TOTAL_QURAN_PAGES } from "@/lib/quran-last-page";
import { getMyBookmarks } from "@/lib/quran-my-bookmarks";
import { getSurahForPage, getSurahMeta } from "@/lib/quran-api";
import { getUserStreak } from "@/lib/user-streak";
import { getActivePrayerLocation } from "@/lib/prayer-location-prefs";
import { dateISOInZone } from "@/lib/prayer-notification-ids";
import { buildSharedPrayerSnapshotPayload } from "./sunnah-shared-prayer-publish";
import { publishSharedWidgetEnvelope } from "./sunnah-shared-data";
import type { PrayerTimesPayload } from "../prayer-times";

const ADHKAR_BY_TIME: Record<string, { collection: string; title: string }> = {
  fajr: { collection: "morning", title: "أذكار الصباح" },
  duha: { collection: "morning", title: "أذكار الصباح" },
  zuhr: { collection: "after-salah", title: "أذكار بعد الصلاة" },
  asr: { collection: "evening", title: "أذكار المساء" },
  maghrib: { collection: "evening", title: "أذكار المساء" },
  isha: { collection: "evening", title: "أذكار المساء" },
  layl: { collection: "sleep", title: "أذكار النوم" },
};

const HIJRI_MONTHS_AR = [
  "",
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

export const SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION = 1;
export const SUNNAH_WIDGET_ENVELOPE_KEY = "sunnah.shared.envelope.v1";

function hijriParts(now: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = fmt.formatToParts(now);
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value || 0);
  return { day: num("day"), month: num("month"), year: num("year") };
}

function weekdayAr(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("ar", { timeZone, weekday: "long" }).format(now);
}

function gregorianDisplay(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("ar", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

function hijriDisplay(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

function daysUntilRamadan(now: Date, timeZone: string): { inRamadan: boolean; days: number | null } {
  const today = hijriParts(now, timeZone);
  if (today.month === 9) return { inRamadan: true, days: 0 };
  const cursor = new Date(now);
  for (let i = 1; i <= 400; i += 1) {
    cursor.setTime(now.getTime() + i * 86400000);
    const h = hijriParts(cursor, timeZone);
    if (h.month === 9 && h.day === 1) return { inRamadan: false, days: i };
  }
  return { inRamadan: false, days: null };
}

function upcomingIslamicEvent(now: Date, timeZone: string): { name: string; days: number; id: string } | null {
  const today = hijriParts(now, timeZone);
  let best: { name: string; days: number; id: string } | null = null;
  for (const occasion of ISLAMIC_OCCASIONS) {
    if (!occasion.recurring || occasion.hijriMonth < 1) continue;
    let months = occasion.hijriMonth - today.month;
    if (months < 0) months += 12;
    let days = occasion.hijriDay - today.day + months * 29.5;
    if (days < 0) days += 354;
    const rounded = Math.round(days);
    if (!best || rounded < best.days) {
      best = { name: occasion.name, days: rounded, id: occasion.id };
    }
  }
  return best;
}

function surahNumberFromReference(reference: string, fallback = 1): number {
  const m = reference.match(/(\d+)\s*:\s*\d+/);
  if (!m) return fallback;
  return Number(m[1]) || fallback;
}

function safeDailyDua(now: Date) {
  const duas = DAILY_TICKER_DHIKR.filter(
    (item) => item.text.includes("اللَّهُمَّ") || item.text.includes("أَعُوذُ"),
  );
  return pickDailyItem(duas.length > 0 ? duas : DAILY_TICKER_DHIKR, now);
}

function latestBookmark() {
  try {
    const list = getMyBookmarks();
    return list[0] ?? null;
  } catch {
    return null;
  }
}

function safeProgress() {
  try {
    return getTodayProgress();
  } catch {
    return {
      wird: 0,
      "morning-adhkar": 0,
      "evening-adhkar": 0,
      nawafil: 0,
      tasbih: 0,
      quran: 0,
    };
  }
}

function safeStreakDays(): number | null {
  try {
    const streak = getUserStreak().currentStreak;
    return streak > 0 ? streak : null;
  } catch {
    return null;
  }
}

export function buildSunnahWidgetEnvelope(
  now: Date = new Date(),
  prayerPayload?: ReturnType<typeof buildSharedPrayerSnapshotPayload> | null,
): Record<string, unknown> {
  const tz = prayerPayload?.timeZoneIdentifier || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const hijri = hijriParts(now, tz);
  const ramadan = daysUntilRamadan(now, tz);
  const event = upcomingIslamicEvent(now, tz);
  const timeOfDay = resolveTimeOfDay(now.getHours() + now.getMinutes() / 60);
  const adhkarMap = ADHKAR_BY_TIME[timeOfDay] ?? ADHKAR_BY_TIME.duha;
  const ayah = getDailyAyah(now);
  const dhikr = getDailyDhikr(now);
  const hadith = getDailyHadith(now);
  const faidah = DAILY_FAIDA_POOL.length > 0 ? getDailyFaida(now) : null;
  const dua = safeDailyDua(now);
  const lastPage = loadLastPageSync();
  const lastSurah = lastPage != null ? getSurahForPage(lastPage) : null;
  const bookmark = latestBookmark();
  const bookmarkSurah = bookmark
    ? getSurahMeta(Number(bookmark.ayahKey.split(":")[0]) || 1)
    : null;
  const bookmarkAyah = bookmark ? Number(bookmark.ayahKey.split(":")[1]) || null : null;
  const progress = safeProgress();
  const streakDays = safeStreakDays();
  const ayahSurahNumber = surahNumberFromReference(ayah.reference);
  const generatedAt = now.getTime();
  const hasCanonicalTracking =
    progress["morning-adhkar"] > 0 ||
    progress["evening-adhkar"] > 0 ||
    progress.quran > 0 ||
    progress.wird > 0 ||
    streakDays != null ||
    lastPage != null;
  const mushafPercent =
    lastPage != null ? Math.min(100, Math.round((lastPage / TOTAL_QURAN_PAGES) * 100)) : null;

  return {
    schemaVersion: SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION,
    generatedAtEpochMs: generatedAt,
    expiresAtEpochMs: generatedAt + 36 * 3600_000,
    timezoneIdentifier: tz,
    localeIdentifier: "ar",
    prayerPayload: prayerPayload
      ? {
          schemaVersion: 1,
          ...prayerPayload,
          updatedAtEpochMs: generatedAt,
        }
      : undefined,
    calendarPayload: {
      schemaVersion: 1,
      timezoneIdentifier: tz,
      weekdayAr: weekdayAr(now, tz),
      hijriDay: hijri.day,
      hijriMonth: hijri.month,
      hijriMonthAr: HIJRI_MONTHS_AR[hijri.month] || "",
      hijriYear: hijri.year,
      hijriDisplay: hijriDisplay(now, tz),
      gregorianDisplay: gregorianDisplay(now, tz),
      inRamadan: ramadan.inRamadan,
      daysUntilRamadan: ramadan.days,
      ramadanLabelAr: ramadan.inRamadan ? "رمضان مبارك" : "باقي على رمضان",
      upcomingEventNameAr: event?.name ?? null,
      upcomingEventDays: event?.days ?? null,
      upcomingEventPath: "/occasions",
      updatedAtEpochMs: generatedAt,
    },
    adhkarPayload: {
      schemaVersion: 1,
      activeCollection: adhkarMap.collection,
      activeTitleAr: adhkarMap.title,
      morningTitleAr: "أذكار الصباح",
      eveningTitleAr: "أذكار المساء",
      morningActionAr: "ابدأ ورد الصباح",
      eveningActionAr: "ابدأ ورد المساء",
      rotatingText: dhikr.text,
      rotatingSource: dhikr.source,
      rotatingCollection: dhikr.category,
      rotationDayKey: dateISOInZone(tz, now),
      todayCompleted: progress["morning-adhkar"] > 0 || progress["evening-adhkar"] > 0,
      streakDays,
      hasCanonicalProgress: hasCanonicalTracking,
      updatedAtEpochMs: generatedAt,
    },
    quranPayload: {
      schemaVersion: 1,
      ayahText: ayah.text,
      surahNameAr: ayah.surah.replace(/^سورة\s+/, ""),
      surahNumber: ayahSurahNumber,
      ayahNumber: ayah.ayahNumber,
      page: lastPage,
      deepLinkPath: `/mushaf?ayah=${ayahSurahNumber}:${ayah.ayahNumber}`,
      pagesCompletedToday: progress.quran,
      dailyTarget: 1,
      hasCanonicalGoal: hasCanonicalTracking,
      updatedAtEpochMs: generatedAt,
    },
    mushafPayload: {
      schemaVersion: 1,
      lastSurahNameAr: lastSurah?.name ?? null,
      lastSurahNumber: lastSurah?.number ?? null,
      lastPage,
      lastAyahNumber: null,
      bookmarkSurahNameAr: bookmarkSurah?.name ?? null,
      bookmarkSurahNumber: bookmarkSurah?.number ?? null,
      bookmarkPage: bookmark?.page ?? lastPage,
      bookmarkAyahNumber: bookmarkAyah,
      hasProgress: lastPage != null,
      hasBookmark: bookmark != null,
      journeyPercent: mushafPercent,
      updatedAtEpochMs: generatedAt,
    },
    customContentPayload: {
      schemaVersion: 1,
      items: [
        {
          id: `ayah:${ayah.id}`,
          contentType: "ayah",
          titleAr: "آية",
          text: ayah.text,
          source: ayah.reference,
          deepLinkPath: `/mushaf?ayah=${ayahSurahNumber}:${ayah.ayahNumber}`,
        },
        {
          id: `hadith:${hadith.id}`,
          contentType: "hadith",
          titleAr: "حديث",
          text: hadith.text,
          source: hadith.source,
          deepLinkPath: "/hadith",
        },
        {
          id: `dhikr:${dhikr.id}`,
          contentType: "dhikr",
          titleAr: "ذكر",
          text: dhikr.text,
          source: dhikr.source,
          deepLinkPath: "/adhkar/morning",
        },
        {
          id: `dua:${dua.id}`,
          contentType: "dua",
          titleAr: "دعاء",
          text: dua.text,
          source: dua.source,
          deepLinkPath: "/adhkar",
        },
        ...(faidah
          ? [
              {
                id: `faidah:${faidah.id}`,
                contentType: "faidah",
                titleAr: "فائدة",
                text: faidah.text,
                source: faidah.source || faidah.author_name,
                deepLinkPath: "/",
              },
            ]
          : []),
      ],
      updatedAtEpochMs: generatedAt,
    },
    preferencesPayload: {
      schemaVersion: 1,
      appearance: "fullColor",
      showSource: true,
      compactText: false,
      updatedAtEpochMs: generatedAt,
    },
    progressPayload: {
      schemaVersion: 1,
      hasCanonicalTracking,
      morningAdhkarDone: progress["morning-adhkar"] > 0,
      eveningAdhkarDone: progress["evening-adhkar"] > 0,
      quranDone: progress.quran > 0,
      wirdDone: progress.wird > 0,
      adhkarStreakDays: streakDays,
      pagesCompletedToday: progress.quran,
      dailyPageTarget: 1,
      mushafPercent,
      currentAdhkarTitleAr: adhkarMap.title,
      updatedAtEpochMs: generatedAt,
    },
    contentSpotlightPayload: {
      schemaVersion: 1,
      hadithText: hadith.text,
      hadithSource: hadith.source,
      hadithPath: "/hadith",
      faidahText: faidah?.text || "افتح سُنّة لعرض الفائدة",
      faidahSource: faidah?.source || faidah?.author_name || null,
      faidahPath: "/",
      duaText: dua.text,
      duaSource: dua.source || null,
      duaPath: "/adhkar",
      updatedAtEpochMs: generatedAt,
    },
    dayIndex: getDayIndex(now),
  };
}

export async function publishSunnahWidgetEnvelope(options?: {
  domains?: string[];
  prayerTimes?: PrayerTimesPayload | null;
}): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  try {
    const prayer = options?.prayerTimes
      ? buildSharedPrayerSnapshotPayload(options.prayerTimes)
      : null;
    const envelope = buildSunnahWidgetEnvelope(new Date(), prayer);
    return await publishSharedWidgetEnvelope(
      JSON.stringify(envelope),
      options?.domains ?? ["calendar", "adhkar", "quran", "mushaf", "custom", "home"],
    );
  } catch {
    return false;
  }
}
