/**
 * تلاوة هجينة: القارئ المتوفّر في Quran Foundation يُشغَّل من ملف QF نفسه مع توقيت آيات دقيق
 * من الرد ذاته (بلا تحجيم)، وغيره يبقى على mp3quran + التقدير النسبي.
 *
 * خلف راية `VITE_QF_RECITATION_AUDIO` (مطفأة افتراضيًا). المفاتيح عند الخادم فقط:
 * العميل يطلب `/api/qf-chapter-audio` (lib/api-handlers/qf-chapter-audio.js) الذي يحقن رؤوس QF.
 * لا تدخل ملفات QF التنزيلات الدائمة (شروط QF: تخزين ≤ أسبوع) — الذاكرة للجلسة فقط.
 */
import { getSurahAudioUrl } from "@/lib/quran-audio";
import { isReciterDisabled } from "@/lib/quran-audio-remote-config";
import { parseQuranComChapterTimings, type AyahTiming } from "@/lib/surah-ayah-timing";

export const QF_RECITATION_AUDIO_FLAG = "ssunnah.qf_recitation_audio";
export const QF_CHAPTER_AUDIO_ENDPOINT = "/api/qf-chapter-audio";
const QF_TIMEOUT_MS = 6000;

/**
 * معرّف القارئ في التطبيق → recitation id في QF (GET /api/v4/resources/recitations، فحص 2026-10-06).
 * طابق الهوية والأسلوب (مرتّل): عبد الباسط 2 لا المجوّد 1، والمنشاوي 9 لا المجوّد 8، والحصري 6 لا المعلّم 12.
 * مستبعد: 11 «الطبلاوي» لأن ملفاته فعليًا abdul_muhsin_alqasim (خلل بيانات في QF).
 */
export const QF_RECITATION_BY_RECITER: Readonly<Record<string, number>> = {
  abdulsamad: 2,
  sudais: 3,
  shatri: 4,
  rifai: 5,
  husary: 6,
  alafasy: 7,
  minshawi: 9,
  shuraim: 10,
};

/** مطفأة افتراضيًا؛ لا تُفعَّل بالدمج وحده. */
export function isQfRecitationAudioEnabled(): boolean {
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_QF_RECITATION_AUDIO;
    if (v === "1" || v === "true") return true;
  } catch {
    /* ignore */
  }
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(QF_RECITATION_AUDIO_FLAG) === "1";
  } catch {
    return false;
  }
}

export type SurahStream = {
  url: string;
  provider: "qf" | "mp3quran";
  /** توقيت دقيق من QF لنفس الملف؛ null ⇒ يستعمل المشغّل التقدير النسبي. */
  timings: AyahTiming[] | null;
};

const qfCache = new Map<string, { url: string; timings: AyahTiming[] }>();

async function fetchQfChapter(recitation: number, surah: number) {
  const key = `${recitation}:${surah}`;
  const hit = qfCache.get(key);
  if (hit) return hit;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), QF_TIMEOUT_MS);
  try {
    const res = await fetch(`${QF_CHAPTER_AUDIO_ENDPOINT}?recitation=${recitation}&chapter=${surah}`, {
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { audio_file?: { audio_url?: unknown } };
    const url = json?.audio_file?.audio_url;
    const timings = parseQuranComChapterTimings(json);
    if (typeof url !== "string" || !url.startsWith("https://") || !timings) return null;
    const entry = { url, timings };
    qfCache.set(key, entry);
    return entry;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** مصدر بث السورة: QF عند الراية + قارئ مربوط + نجاح الطلب، وإلا mp3quran بلا تغيير. */
export async function resolveSurahStream(surah: number, reciterId: string): Promise<SurahStream> {
  const recitation = QF_RECITATION_BY_RECITER[reciterId];
  if (recitation && isQfRecitationAudioEnabled() && !isReciterDisabled(reciterId)) {
    const qf = await fetchQfChapter(recitation, surah);
    if (qf) return { url: qf.url, provider: "qf", timings: qf.timings };
  }
  return { url: getSurahAudioUrl(surah, reciterId), provider: "mp3quran", timings: null };
}
