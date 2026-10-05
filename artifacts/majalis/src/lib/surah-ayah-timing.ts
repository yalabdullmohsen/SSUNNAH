/**
 * توقيت الآيات على ملف سورة كاملة — تقدير محلي أو مقاطع quran.com عند التوفّر.
 */

export type AyahTiming = {
  ayahNumber: number;
  startTime: number;
  endTime: number;
};

const timingCache = new Map<string, AyahTiming[]>();

function cacheKey(surah: number, reciterId: string): string {
  return `${reciterId}:${surah}`;
}

/** يُوزّع مدة السورة على الآيات بحسب طول النص (بدون تعديل النص). */
export function buildProportionalAyahTimings(
  ayahs: Array<{ numberInSurah: number; text: string }>,
  durationSec: number,
  introPadSec = 0.35,
): AyahTiming[] {
  const safeDuration = Math.max(durationSec, 1);
  const weights = ayahs.map((a) => Math.max(stripDiacriticsForWeight(a.text).length, 1));
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const usable = Math.max(safeDuration - introPadSec, 0.5);
  let cursor = introPadSec;

  return ayahs.map((ayah, idx) => {
    const slice = (weights[idx]! / totalWeight) * usable;
    const startTime = cursor;
    const endTime = idx === ayahs.length - 1 ? safeDuration : cursor + slice;
    cursor = endTime;
    return { ayahNumber: ayah.numberInSurah, startTime, endTime };
  });
}

function stripDiacriticsForWeight(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s\uFEFF]/g, "");
}

export function findAyahAtTime(timings: AyahTiming[], currentTime: number): number | null {
  if (!timings.length) return null;
  const hit = timings.find((t) => currentTime >= t.startTime && currentTime < t.endTime);
  if (hit) return hit.ayahNumber;
  if (currentTime >= timings[timings.length - 1]!.endTime) {
    return timings[timings.length - 1]!.ayahNumber;
  }
  return timings[0]!.ayahNumber;
}

/** مقاطع quran.com عند الاتصال — يُخزَّن في الذاكرة للجلسة. */
export async function resolveSurahAyahTimings(
  surah: number,
  reciterId: string,
  durationSec: number,
  ayahs: Array<{ numberInSurah: number; text: string }>,
  signal?: AbortSignal,
): Promise<{ timings: AyahTiming[]; precise: boolean }> {
  const key = cacheKey(surah, reciterId);
  const cached = timingCache.get(key);
  if (cached) return { timings: cached, precise: true };

  const remote = await fetchQuranComSegmentTimings(surah, reciterId, signal);
  if (remote && remote.length > 0) {
    timingCache.set(key, remote);
    return { timings: remote, precise: true };
  }

  const proportional = buildProportionalAyahTimings(ayahs, durationSec);
  return { timings: proportional, precise: false };
}

async function fetchQuranComSegmentTimings(
  surah: number,
  reciterId: string,
  signal?: AbortSignal,
): Promise<AyahTiming[] | null> {
  const recitationId = QURAN_COM_RECITATION_BY_RECITER[reciterId];
  if (!recitationId) return null;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${recitationId}/${surah}?segments=true`,
      { signal },
    );
    if (!res.ok) return null;
    return parseQuranComChapterTimings(await res.json());
  } catch {
    return null;
  }
}

/** يحوّل `audio_file.timestamps[]` (verse_key + timestamp_from/to بالمللي ثانية) إلى توقيتات بالثواني. */
export function parseQuranComChapterTimings(json: unknown): AyahTiming[] | null {
  const timestamps = (
    json as {
      audio_file?: {
        timestamps?: Array<{ verse_key?: string; timestamp_from?: number; timestamp_to?: number }>;
      };
    } | null
  )?.audio_file?.timestamps;
  if (!Array.isArray(timestamps)) return null;

  const timings: AyahTiming[] = [];
  for (const t of timestamps) {
    const ayahNumber = Number(t.verse_key?.split(":")[1]);
    if (!Number.isInteger(ayahNumber) || typeof t.timestamp_from !== "number" || typeof t.timestamp_to !== "number") {
      continue;
    }
    timings.push({ ayahNumber, startTime: t.timestamp_from / 1000, endTime: t.timestamp_to / 1000 });
  }
  timings.sort((a, b) => a.ayahNumber - b.ayahNumber);
  return timings.length > 0 ? timings : null;
}

/**
 * معرّف القارئ في التطبيق → recitation id في Quran Foundation (api/v4).
 * لا يُربط قارئ إلا إذا كان ملف السورة الذي يشغّله التطبيق هو نفس تسجيل QF (التوقيتات بالمللي ثانية على ذلك الملف).
 * فحص 2026-10-06: كل ملفات mp3quran (getSurahAudioUrl) تسجيلات/تحريرات مختلفة عن ملفات download.quranicaudio.com/qdc
 * (فارق مدة غير ثابت 1–12ث على الفاتحة والإخلاص والعصر، وبعضها أقصر) ⇒ لا ربط حاليًا، ويعمل التقدير النسبي.
 * أضف قارئًا هنا فقط بعد التحقق من تطابق الملف نفسه.
 */
export const QURAN_COM_RECITATION_BY_RECITER: Readonly<Record<string, number>> = {};

export function scaleTimingsToDuration(timings: AyahTiming[], durationSec: number): AyahTiming[] {
  if (!timings.length || durationSec <= 0) return timings;
  const srcEnd = timings[timings.length - 1]!.endTime;
  if (srcEnd <= 0 || Math.abs(srcEnd - durationSec) < 0.5) return timings;
  const ratio = durationSec / srcEnd;
  return timings.map((t) => ({
    ayahNumber: t.ayahNumber,
    startTime: t.startTime * ratio,
    endTime: t.endTime * ratio,
  }));
}
