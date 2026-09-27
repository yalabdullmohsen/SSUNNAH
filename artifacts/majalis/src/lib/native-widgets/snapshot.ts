import { ADHKAR_CATEGORIES, ADHKAR_ITEMS } from "@/lib/adhkar-seed";
import { loadLastPageSync } from "@/lib/quran-last-page";
import {
  computePrayerStatus,
  type PrayerTimesPayload,
} from "@/lib/prayer-times";
import { widgetHttpsUrl } from "./deep-links";
import { readWidgetPrefs } from "./prefs";
import {
  WIDGET_SNAPSHOT_VERSION,
  type SunnahWidgetSnapshot,
  type WidgetPrayerSnap,
  type WidgetTextSnap,
} from "./types";

function dayBucket(ms = Date.now()): number {
  return Math.floor(ms / 86_400_000);
}

function pickAdhkar(): WidgetTextSnap | undefined {
  const hour = new Date().getHours();
  const slug =
    hour >= 4 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "evening" : hour >= 18 || hour < 4 ? "evening" : "sleep";
  const cat =
    ADHKAR_CATEGORIES.find((c) => c.slug === slug) ||
    ADHKAR_CATEGORIES.find((c) => c.slug === "morning");
  if (!cat) return undefined;
  const items = ADHKAR_ITEMS.filter((i) => i.categoryId === cat.id && i.grade !== "ضعيف");
  if (!items.length) return undefined;
  const item = items[dayBucket() % items.length]!;
  return {
    text: item.text,
    source: item.reference || item.source,
    category: cat.name,
    href: `/adhkar/${cat.slug}`,
  };
}

function buildPrayerSnap(payload: PrayerTimesPayload): WidgetPrayerSnap {
  const status = computePrayerStatus(payload.prayers, payload.timezone);
  const map = (slot: typeof status.current) =>
    slot
      ? {
          key: slot.key,
          nameAr: slot.name,
          time24: slot.time24,
          timeLabel: slot.time,
        }
      : null;
  return {
    current: map(status.current),
    next: map(status.next),
    remainingMs: status.remainingMs,
    remainingLabel: status.remainingLabel,
    city: payload.city,
    hijri: payload.date.hijri,
    gregorian: payload.date.gregorian,
    method: payload.method,
  };
}

/**
 * يبني لقطة ودجت من مواقيت موجودة + أذكار معتمدة + موضع مصحف.
 * لا يعدّل محرك الصلاة ولا يلمس نص القرآن.
 */
export function buildWidgetSnapshot(payload?: PrayerTimesPayload | null): SunnahWidgetSnapshot {
  const prefs = readWidgetPrefs();
  const snap: SunnahWidgetSnapshot = {
    version: WIDGET_SNAPSHOT_VERSION,
    updatedAt: new Date().toISOString(),
    locale: prefs.locale,
    smartKinds: prefs.contentTypes,
  };

  if (payload?.ok && payload.prayers?.length) {
    snap.prayer = buildPrayerSnap(payload);
  }

  if (prefs.contentTypes.includes("dhikr") || prefs.enabledKinds.includes("daily_adhkar")) {
    snap.adhkar = pickAdhkar();
  }

  /* آية يومية: تُضاف في مرحلة لاحقة من مجموعة معتمدة — لا اختراع نص قرآني هنا. */

  try {
    const page = loadLastPageSync();
    if (page != null) {
      snap.mushafResume = {
        surah: 0,
        ayah: 0,
        surahName: "",
        label: `صفحة ${page}`,
        href: `/mushaf?page=${page}`,
      };
    }
  } catch {
    /* ignore */
  }

  return snap;
}

export function serializeWidgetSnapshot(snap: SunnahWidgetSnapshot): string {
  return JSON.stringify(snap);
}

export function parseWidgetSnapshot(raw: string): SunnahWidgetSnapshot | null {
  try {
    const o = JSON.parse(raw) as SunnahWidgetSnapshot;
    if (!o || o.version !== WIDGET_SNAPSHOT_VERSION) return null;
    if (typeof o.updatedAt !== "string") return null;
    return o;
  } catch {
    return null;
  }
}

export function widgetOpenUrlForPrayer(): string {
  return widgetHttpsUrl("/prayer-times");
}
