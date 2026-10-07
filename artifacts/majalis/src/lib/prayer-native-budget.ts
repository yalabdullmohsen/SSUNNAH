/**
 * ميزانية الإشعارات الأصلية للصلاة — مصدر واحد تتفق عليه جدولتا التنبيهات (prayer-alert-scheduler)
 * ومقاطع الأذان الكامل على iOS (adhan-scheduler / adhan-ios-segments).
 *
 * حد iOS: 64 إشعارًا معلّقًا. حصة الصلاة 40 (تنبيهات + مقاطع أذان معًا)، والـ24 الباقية
 * للورد والذكر والمراجعة وتذكيرات الأذكار — فلا تجور الصلاة على حصة الأذكار.
 *
 * النافذة تصل إلى 7 أيام وتُقصّ بالميزانية من الأبعد: الأقرب أولًا دائمًا،
 * وأقرب `FULL_ADHAN_CHAIN_SLOTS` صلوات بأذان كامل متعدد المقاطع، وما بعدها بمقطع قصير واحد.
 * ملف نقي بلا استيرادات ليُختبر مباشرة.
 */

export const IOS_PENDING_LIMIT = 64;
/** حصة الصلاة من حد iOS (تنبيهات + مقاطع الأذان). */
export const PRAYER_NATIVE_SHARE = 40;
export const NATIVE_WINDOW_DAYS = 7;
/** عدد أقرب الصلوات التي تأخذ أذانًا كاملًا متعدد المقاطع. */
export const FULL_ADHAN_CHAIN_SLOTS = 4;

export type WindowSlotInput = {
  /** عدد التنبيهات المفعّلة لهذه الصلاة (قبل/دخول/بعد/إقامة) بعد استبعاد الدخول إن تولّته مقاطع الأذان. */
  alertCount: number;
  /** هل يُجدول لهذه الصلاة أذان كامل على iOS. */
  iosFullAdhan: boolean;
  /** عدد مقاطع الأذان الكامل لهذه الصلاة (≤4). */
  chainLength: number;
};

export type WindowSlotPlan = {
  include: boolean;
  segmentMode: "none" | "full" | "short";
  segmentCount: number;
  cost: number;
};

/**
 * مرحلتان: (1) تغطية الأيام أولًا — كل صلاة بكلفتها الدنيا (تنبيهاتها + مقطع أذان قصير واحد) من الأقرب
 * حتى تنفد الحصة (أول صلاة لا تتسع تقطع النافذة؛ لا فجوات في المنتصف)، فتصل التغطية إلى 7 أيام حين تتسع.
 * (2) ما تبقّى من الحصة يرقّي أقرب الصلوات (حتى `fullChainSlots`) من مقطع قصير إلى أذان كامل متعدد المقاطع.
 */
export function planPrayerNativeWindow(
  slots: readonly WindowSlotInput[],
  opts: { share?: number; fullChainSlots?: number } = {},
): WindowSlotPlan[] {
  const share = opts.share ?? PRAYER_NATIVE_SHARE;
  const fullSlots = opts.fullChainSlots ?? FULL_ADHAN_CHAIN_SLOTS;

  const minCost = slots.map((s) => s.alertCount + (s.iosFullAdhan ? 1 : 0));
  let used = 0;
  let cut = slots.length;
  for (let i = 0; i < slots.length; i++) {
    if (used + minCost[i] > share) {
      cut = i;
      break;
    }
    used += minCost[i];
  }

  const plans: WindowSlotPlan[] = slots.map((s, i) =>
    i < cut
      ? {
          include: true,
          segmentMode: s.iosFullAdhan ? "short" : "none",
          segmentCount: s.iosFullAdhan ? 1 : 0,
          cost: minCost[i],
        }
      : { include: false, segmentMode: "none", segmentCount: 0, cost: 0 },
  );

  let leftover = share - used;
  let upgraded = 0;
  for (let i = 0; i < cut && upgraded < fullSlots; i++) {
    const s = slots[i];
    if (!s.iosFullAdhan) continue;
    const chain = Math.max(1, Math.min(4, Math.floor(s.chainLength) || 1));
    const extra = chain - 1;
    if (extra > 0 && leftover >= extra) {
      plans[i] = { include: true, segmentMode: "full", segmentCount: chain, cost: s.alertCount + chain };
      leftover -= extra;
      upgraded += 1;
    }
  }
  return plans;
}

/** مجموع الإشعارات المخطّطة — لا يتجاوز حصة الصلاة أبدًا. */
export function plannedNativeCount(plans: readonly WindowSlotPlan[]): number {
  return plans.reduce((n, p) => n + (p.include ? p.cost : 0), 0);
}

/**
 * معرّفات مقاطع الأذان: تجزئة حتمية لـ(الصلاة، اليوم المحلي) مع تحقيق خطّي حتى لا يتصادم معرّفان
 * (التصادم يلغي أذان صلاة بصمت). تبقى حتمية بين الجلسات فتستبدل إعادة الجدولة نفس المعرّف لا تكرّره.
 */
export const ADHAN_SEGMENT_ID_BASE = 710_000;
export const ADHAN_SEGMENT_ID_SPAN = 20_000;
const ID_STRIDE = 4; // أقصى مقاطع للسلسلة

export function assignAdhanChainIdBases(keys: readonly string[]): Map<string, number> {
  const out = new Map<string, number>();
  const taken = new Set<number>();
  for (const key of keys) {
    if (out.has(key)) continue;
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const slots = Math.floor(ADHAN_SEGMENT_ID_SPAN / ID_STRIDE);
    let idx = h % slots;
    let guard = 0;
    while (taken.has(idx) && guard++ < slots) idx = (idx + 1) % slots;
    taken.add(idx);
    out.set(key, ADHAN_SEGMENT_ID_BASE + idx * ID_STRIDE);
  }
  return out;
}
