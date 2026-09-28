/**
 * سياسة resolve بين localStorage و Capacitor Preferences للمصحف الحي.
 *
 * قواعد بلا timestamps مصطنعة:
 * 1) قيمة واحدة فقط → اعتمدها.
 * 2) كلاهما موجود ومتطابق → LS.
 * 3) كلاهما موجود ومختلف على native → Preferences (طبقة دائمة أصلية)،
 *    مع نسخ LS القديمة إلى مفتاح backup.
 * 4) فشل/timeout Preferences → أبقِ LS دون استبدال.
 */

export type ResolveSource = "local" | "preferences" | "none" | "equal";

export type ResolveResult = {
  value: string | null;
  source: ResolveSource;
  conflict: boolean;
  backedUp: boolean;
};

export function resolveMushafStorageValue(opts: {
  localValue: string | null | undefined;
  prefsValue: string | null | undefined;
  preferNative: boolean;
}): ResolveResult {
  const local =
    opts.localValue == null || opts.localValue === "" ? null : String(opts.localValue);
  const prefs =
    opts.prefsValue == null || opts.prefsValue === "" ? null : String(opts.prefsValue);

  if (local == null && prefs == null) {
    return { value: null, source: "none", conflict: false, backedUp: false };
  }
  if (local == null && prefs != null) {
    return { value: prefs, source: "preferences", conflict: false, backedUp: false };
  }
  if (local != null && prefs == null) {
    return { value: local, source: "local", conflict: false, backedUp: false };
  }
  if (local === prefs) {
    return { value: local, source: "equal", conflict: false, backedUp: false };
  }
  // تعارض حقيقي
  if (opts.preferNative) {
    return { value: prefs, source: "preferences", conflict: true, backedUp: true };
  }
  return { value: local, source: "local", conflict: true, backedUp: false };
}
