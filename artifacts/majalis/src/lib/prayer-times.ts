import { toArabicIndicDigits } from "@/lib/numerals";
import { DEFAULT_ELAPSED_WINDOW_MINUTES, resolvePrayerPhase, type PhaseSlot } from "@/lib/prayer-phase";
import {
  getPrayerCalcMethod,
  prayerCalcMethodCacheId,
  prayerCalcMethodLabel,
  resolveAdhanParams,
  type PrayerCalcMethodId,
} from "@/lib/prayer-calc-prefs";
import {
  getSelectedGovernorate,
  setSelectedGovernorate,
  KUWAIT_GOVERNORATES,
  type KuwaitGovernorate,
} from "@/lib/prayer-kuwait-geo";
import {
  getActivePrayerLocation,
  prayerLocationCacheId,
  type PrayerActiveLocation,
} from "@/lib/prayer-location-prefs";

export { KUWAIT_GOVERNORATES, getSelectedGovernorate, setSelectedGovernorate };
export type { KuwaitGovernorate };

// ─── Kuwait Governorates (re-exported from prayer-kuwait-geo) ───────────────

const PRAYER_CACHE_KEY = "majalis-prayer-cache-v2";
/** @deprecated legacy cache id — kept for one-release migration reads */
const LEGACY_PRAYER_METHOD_ID = "kuwait-mwl-v1";

function activePrayerMethodId(): string {
  return prayerCalcMethodCacheId(getPrayerCalcMethod());
}

type PrayerDayCache = {
  method: string;
  govId: string;
  byDate: Record<string, PrayerTimesPayload>;
  updatedAt: string;
};

/** أوقات تقديرية ثابتة — لا تُعرض كصحيحة ولا تُخزَّن في الكاش. */
export function isEstimatedPrayerPayload(
  payload: PrayerTimesPayload | null | undefined,
): boolean {
  if (!payload) return false;
  if (payload.stale && /تقديري|بدون اتصال/i.test(payload.source || "")) return true;
  return false;
}

function readPrayerCache(): PrayerDayCache | null {
  try {
    const raw = localStorage.getItem(PRAYER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrayerDayCache;
    if (!parsed?.byDate || typeof parsed.byDate !== "object") {
      localStorage.removeItem(PRAYER_CACHE_KEY);
      return null;
    }
    let scrubbed = false;
    for (const key of Object.keys(parsed.byDate)) {
      if (isEstimatedPrayerPayload(parsed.byDate[key])) {
        delete parsed.byDate[key];
        scrubbed = true;
      }
    }
    if (scrubbed) {
      try {
        localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(parsed));
      } catch {
        /* ignore */
      }
    }
    return parsed;
  } catch {
    try {
      localStorage.removeItem(PRAYER_CACHE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

function writePrayerCache(cache: PrayerDayCache): void {
  try {
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota */
  }
}

/** قراءة فورية من الكاش — بلا شبكة ولا انتظار. */
export function getCachedPrayerTimes(governorateId?: string): PrayerTimesPayload | null {
  const loc = resolveLocationForFetch(governorateId);
  const cache = readPrayerCache();
  const methodId = activePrayerMethodId();
  const locId = prayerLocationCacheId(loc);
  if (!cache || cache.govId !== locId) return null;
  if (cache.method !== methodId && cache.method !== LEGACY_PRAYER_METHOD_ID) return null;
  if (cache.method === LEGACY_PRAYER_METHOD_ID && getPrayerCalcMethod() !== "Kuwait") return null;
  return cache.byDate[dateKeyInZone(loc.timeZone)] ?? null;
}

function putPrayerCacheDay(govId: string, dateKey: string, payload: PrayerTimesPayload): void {
  if (!payload?.ok || !payload.prayers?.length || isEstimatedPrayerPayload(payload)) return;
  const methodId = activePrayerMethodId();
  const prev = readPrayerCache();
  const byDate = prev?.govId === govId && prev.method === methodId ? { ...prev.byDate } : {};
  byDate[dateKey] = payload;
  const keys = Object.keys(byDate).sort();
  while (keys.length > 45) {
    const drop = keys.shift();
    if (drop) delete byDate[drop];
  }
  writePrayerCache({
    method: methodId,
    govId,
    byDate,
    updatedAt: new Date().toISOString(),
  });
}

function resolveLocationForFetch(governorateId?: string): PrayerActiveLocation {
  if (governorateId) {
    const gov = KUWAIT_GOVERNORATES.find((g) => g.id === governorateId) ?? KUWAIT_GOVERNORATES[0]!;
    return {
      source: "kuwait",
      label: `الكويت · ${gov.name}`,
      lat: gov.lat,
      lon: gov.lon,
      timeZone: "Asia/Kuwait",
      countryCode: "KW",
      kuwaitGovId: gov.id,
      updatedAt: new Date().toISOString(),
    };
  }
  return getActivePrayerLocation();
}

// ───────────────────────────────────────────────────────────────────────────

export type PrayerSlot = {
  key: string;
  name: string;
  obligatory: boolean;
  time24: string;
  time: string;
  minutes: number | null;
};

export type PrayerTimesPayload = {
  ok: boolean;
  city: string;
  timezone: string;
  method: string;
  source: string;
  date: {
    gregorian: string;
    hijri: string | null;
    readable: string | null;
  };
  prayers: PrayerSlot[];
  fetchedAt: string;
  stale?: boolean;
};

export type PrayerStatus = {
  current: PrayerSlot | null;
  next: PrayerSlot | null;
  previous: PrayerSlot | null;
  remainingMs: number;
  remainingLabel: string;
};

const OBLIGATORY_KEYS = new Set(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]);

const PRAYER_META = [
  { key: "Fajr", name: "الفجر", obligatory: true },
  { key: "Sunrise", name: "الشروق", obligatory: false },
  { key: "Dhuhr", name: "الظهر", obligatory: true },
  { key: "Asr", name: "العصر", obligatory: true },
  { key: "Maghrib", name: "المغرب", obligatory: true },
  { key: "Isha", name: "العشاء", obligatory: true },
];

function dateKeyInZone(timeZone: string, date = new Date(Date.now())) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuwait",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

/**
 * تاريخ تقويمي صريح لمنطقة IANA — لتمريره إلى adhan-js دون غموض
 * `new Date("YYYY-MM-DD …")` أو مكوّنات الجهاز المحلي.
 * الظهر المحلي التقريبي: منتصف الليل في المنطقة + 12 ساعة عبر إزاحة معروفة للكويت،
 * ولغيرها نستخدم أجزاء Intl ثم UTC بمقياس تقريبي آمن عبر Date.UTC عند الظهر UTC.
 */
export function calendarNoonInZone(timeZone: string, date = new Date(Date.now())): Date {
  const key = dateKeyInZone(timeZone, date);
  const [y, m, d] = key.split("-").map(Number);
  if (timeZone === "Asia/Kuwait") {
    // الكويت UTC+3 ثابت — ظهر محلي = 09:00 UTC
    return new Date(Date.UTC(y, m - 1, d, 9, 0, 0));
  }
  // مناطق أخرى: ابنِ لحظة ظهر تقريبية بمسح إزاحة من عيّنة Intl عند UTC noon
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(probe);
  const zh = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const zm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const zoneMinutesAtUtcNoon = zh * 60 + zm;
  const offsetMin = zoneMinutesAtUtcNoon - 12 * 60;
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0) - offsetMin * 60_000);
}

/** لحظة مطلقة لدقيقة من اليوم (0–1439) في منطقة IANA. */
export function epochAtZoneMinutes(
  timeZone: string,
  minutesOfDay: number,
  date = new Date(Date.now()),
): number {
  const key = dateKeyInZone(timeZone, date);
  const [y, m, d] = key.split("-").map(Number);
  if (timeZone === "Asia/Kuwait") {
    // منتصف ليل الكويت = 21:00 UTC لليوم السابق (UTC+3 ثابت)
    const dayStartUtc = Date.UTC(y, m - 1, d, 0, 0, 0) - 3 * 3600_000;
    return dayStartUtc + minutesOfDay * 60_000;
  }
  const noon = calendarNoonInZone(timeZone, date);
  const noonParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(noon);
  const nh = Number(noonParts.find((p) => p.type === "hour")?.value ?? 12);
  const nm = Number(noonParts.find((p) => p.type === "minute")?.value ?? 0);
  const noonMinutes = nh * 60 + nm;
  return noon.getTime() + (minutesOfDay - noonMinutes) * 60_000;
}

/** @deprecated use dateKeyInZone — kept for Kuwait callers */
function kuwaitDateKey(date = new Date(Date.now())) {
  return dateKeyInZone("Asia/Kuwait", date);
}

function kuwaitDateParam(date = new Date(Date.now())) {
  const parts = kuwaitDateKey(date).split("-");
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function parseTimeToMinutes(value: string) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatTime12(value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return value;
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "م" : "ص";
  const hours12 = hours24 % 12 || 12;
  return toArabicIndicDigits(`${hours12}:${String(mins).padStart(2, "0")} ${period}`);
}

function buildPayload(
  timings: Record<string, string>,
  meta: { timezone?: string } | null,
  date: any,
  cityName = "الكويت – محافظة العاصمة",
): PrayerTimesPayload {
  const prayers: PrayerSlot[] = PRAYER_META.map(({ key, name, obligatory }) => ({
    key,
    name,
    obligatory,
    time24: timings[key],
    time: formatTime12(timings[key]),
    minutes: parseTimeToMinutes(timings[key]),
  }));

  return {
    ok: true,
    city: cityName,
    timezone: meta?.timezone || "Asia/Kuwait",
    method: "Kuwait",
    source: "AlAdhan (طريقة الكويت)",
    date: {
      gregorian: date?.gregorian?.date || kuwaitDateParam(),
      hijri: date?.hijri?.date || null,
      readable: date?.readable || null,
    },
    prayers,
    fetchedAt: new Date().toISOString(),
  };
}

function toZoneTime(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const h = parts.find((p) => p.type === "hour")?.value ?? "00";
    const m = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${h}:${m}`;
  } catch {
    return toZoneTime(date, "Asia/Kuwait");
  }
}

export async function computePrayerTimesForDate(
  lat: number,
  lon: number,
  cityName: string,
  timeZone: string,
  date: Date,
  methodId: PrayerCalcMethodId = getPrayerCalcMethod(),
): Promise<PrayerTimesPayload> {
  const adhan = await import("adhan");
  const coordinates = new adhan.Coordinates(lat, lon);
  const params = resolveAdhanParams(adhan, methodId, { latitude: lat, longitude: lon });
  // مرساة ظهر تقويمي في المنطقة — لا تعتمد على تفسير الجهاز لـ Date المحلي.
  const noon = calendarNoonInZone(timeZone, date);
  const pt = new adhan.PrayerTimes(coordinates, noon, params);
  const timings: Record<string, string> = {
    Fajr: toZoneTime(pt.fajr, timeZone),
    Sunrise: toZoneTime(pt.sunrise, timeZone),
    Dhuhr: toZoneTime(pt.dhuhr, timeZone),
    Asr: toZoneTime(pt.asr, timeZone),
    Maghrib: toZoneTime(pt.maghrib, timeZone),
    Isha: toZoneTime(pt.isha, timeZone),
  };
  const readable = new Intl.DateTimeFormat("ar", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(noon);
  const gKey = dateKeyInZone(timeZone, noon);
  const [y, m, d] = gKey.split("-");
  return {
    ...buildPayload(
      timings,
      { timezone: timeZone },
      { readable, gregorian: { date: `${d}-${m}-${y}` } },
      cityName,
    ),
    method: prayerCalcMethodLabel(methodId),
    source: `حساب محلي أوفلاين (adhan-js، ${prayerCalcMethodLabel(methodId)})`,
  };
}

/**
 * المصدر الوحيد لمواقيت الصلاة في التطبيق.
 * العدّاد والإمساكية والمجدول يستهلكون هذه الدالة (عبر fetchPrayerTimes / annual).
 */
export async function getPrayerTimes(
  dateISO: string,
  location?: { lat: number; lon: number; label?: string; timeZone?: string } | string,
  methodId: PrayerCalcMethodId = getPrayerCalcMethod(),
): Promise<PrayerTimesPayload> {
  let lat: number;
  let lon: number;
  let cityName: string;
  let timeZone: string;
  if (typeof location === "string" || location == null) {
    const loc = resolveLocationForFetch(
      typeof location === "string" ? location : undefined,
    );
    lat = loc.lat;
    lon = loc.lon;
    cityName = loc.label;
    timeZone = loc.timeZone;
  } else {
    lat = location.lat;
    lon = location.lon;
    cityName = location.label ?? "موقع مخصص";
    timeZone = location.timeZone ?? "Asia/Kuwait";
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateISO)
    ? calendarNoonInZone(timeZone, new Date(`${dateISO}T12:00:00+03:00`))
    : calendarNoonInZone(timeZone, new Date(dateISO));
  return computePrayerTimesForDate(lat, lon, cityName, timeZone, date, methodId);
}

async function computePrayerTimesLocal(
  lat: number,
  lon: number,
  cityName: string,
  methodId: PrayerCalcMethodId = getPrayerCalcMethod(),
  timeZone = "Asia/Kuwait",
): Promise<PrayerTimesPayload> {
  return computePrayerTimesForDate(
    lat,
    lon,
    cityName,
    timeZone,
    calendarNoonInZone(timeZone),
    methodId,
  );
}

export function staticPrayerFallback(cityName = "الكويت – محافظة العاصمة"): PrayerTimesPayload {
  const month = new Date().getMonth() + 1;
  const isSummer = month >= 5 && month <= 9;
  const timings: Record<string, string> = isSummer
    ? { Fajr: "04:00", Sunrise: "05:30", Dhuhr: "12:05", Asr: "16:35", Maghrib: "19:10", Isha: "20:35" }
    : { Fajr: "05:10", Sunrise: "06:30", Dhuhr: "12:00", Asr: "15:05", Maghrib: "17:25", Isha: "18:45" };
  const readable = new Intl.DateTimeFormat("ar-KW", {
    timeZone: "Asia/Kuwait",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  return {
    ...buildPayload(timings, { timezone: "Asia/Kuwait" }, { readable }, cityName),
    source: "تقديري (بدون اتصال)",
    stale: true,
  };
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} س ${minutes} د`;
  }
  if (minutes > 0) {
    return `${minutes} د ${seconds} ث`;
  }
  return `${seconds} ث`;
}

export type PrayerCountdown = PrayerStatus & {
  remainingHms: string;
  /** ثواني مضت منذ أذان الصلاة التي دخل وقتها (خلال نافذة «مضى على الأذان»)، وإلا null */
  sinceSeconds: number | null;
  /** HH:MM:SS تصاعدي منذ الأذان الأخير (نفس sinceSeconds مُنسَّقًا)، وإلا null */
  sinceHms: string | null;
  /** طول نافذة «مضى على الأذان» بالثواني (إقامة المستخدم أو 30 دقيقة) */
  elapsedWindowSeconds: number;
  /** ثواني متبقية للصلاة التالية الفعلية أثناء فترة السماح، وإلا null */
  graceNextSeconds: number | null;
  /** HH:MM:SS للصلاة التالية الفعلية أثناء فترة السماح، وإلا null */
  graceNextHms: string | null;
  /** الصلاة الفعلية التالية (بعد التي أذّنت للتو) أثناء فترة السماح، وإلا null */
  graceNextSlot: PrayerSlot | null;
};

function formatHms(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return toArabicIndicDigits(
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  );
}

export type PrayerPhaseOptions = {
  /** نافذة «مضى على الأذان» بالدقائق (resolveElapsedWindowMinutes) — الافتراضي 30 */
  elapsedWindowMinutes?: number;
  /** لحظة الحساب (للاختبار)؛ الافتراضي Date.now() */
  nowMs?: number;
};

/** أذانات الفروض للأمس واليوم والغد كـepoch — مدخل resolvePrayerPhase. */
function buildPhaseSlots(prayers: PrayerSlot[], timeZone: string, nowMs: number): PhaseSlot[] {
  const noon = calendarNoonInZone(timeZone, new Date(nowMs));
  const out: PhaseSlot[] = [];
  for (const p of prayers) {
    if (!OBLIGATORY_KEYS.has(p.key) || p.minutes == null) continue;
    for (const dayOffset of [-1, 0, 1]) {
      const day = new Date(noon.getTime() + dayOffset * 24 * 3600_000);
      out.push({ key: p.key, epochMs: epochAtZoneMinutes(timeZone, p.minutes, day) });
    }
  }
  return out;
}

function slotByKey(prayers: PrayerSlot[], key: string | undefined | null): PrayerSlot | null {
  return key ? prayers.find((p) => p.key === key) ?? null : null;
}

export function computePrayerCountdown(
  prayers: PrayerSlot[],
  timeZone = "Asia/Kuwait",
  opts: PrayerPhaseOptions = {},
): PrayerCountdown {
  const nowMs = opts.nowMs ?? Date.now();
  const windowMinutes = opts.elapsedWindowMinutes ?? DEFAULT_ELAPSED_WINDOW_MINUTES;
  const phase = resolvePrayerPhase(buildPhaseSlots(prayers, timeZone, nowMs), nowMs, windowMinutes);
  const status = computePrayerStatus(prayers, timeZone, opts);

  let remainingSeconds = 0;
  let sinceSeconds: number | null = null;
  let graceNextSeconds: number | null = null;
  let graceNextSlot: PrayerSlot | null = null;

  if (phase.kind === "elapsed") {
    sinceSeconds = Math.floor(phase.elapsedMs / 1000);
    if (phase.next) {
      graceNextSlot = slotByKey(prayers, phase.next.key);
      graceNextSeconds = Math.max(0, Math.ceil((phase.next.epochMs - nowMs) / 1000));
    }
  } else if (phase.kind === "countdown") {
    remainingSeconds = Math.max(0, Math.ceil(phase.remainingMs / 1000));
  }

  return {
    ...status,
    remainingMs: remainingSeconds * 1000,
    remainingLabel: formatHms(remainingSeconds),
    remainingHms: formatHms(remainingSeconds),
    sinceSeconds,
    sinceHms: sinceSeconds != null ? formatHms(sinceSeconds) : null,
    elapsedWindowSeconds: Math.max(0, windowMinutes) * 60,
    graceNextSeconds,
    graceNextHms: graceNextSeconds != null ? formatHms(graceNextSeconds) : null,
    graceNextSlot,
  };
}

export function computePrayerStatus(
  prayers: PrayerSlot[],
  timeZone = "Asia/Kuwait",
  opts: PrayerPhaseOptions = {},
): PrayerStatus {
  const nowMs = opts.nowMs ?? Date.now();
  const windowMinutes = opts.elapsedWindowMinutes ?? DEFAULT_ELAPSED_WINDOW_MINUTES;
  const obligatory = prayers.filter((p) => OBLIGATORY_KEYS.has(p.key) && p.minutes != null);
  const phase = resolvePrayerPhase(buildPhaseSlots(prayers, timeZone, nowMs), nowMs, windowMinutes);
  const lastObligatory = obligatory[obligatory.length - 1] ?? null;

  let next: PrayerSlot | null;
  let previous: PrayerSlot | null = null;
  let remainingMs = 0;

  if (phase.kind === "elapsed") {
    // خلال النافذة تبقى «القادمة» هي التي دخل وقتها (يظهر مضى X على أذانها)
    next = slotByKey(prayers, phase.prayer.key);
    previous = slotByKey(prayers, phase.previous?.key);
  } else if (phase.kind === "countdown") {
    next = slotByKey(prayers, phase.next.key);
    previous = slotByKey(prayers, phase.previous?.key);
    remainingMs = phase.remainingMs;
  } else {
    next = obligatory[0] ?? null;
  }
  previous = previous ?? lastObligatory;

  return {
    current: previous,
    next,
    previous,
    remainingMs,
    remainingLabel: formatRemaining(remainingMs),
  };
}

/**
 * مواقيت فورية: كاش → حساب محلي أوفلاين → fallback ثابت.
 * الشبكة تُحدَّث اختياريًا في الخلفية لمواقع الكويت فقط ولا تُعيق الفتح.
 */
export async function fetchPrayerTimes(governorateId?: string): Promise<PrayerTimesPayload> {
  const loc = resolveLocationForFetch(governorateId);
  const cityName = loc.label;
  const locId = prayerLocationCacheId(loc);
  const dateKey = dateKeyInZone(loc.timeZone);

  const cached = getCachedPrayerTimes(governorateId);
  if (cached?.ok && cached.prayers?.length) {
    if (loc.source === "kuwait") void refreshPrayerTimesInBackground(loc.kuwaitGovId);
    return cached;
  }

  try {
    const local = await computePrayerTimesLocal(
      loc.lat,
      loc.lon,
      cityName,
      getPrayerCalcMethod(),
      loc.timeZone,
    );
    putPrayerCacheDay(locId, dateKey, local);
    void warmPrayerCacheAhead(loc, 30);
    if (loc.source === "kuwait") void refreshPrayerTimesInBackground(loc.kuwaitGovId);
    return local;
  } catch {
    /* continue */
  }

  /* لا نخزّن ولا نُرجع أوقاتًا وهمية كأنها صحيحة — الواجهة تعرض اختيار المدينة */
  if (loc.source === "kuwait") void refreshPrayerTimesInBackground(loc.kuwaitGovId);
  return {
    ok: false,
    city: cityName,
    timezone: loc.timeZone,
    method: prayerCalcMethodLabel(getPrayerCalcMethod()),
    source: "غير متوفر",
    date: { gregorian: dateKey, hijri: null, readable: null },
    prayers: [],
    fetchedAt: new Date().toISOString(),
    stale: true,
  };
}

/**
 * تحديث خلفي من المصدر الوحيد (adhan-js) فقط.
 * لا يستبدل الكاش بمصادر شبكة (Supabase / API / AlAdhan) — كانت تسبب العطل (ب).
 */
export async function refreshPrayerTimesInBackground(governorateId?: string): Promise<void> {
  try {
    const loc = resolveLocationForFetch(governorateId);
    const dateKey = dateKeyInZone(loc.timeZone);
    const payload = await computePrayerTimesForDate(
      loc.lat,
      loc.lon,
      loc.label,
      loc.timeZone,
      calendarNoonInZone(loc.timeZone),
      getPrayerCalcMethod(),
    );
    putPrayerCacheDay(prayerLocationCacheId(loc), dateKey, payload);
    void warmPrayerCacheAhead(loc, 2);
  } catch {
    /* ignore background errors */
  }
}

/** حساب مسبق لـ N يوماً محلياً وتعبئة الكاش. */
export async function warmPrayerCacheAhead(
  locOrGov: PrayerActiveLocation | KuwaitGovernorate,
  days = 30,
): Promise<void> {
  try {
    const loc: PrayerActiveLocation =
      "timeZone" in locOrGov
        ? locOrGov
        : {
            source: "kuwait",
            label: `الكويت · ${locOrGov.name}`,
            lat: locOrGov.lat,
            lon: locOrGov.lon,
            timeZone: "Asia/Kuwait",
            kuwaitGovId: locOrGov.id,
            countryCode: "KW",
            updatedAt: new Date().toISOString(),
          };
    const locId = prayerLocationCacheId(loc);
    const methodId = getPrayerCalcMethod();
    const methodLabel = prayerCalcMethodLabel(methodId);
    for (let i = 0; i < days; i++) {
      const base = calendarNoonInZone(loc.timeZone);
      const d = new Date(base.getTime() + i * 24 * 3600_000);
      const dateKey = dateKeyInZone(loc.timeZone, d);
      const existing = readPrayerCache();
      if (
        existing?.govId === locId &&
        existing.method === activePrayerMethodId() &&
        existing.byDate[dateKey]?.ok
      ) {
        continue;
      }
      const payload = await computePrayerTimesForDate(
        loc.lat,
        loc.lon,
        loc.label,
        loc.timeZone,
        d,
        methodId,
      );
      putPrayerCacheDay(locId, dateKey, {
        ...payload,
        method: methodLabel,
      });
    }
  } catch {
    /* ignore */
  }
}
