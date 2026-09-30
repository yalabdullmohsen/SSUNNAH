/**
 * Dark deferred absorb (FINAL Program Phase 3) — محمّل ليلي واحد.
 *
 * يمنع إعادة import() لنفس طبقات surfaces / design-system / premium بعد idle
 * عندما حُمِّلت عند إقلاع داكن (Vite يخزّن الوحدة فلا يُعاد حقن CSS؛ إعادة الاستدعاء
 * كانت توهّم «reload-to-win» بلا أثر cascade حقيقي).
 *
 * لا لوحة ليل جديدة — فقط تنسيق تحميل طبقات ACTIVE_COMPATIBILITY القائمة.
 */

let corePromise: Promise<void> | null = null;
let luxuryNightV2Promise: Promise<void> | null = null;
let identityLuxuryPromise: Promise<void> | null = null;

/** طبقات العقد الليلي الأساسية (surfaces + design-system + premium refine). */
export function ensureDarkCoreLayers(): Promise<void> {
  if (!corePromise) {
    corePromise = Promise.all([
      import("../styles/dark-mode-surfaces.css"),
      import("../styles/dark-design-system.css"),
      import("../styles/premium-dark-refine.css"),
    ]).then(() => undefined);
  }
  return corePromise;
}

/** Luxury Night V2 — إقلاع داكن + تبديل ليلي (App). */
export function ensureLuxuryNightV2(): Promise<void> {
  if (!luxuryNightV2Promise) {
    luxuryNightV2Promise = import("../styles/pages/luxury-night-v2.css").then(() => undefined);
  }
  return luxuryNightV2Promise;
}

/** هوية luxury night — من App فقط (ليست في CSS الحرج / main). */
export function ensureIdentityLuxuryNight(): Promise<void> {
  if (!identityLuxuryPromise) {
    identityLuxuryPromise = import("../styles/sunnah-identity-luxury-night.css").then(
      () => undefined,
    );
  }
  return identityLuxuryPromise;
}

/** إقلاع داكن: أساسي + luxury-night-v2 (نفس عقد boot السابق). */
export function ensureDarkLayersForBoot(): Promise<void> {
  return Promise.all([ensureDarkCoreLayers(), ensureLuxuryNightV2()]).then(() => undefined);
}

/** تبديل الثيم إلى ليلي من React. */
export function ensureDarkLayersForThemeSwitch(): Promise<void> {
  return ensureDarkCoreLayers();
}

/** مسار App data-v2-night. */
export function ensureDarkLuxuryBundle(): Promise<void> {
  return Promise.all([ensureLuxuryNightV2(), ensureIdentityLuxuryNight()]).then(() => undefined);
}

export function isDarkCoreLoadStarted(): boolean {
  return corePromise !== null;
}
