import { useSyncExternalStore } from "react";

type SyncListener = () => void;

/** تحديد يدوي (فتح أدوات الآية) */
let manuallySelectedVerseKey: string | null = null;
/** تمييز تلاوة */
let audioHighlightedVerseKey: string | null = null;
/** تمييز تنقّل سياقي من أقسام أخرى — لا يفتح تفسيرًا ولا أدواتًا */
let navigationHighlightedVerseKey: string | null = null;
/** تمييز نتيجة بحث داخل المصحف — طبقة مستقلة */
let searchHighlightVerseKey: string | null = null;

const listeners = new Set<SyncListener>();

/** تجميع إشعارات التلاوة/التحديد في إطار رسم واحد — يقلل عواصف setState أثناء الصوت */
let emitRaf: number | null = null;

function flushEmit(): void {
  emitRaf = null;
  for (const fn of listeners) {
    fn();
  }
}

function emit(): void {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    flushEmit();
    return;
  }
  if (emitRaf != null) return;
  emitRaf = window.requestAnimationFrame(flushEmit);
}

/** توافق خلفي: selected = يدوي، playing = صوت */
export function setMushafAyahSyncKeys(selected: string | null, playing: string | null): void {
  if (manuallySelectedVerseKey === selected && audioHighlightedVerseKey === playing) return;
  manuallySelectedVerseKey = selected;
  audioHighlightedVerseKey = playing;
  emit();
}

export function setNavigationHighlightedAyahId(verseKey: string | null): void {
  if (navigationHighlightedVerseKey === verseKey) return;
  navigationHighlightedVerseKey = verseKey;
  emit();
}

export function getNavigationHighlightedAyahId(): string | null {
  return navigationHighlightedVerseKey;
}

export function getMushafAyahSyncKeys(): {
  selected: string | null;
  playing: string | null;
  navigation: string | null;
} {
  return {
    selected: manuallySelectedVerseKey,
    playing: audioHighlightedVerseKey,
    navigation: navigationHighlightedVerseKey,
  };
}

export function setMushafAyahSearchHighlight(verseKey: string | null): void {
  if (searchHighlightVerseKey === verseKey) return;
  searchHighlightVerseKey = verseKey;
  emit();
}

export function getMushafAyahSearchHighlight(): string | null {
  return searchHighlightVerseKey;
}

function subscribe(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** لا اشتراك — ألواح غير مستقرة/غير حالية أثناء التقليب (يمنع fan-out ×3) */
function subscribeNoop(_listener: SyncListener): () => void {
  return () => undefined;
}

/**
 * لقطة مفاتيح التمييز الثلاثة في اشتراك واحد — لتقليل useSyncExternalStore لكل كلمة.
 * WAVE6+/radical: سطر واحد يشترك بدل 3×N كلمات.
 */
export type MushafHighlightKeysSnapshot = {
  selected: string | null;
  playing: string | null;
  search: string | null;
};

const EMPTY_HIGHLIGHT_KEYS: MushafHighlightKeysSnapshot = {
  selected: null,
  playing: null,
  search: null,
};

/** لقطة ثابتة المرجع طالما المفاتيح لم تتغير — شرط useSyncExternalStore */
let cachedHighlightKeys: MushafHighlightKeysSnapshot = EMPTY_HIGHLIGHT_KEYS;

function getHighlightKeysSnapshot(): MushafHighlightKeysSnapshot {
  if (
    cachedHighlightKeys.selected === manuallySelectedVerseKey &&
    cachedHighlightKeys.playing === audioHighlightedVerseKey &&
    cachedHighlightKeys.search === searchHighlightVerseKey
  ) {
    return cachedHighlightKeys;
  }
  cachedHighlightKeys = {
    selected: manuallySelectedVerseKey,
    playing: audioHighlightedVerseKey,
    search: searchHighlightVerseKey,
  };
  return cachedHighlightKeys;
}

export function useMushafHighlightKeys(enabled = true): MushafHighlightKeysSnapshot {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? getHighlightKeysSnapshot() : EMPTY_HIGHLIGHT_KEYS),
    () => EMPTY_HIGHLIGHT_KEYS,
  );
}

/** لقطة طبقة التحديد (selected/playing/navigation) — اشتراك واحد بدل 3 hooks في AyahSelectionOverlay */
export type MushafOverlayKeysSnapshot = {
  selected: string | null;
  playing: string | null;
  navigation: string | null;
};

const EMPTY_OVERLAY_KEYS: MushafOverlayKeysSnapshot = {
  selected: null,
  playing: null,
  navigation: null,
};

let cachedOverlayKeys: MushafOverlayKeysSnapshot = EMPTY_OVERLAY_KEYS;

function getOverlayKeysSnapshot(): MushafOverlayKeysSnapshot {
  if (
    cachedOverlayKeys.selected === manuallySelectedVerseKey &&
    cachedOverlayKeys.playing === audioHighlightedVerseKey &&
    cachedOverlayKeys.navigation === navigationHighlightedVerseKey
  ) {
    return cachedOverlayKeys;
  }
  cachedOverlayKeys = {
    selected: manuallySelectedVerseKey,
    playing: audioHighlightedVerseKey,
    navigation: navigationHighlightedVerseKey,
  };
  return cachedOverlayKeys;
}

export function useMushafOverlayKeys(enabled = true): MushafOverlayKeysSnapshot {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? getOverlayKeysSnapshot() : EMPTY_OVERLAY_KEYS),
    () => EMPTY_OVERLAY_KEYS,
  );
}

/**
 * اشتراك محلي — تحديد يدوي فقط (التنقّل عبر overlay بلا تغيير لون الحبر).
 * `enabled=false` → subscribeNoop (لا إعادة رسم عند تغيّر التحديد/التلاوة/البحث).
 */
export function useMushafAyahWordSelected(verseKey: string, enabled = true): boolean {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? manuallySelectedVerseKey === verseKey : false),
    () => false,
  );
}

export function useMushafAyahWordPlaying(verseKey: string, enabled = true): boolean {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? audioHighlightedVerseKey === verseKey : false),
    () => false,
  );
}

export function useMushafAyahWordNavigation(verseKey: string, enabled = true): boolean {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? navigationHighlightedVerseKey === verseKey : false),
    () => false,
  );
}

export function useMushafAyahWordSearchHighlight(verseKey: string, enabled = true): boolean {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNoop,
    () => (enabled ? searchHighlightVerseKey === verseKey : false),
    () => false,
  );
}

/** مفتاح الآية الجارية فقط — لطبقة التظليل دون props من الصفحة. */
export function useMushafAyahPlayingKey(): string | null {
  return useSyncExternalStore(subscribe, () => audioHighlightedVerseKey, () => null);
}

/** مفتاح الآية المحددة يدويًا — لطبقة التحديد السطري. */
export function useMushafAyahSelectedKey(): string | null {
  return useSyncExternalStore(subscribe, () => manuallySelectedVerseKey, () => null);
}

/** مفتاح تمييز التنقّل السياقي */
export function useMushafAyahNavigationKey(): string | null {
  return useSyncExternalStore(subscribe, () => navigationHighlightedVerseKey, () => null);
}

export function resetMushafAyahSyncStoreForTests(): void {
  manuallySelectedVerseKey = null;
  audioHighlightedVerseKey = null;
  navigationHighlightedVerseKey = null;
  searchHighlightVerseKey = null;
  cachedHighlightKeys = EMPTY_HIGHLIGHT_KEYS;
  cachedOverlayKeys = EMPTY_OVERLAY_KEYS;
  if (emitRaf != null && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(emitRaf);
  }
  emitRaf = null;
  listeners.clear();
}
