/**
 * Canonical widget envelope publisher.
 * Reads existing app engines / daily content. Does not recalculate prayer or Hijri math in Swift.
 */
import { isIOS, isNative } from "@/lib/capacitor-utils";
import {
  DAILY_FAIDA_POOL,
  getDailyDhikr,
  getDailyFaida,
  getDayIndex,
  pickDailyItem,
} from "@/lib/daily-content";
import { formatHadithAttribution, getWidgetDailyAyah, getWidgetDailyHadith } from "@/lib/widget-daily-pool";
import { DAILY_TICKER_DHIKR } from "@/lib/daily-ticker-dhikr";
import { ADHKAR_ITEMS } from "@/lib/adhkar-seed";
import { resolveTimeOfDay } from "@/lib/daily-context";
import { getTodayProgress } from "@/lib/daily-progress";
import { loadLastPageSync, TOTAL_QURAN_PAGES } from "@/lib/quran-last-page";
import { getMyBookmarks } from "@/lib/quran-my-bookmarks";
import { getSurahForPage, getSurahMeta } from "@/lib/quran-api";
import { getUserStreak } from "@/lib/user-streak";
import { getActivePrayerLocation } from "@/lib/prayer-location-prefs";
import { dateISOInZone } from "@/lib/prayer-notification-ids";
import { buildSharedPrayerSnapshotPayload } from "./sunnah-shared-prayer-publish";
import { publishSharedWidgetEnvelope, type SharedPrayerDay } from "./sunnah-shared-data";
import type { PrayerTimesPayload } from "../prayer-times";
import {
  buildDiagnosticsDomain,
  buildEnvelopeHeader,
  buildIslamicEventsDomain,
  domainMeta,
  rememberWidgetPublication,
} from "@/lib/widget-data/repository";
import { pickUpcomingWidgetEvent } from "@/lib/widget-data/islamic-events";
import { assertPublicSafeWidgetJson } from "@/lib/widget-data/privacy";
import { loadWidgetPreferences } from "@/lib/widget-data/preferences";
import { loadWidgetSelections } from "@/lib/widget-data/selections";

/** Time-of-day → Adhkar window. Mirrored by Swift `SunnahWidgetDayRollover.adhkarWindow`. */
export const WIDGET_ADHKAR_BY_TIME: Record<string, { collection: string; title: string }> = {
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

function gregorianParts(now: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
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

/** أصناف تصلح لأي ساعة (لا طعام/نوم/سفر/وضوء/مطر/دخول بيت/كرب). */
const HOURLY_DHIKR_CATEGORIES = new Set(["adh-morning", "adh-after-salah", "adh-istighfar", "adh-misc"]);
/** عناصر ليست ذكرًا قائمًا بذاته (إحالة لآية، دعاء زيارة المريض، ذكر الركوع/السجود). */
const HOURLY_DHIKR_EXCLUDED_IDS = new Set(["adh-68", "adh-105", "adh-184"]);

/** أذكار قصيرة (≤6 كلمات) من المجموعة المعتمدة حرفيًا، بلا آيات (للآية ودجت مستقل). */
export function buildHourlyDhikrPool(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of ADHKAR_ITEMS) {
    const text = item.text.trim();
    if (!HOURLY_DHIKR_CATEGORIES.has(item.categoryId) || HOURLY_DHIKR_EXCLUDED_IDS.has(item.id)) continue;
    if (/^سورة/.test(item.source ?? "")) continue;
    if (text.split(/\s+/).length > 6 || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

export function buildSunnahWidgetEnvelope(
  now: Date = new Date(),
  prayerPayload?: ReturnType<typeof buildSharedPrayerSnapshotPayload> | null,
  options?: { publicationReason?: string },
): Record<string, unknown> {
  const tz = prayerPayload?.timeZoneIdentifier || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const hijri = hijriParts(now, tz);
  const gregorian = gregorianParts(now, tz);
  const ramadan = daysUntilRamadan(now, tz);
  const timeOfDay = resolveTimeOfDay(now.getHours() + now.getMinutes() / 60);
  const adhkarMap = WIDGET_ADHKAR_BY_TIME[timeOfDay] ?? WIDGET_ADHKAR_BY_TIME.duha;
  const ayah = getWidgetDailyAyah(now);
  const dhikr = getDailyDhikr(now);
  const hadith = getWidgetDailyHadith(now);
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
  const upcoming = pickUpcomingWidgetEvent({ month: hijri.month, day: hijri.day });
  const prefs = loadWidgetPreferences();
  const selections = loadWidgetSelections();
  const calendarMode = prefs.calendarMode;
  const selectedBookmarkId = prefs.selectedMushafBookmarkId;
  const bookmarkMissing =
    typeof selectedBookmarkId === "string" &&
    selectedBookmarkId.length > 0 &&
    bookmark == null;
  const selectedCustomId = prefs.selectedCustomContentId;
  const missingSetup: string[] = [];
  if (!prayerPayload) missingSetup.push("prayer");
  if (lastPage == null) missingSetup.push("mushaf");
  if (!hasCanonicalTracking) missingSetup.push("progress");
  if (bookmarkMissing) missingSetup.push("mushaf-bookmark");
  if (typeof selectedCustomId === "string" && selectedCustomId.length > 0) {
    /* validated against items below after custom payload is built */
  }
  const header = buildEnvelopeHeader(
    generatedAt,
    tz,
    options?.publicationReason || "canonical-app-publish",
  );
  const eventsDomain = buildIslamicEventsDomain({ month: hijri.month, day: hijri.day }, generatedAt);
  const diagnostics = buildDiagnosticsDomain(generatedAt, missingSetup, []);

  const envelope = {
    ...header,
    prayerPayload: prayerPayload
      ? {
          schemaVersion: 1,
          ...prayerPayload,
          fajr: prayerPayload.timesEpochMs.fajr ?? null,
          sunrise: prayerPayload.timesEpochMs.sunrise ?? null,
          dhuhr: prayerPayload.timesEpochMs.dhuhr ?? null,
          asr: prayerPayload.timesEpochMs.asr ?? null,
          maghrib: prayerPayload.timesEpochMs.maghrib ?? null,
          isha: prayerPayload.timesEpochMs.isha ?? null,
          ...domainMeta("prayer-times", "VALID", generatedAt),
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
      hijriDate: `${hijri.year}-${String(hijri.month).padStart(2, "0")}-${String(hijri.day).padStart(2, "0")}`,
      hijriWeekday: weekdayAr(now, tz),
      gregorianDisplay: gregorianDisplay(now, tz),
      gregorianDate: dateISOInZone(tz, now),
      gregorianDay: gregorian.day,
      gregorianMonth: gregorian.month,
      gregorianYear: gregorian.year,
      gregorianWeekday: weekdayAr(now, tz),
      displayDateArabic:
        calendarMode === "gregorian"
          ? gregorianDisplay(now, tz)
          : calendarMode === "dual"
            ? `${hijriDisplay(now, tz)} · ${gregorianDisplay(now, tz)}`
            : hijriDisplay(now, tz),
      calendarMode,
      calendarAuthority: "islamic-umalqura",
      dayStartsAt: dateISOInZone(tz, now),
      inRamadan: ramadan.inRamadan,
      daysUntilRamadan: ramadan.days,
      ramadanLabelAr: ramadan.inRamadan ? "رمضان مبارك" : "باقي على رمضان",
      upcomingEventNameAr: upcoming?.titleArabic ?? null,
      upcomingEventDays: upcoming?.daysUntil ?? null,
      upcomingEventPath: "/occasions",
      upcomingEventConfirmation: upcoming?.confirmationStatus ?? null,
      upcomingEventAuthority: upcoming?.religiousAuthorityStatus ?? null,
      ...domainMeta("hijri-utils", "VALID", generatedAt),
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
      rotatingPool: buildHourlyDhikrPool(),
      rotatingCollection: dhikr.category,
      rotationDayKey: dateISOInZone(tz, now),
      timeWindows: ["morning", "evening", "sleep", "after-salah"],
      licenseStatus: "canonical-adhkar",
      widgetEligible: true,
      todayCompleted: progress["morning-adhkar"] > 0 || progress["evening-adhkar"] > 0,
      streakDays,
      hasCanonicalProgress: hasCanonicalTracking,
      ...domainMeta("adhkar-repository", dhikr.text ? "VALID" : "NO_DATA", generatedAt),
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
      textSourceVersion: "quran-api",
      licenseStatus: "canonical-quran",
      widgetEligible: true,
      reviewStatus: "CURATED_ROTATION",
      ayahWidgetMode: prefs.ayahWidgetMode,
      ...domainMeta("quran-api", ayah.text ? "VALID" : "NO_DATA", generatedAt),
      updatedAtEpochMs: generatedAt,
    },
    mushafPayload: {
      schemaVersion: 1,
      lastSurahNameAr: lastSurah?.name ?? null,
      lastSurahNumber: lastSurah?.number ?? null,
      lastPage,
      lastAyahNumber: null,
      bookmarkSurahNameAr: bookmarkMissing ? null : bookmarkSurah?.name ?? null,
      bookmarkSurahNumber: bookmarkMissing ? null : bookmarkSurah?.number ?? null,
      bookmarkPage: bookmarkMissing ? null : bookmark?.page ?? lastPage,
      bookmarkAyahNumber: bookmarkMissing ? null : bookmarkAyah,
      hasProgress: lastPage != null,
      hasBookmark: !bookmarkMissing && bookmark != null,
      progressSource: lastPage != null ? "lastPage" : "NOT_STARTED",
      syncState: "local",
      journeyPercent: mushafPercent,
      ...domainMeta(
        "quran-last-page",
        bookmarkMissing
          ? "REQUIRES_CONFIGURATION"
          : lastPage != null
            ? "VALID"
            : "REQUIRES_INITIALIZATION",
        generatedAt,
      ),
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
      appearance: prefs.widgetAppearance,
      showSource: prefs.contentSourceVisibility,
      compactText: false,
      calendarMode: prefs.calendarMode,
      numeralStyle: prefs.numeralStyle,
      prayerDisplayMode: prefs.prayerDisplayMode,
      showLocationLabel: prefs.showLocationLabel,
      showHijriDate: prefs.showHijriDate,
      showGregorianDate: prefs.showGregorianDate,
      countdownMode: prefs.countdownMode,
      preferredAdhkarCategory: prefs.preferredAdhkarCategory,
      selectedMushafBookmarkId: prefs.selectedMushafBookmarkId,
      selectedCustomContentId: prefs.selectedCustomContentId,
      privacyDisplayLevel: prefs.privacyDisplayLevel,
      ayahWidgetMode: prefs.ayahWidgetMode,
      precedence: ["app_intent_instance", "account_preference", "local_application_preference", "product_default"],
      selectionCount: selections.length,
      ...domainMeta("widget-preferences", "VALID", generatedAt),
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
      ...domainMeta(
        "daily-progress",
        hasCanonicalTracking ? "VALID" : "REQUIRES_CONFIGURATION",
        generatedAt,
      ),
      updatedAtEpochMs: generatedAt,
    },
    contentSpotlightPayload: {
      schemaVersion: 1,
      hadithText: hadith.text,
      hadithSource: formatHadithAttribution(hadith),
      hadithPath: "/hadith",
      faidahText: faidah?.text || "افتح سُنّة لعرض الفائدة",
      faidahSource: faidah?.source || faidah?.author_name || null,
      faidahPath: "/",
      duaText: dua.text,
      duaSource: dua.source || null,
      duaPath: "/adhkar",
      updatedAtEpochMs: generatedAt,
    },
    islamicEventsPayload: eventsDomain,
    hadithPayload: {
      schemaVersion: 1,
      ...domainMeta("daily-content", hadith.text ? "VALID" : "NO_DATA", generatedAt),
      shortText: hadith.text,
      source: hadith.source,
      grade: hadith.grade ?? null,
      narrator: hadith.narrator ?? null,
      deepLinkPath: "/hadith",
      widgetEligible: true,
    },
    duaPayload: {
      schemaVersion: 1,
      ...domainMeta("daily-ticker-dhikr", dua.text ? "VALID" : "NO_DATA", generatedAt),
      title: "دعاء اليوم",
      completeShortText: dua.text,
      source: dua.source || null,
      category: "GENERAL",
      deepLinkPath: "/adhkar",
      widgetEligible: true,
    },
    diagnosticsPayload: diagnostics,
    dayIndex: getDayIndex(now),
  };
  if (!assertPublicSafeWidgetJson(JSON.stringify(envelope))) {
    throw new Error("widget envelope failed privacy scan");
  }
  return envelope;
}

export async function publishSunnahWidgetEnvelope(options?: {
  domains?: string[];
  prayerTimes?: PrayerTimesPayload | null;
  upcomingDays?: SharedPrayerDay[];
  publicationReason?: string;
}): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  try {
    const prayer = options?.prayerTimes
      ? buildSharedPrayerSnapshotPayload(options.prayerTimes, Date.now(), options.upcomingDays ?? [])
      : null;
    const envelope = buildSunnahWidgetEnvelope(new Date(), prayer, {
      publicationReason: options?.publicationReason,
    });
    const ok = await publishSharedWidgetEnvelope(
      JSON.stringify(envelope),
      options?.domains ?? ["calendar", "adhkar", "quran", "mushaf", "custom", "home"],
    );
    if (ok) rememberWidgetPublication(Date.now());
    return ok;
  } catch {
    return false;
  }
}
