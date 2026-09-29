/**
 * قياس مساحة VisualViewport لمحرر الإدخال (فاصل/علامة المصحف).
 * منطق نقي قابل للاختبار — بلا DOM.
 */

export type VisualViewportLike = {
  height: number;
  offsetTop: number;
};

export type InputSheetViewportMetrics = {
  /** top لـ position:fixed بالنسبة لـ layout viewport */
  offsetTop: number;
  /** ارتفاع الغلاف المرئي فوق الكيبورد */
  height: number;
  /** ارتفاع الكيبورد (أو الفجوة تحت VV) — للتشخيص/الـCSS */
  keyboardInset: number;
  /** هل اعتُبر الوضع overlay (VV لم ينكمش والكيبورد يغطي) */
  overlayMode: boolean;
};

export type MeasureInputSheetViewportInput = {
  innerHeight: number;
  visualViewport: VisualViewportLike | null;
  /** من Capacitor Keyboard.getHeight / willShow — 0 إن غير متوفر */
  capacitorKeyboardHeight?: number;
  /** --keyboard-inset من الجذر إن وُجد (px) */
  rootKeyboardInsetPx?: number;
  /**
   * ارتفاع النافذة وقت الراحة (بدون كيبورد) — لتمييز resize=body
   * عن overlay عندما يكون gap تحت VV صغيرًا.
   */
  restingInnerHeight?: number;
};

/**
 * يحسب مستطيل الغلاف فوق لوحة المفاتيح.
 * - الوضع الاعتيادي: يطابق visualViewport (height + offsetTop).
 * - وضع overlay: عندما لا ينكمش VV/inner لكن ارتفاع الكيبورد معروف.
 * لا يعتمد على ارتفاع الشاشة الثابت وحده.
 */
export function measureInputSheetViewport(
  input: MeasureInputSheetViewportInput,
): InputSheetViewportMetrics {
  const innerH = Math.max(0, Math.round(input.innerHeight));
  const vv = input.visualViewport;
  const vvH = vv ? Math.max(0, Math.round(vv.height)) : innerH;
  const vvTop = vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;
  const gapBelowVv = Math.max(0, innerH - vvTop - vvH);
  const capKb = Math.max(0, Math.round(input.capacitorKeyboardHeight ?? 0));
  const rootKb = Math.max(0, Math.round(input.rootKeyboardInsetPx ?? 0));
  const reportedKb = Math.max(capKb, rootKb);
  const resting = Math.max(innerH, Math.round(input.restingInnerHeight ?? innerH));

  /* body/layout انكمش مسبقًا مع الكيبورد — لا تخصم reportedKb مرة ثانية */
  const bodyAlreadyResized = resting - innerH > 80;
  /* VV نفسه انكمش بما يكفي لاعتبار الكيبورد محسوبًا */
  const vvAccountsForKeyboard = gapBelowVv >= 48 || vvH <= innerH - 48;

  const overlayMode =
    !bodyAlreadyResized &&
    !vvAccountsForKeyboard &&
    reportedKb > 80 &&
    innerH > 200;

  if (overlayMode) {
    const height = Math.max(120, innerH - reportedKb);
    return {
      offsetTop: 0,
      height,
      keyboardInset: reportedKb,
      overlayMode: true,
    };
  }

  /* resize=body: innerH منكمش وVV ≈ inner — استخدم المساحة الظاهرة كما هي */
  if (bodyAlreadyResized && !vvAccountsForKeyboard) {
    return {
      offsetTop: 0,
      height: Math.max(120, innerH),
      keyboardInset: Math.max(0, resting - innerH),
      overlayMode: false,
    };
  }

  return {
    offsetTop: vvTop,
    height: Math.max(120, vvH),
    keyboardInset: gapBelowVv,
    overlayMode: false,
  };
}

/** مقاسات اختبار إلزامية (عرض×ارتفاع منطقي قبل الكيبورد) */
export const BOOKMARK_EDITOR_VIEWPORT_FIXTURES = [
  { name: "iPhoneSE-ish", width: 375, height: 667, keyboard: 280 },
  { name: "iPhone12-ish", width: 390, height: 844, keyboard: 336 },
  { name: "iPhone14ProMax-ish", width: 430, height: 932, keyboard: 346 },
] as const;

/** أقل ارتفاع مقبول للغلاف فوق الكيبورد على المقاسات الإلزامية */
export const MIN_SHEET_HEIGHT_ABOVE_KEYBOARD = 120;

/**
 * يتحقق أن مستطيل الغلاف يقع داخل المساحة المرئية فوق الكيبورد.
 */
export function assertSheetFitsVisibleViewport(
  metrics: InputSheetViewportMetrics,
  visibleTop: number,
  visibleBottom: number,
): boolean {
  const sheetTop = metrics.offsetTop;
  const sheetBottom = metrics.offsetTop + metrics.height;
  return (
    metrics.height >= MIN_SHEET_HEIGHT_ABOVE_KEYBOARD &&
    sheetTop >= visibleTop - 1 &&
    sheetBottom <= visibleBottom + 1
  );
}
