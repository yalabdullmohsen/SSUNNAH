/**
 * رموز تفاعل سُنّة — مدد/منحنيات/عتبات موحّدة.
 * ممنوع قيم عشوائية داخل الشاشات؛ استورد من هنا أو من CSS vars.
 */

export const MOTION_DURATION_MS = {
  instant: 80,
  fast: 140,
  standard: 200,
  emphasized: 280,
} as const;

export const MOTION_EASING = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  enter: "cubic-bezier(0, 0, 0, 1)",
  exit: "cubic-bezier(0.3, 0, 1, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/** نوابض خفيفة — للاستخدام مع CSS/WAAPI فقط عند الحاجة */
export const MOTION_SPRING = {
  soft: { stiffness: 320, damping: 28 },
  snappy: { stiffness: 480, damping: 36 },
} as const;

export const GESTURE_THRESHOLDS = {
  /** px — انحراف مسموح قبل إلغاء النقرة */
  tapSlopPx: 10,
  /** px — بدء السحب الأفقي */
  swipeThresholdPx: 48,
  /** px — تفعيل السحب */
  dragActivationPx: 8,
  /** px/ms — سرعة الإفلات */
  velocityThresholdPxPerMs: 0.35,
  /** ms */
  longPressMs: 420,
  /** نسبة إزاحة الورقة للإغلاق */
  sheetDismissRatio: 0.28,
  /** px — منطقة حافة الرجوع RTL/LTR */
  edgeSwipeRegionPx: 28,
} as const;

export type HapticToken = "selection" | "lightImpact" | "success" | "warning" | "error";

export const HAPTIC_POLICY = {
  /** لا اهتزاز أثناء التمرير */
  onScroll: false as const,
  /** اهتزاز عند التحديد المهم فقط */
  tokens: ["selection", "lightImpact", "success", "warning", "error"] as const satisfies readonly HapticToken[],
} as const;

export type InteractionState =
  | "idle"
  | "hovered"
  | "focused"
  | "pressed"
  | "selected"
  | "loading"
  | "disabled"
  | "success"
  | "error";

/**
 * Product vocabulary for interactive states (Phase AL).
 * See docs/design/INTERACTION_AUTHORITY_MAP.md — do not invent page-local state kits.
 */
export const INTERACTION_STATE_AUTHORITY = {
  idle: "default surface (Button / AppCard / field)",
  hovered: "hover-elevate · InteractiveCard only when navigable",
  focused: "focus-visible ring · --ss-border-focus / --sf2-focus-ring",
  pressed: "active-elevate-2 · MOTION_DURATION_MS.instant",
  selected: "ContentTabs indicator · toggle selected · list selected",
  loading: "Button.loading (aria-busy) · LoadingStateV2",
  disabled: "disabled attr + muted surface (not opacity-only)",
  success: "Feedback V2 / status success roles",
  error: "FieldError · ErrorStateV2 · destructive Button",
} as const satisfies Record<InteractionState, string>;

/** ميزانية إطار حسب معدل التحديث (هدف داخلي — القياس على الجهاز مطلوب) */
export const FRAME_BUDGET_MS = {
  hz60: 16.7,
  hz90: 11.1,
  hz120: 8.3,
} as const;
