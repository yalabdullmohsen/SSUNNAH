/**
 * حالة جلسة التسميع داخل المصحف — دالة صرفة بلا DOM.
 * الفهرس = ترتيب الكلمة في الصفحة (بلا علامات نهاية الآية).
 */
export type TasmeeMode = "off" | "listen" | "tasmee" | "test";
export type WordMark = "ok" | "wrong" | "skipped";
export type AlertTiming = "instant" | "after-segment";

export interface AlertPrefs {
  redShade: boolean;
  haptic: boolean;
  tone: boolean;
  timing: AlertTiming;
}

export interface TasmeeState {
  mode: TasmeeMode;
  recording: boolean;
  hideAyahs: boolean;
  focusView: boolean;
  /** فهرس الكلمة التالية المنتظَرة */
  cursor: number;
  marks: Record<number, WordMark>;
  errors: number;
  peeks: number;
  /** أخطاء مؤجلة حتى نهاية المقطع */
  pendingAlerts: number;
  alerts: AlertPrefs;
}

export const DEFAULT_ALERTS: AlertPrefs = {
  redShade: true,
  haptic: true,
  tone: false,
  timing: "instant",
};

export const isActiveMode = (m: TasmeeMode) => m === "tasmee" || m === "test";

export const initialTasmeeState = (mode: TasmeeMode = "off"): TasmeeState => ({
  mode,
  recording: false,
  hideAyahs: isActiveMode(mode),
  focusView: false,
  cursor: 0,
  marks: {},
  errors: 0,
  peeks: 0,
  pendingAlerts: 0,
  alerts: DEFAULT_ALERTS,
});

export type TasmeeAction =
  | { type: "setMode"; mode: TasmeeMode }
  | { type: "toggleRecording" }
  | { type: "stopRecording" }
  | { type: "toggleHide" }
  | { type: "toggleFocusView" }
  | { type: "mark"; index: number; mark: WordMark }
  | { type: "revealNext"; total: number }
  | { type: "back"; steps: number }
  | { type: "restart" }
  | { type: "peek" }
  | { type: "alerts"; patch: Partial<AlertPrefs> }
  | { type: "flushAlerts" }
  | { type: "resetPage" };

const countErrors = (marks: Record<number, WordMark>) =>
  Object.values(marks).filter((m) => m === "wrong").length;

/** متى يُطلق التنبيه (اهتزاز/نغمة): فوري عند زيادة الأخطاء، أو عند نهاية المقطع إن كان مؤجَّلًا. */
export function alertToFire(prevErrors: number, s: TasmeeState): "instant" | "after-segment" | null {
  if (s.alerts.timing === "instant") return s.errors > prevErrors ? "instant" : null;
  return !s.recording && s.pendingAlerts > 0 ? "after-segment" : null;
}

export function tasmeeReducer(s: TasmeeState, a: TasmeeAction): TasmeeState {
  switch (a.type) {
    case "setMode":
      return { ...initialTasmeeState(a.mode), alerts: s.alerts };
    case "toggleRecording":
      return isActiveMode(s.mode) ? { ...s, recording: !s.recording } : s;
    case "stopRecording":
      return { ...s, recording: false };
    case "toggleHide":
      return { ...s, hideAyahs: !s.hideAyahs };
    case "toggleFocusView":
      return { ...s, focusView: !s.focusView };
    case "mark": {
      const marks = { ...s.marks, [a.index]: a.mark };
      const newWrong = a.mark === "wrong" && s.marks[a.index] !== "wrong";
      return {
        ...s,
        marks,
        errors: countErrors(marks),
        cursor: Math.max(s.cursor, a.index + 1),
        pendingAlerts: s.pendingAlerts + (newWrong ? 1 : 0),
      };
    }
    case "revealNext": {
      if (s.cursor >= a.total) return s;
      return { ...s, marks: { ...s.marks, [s.cursor]: "ok" }, cursor: s.cursor + 1 };
    }
    case "back": {
      const target = Math.max(0, s.cursor - a.steps);
      const marks: Record<number, WordMark> = {};
      for (const [k, v] of Object.entries(s.marks)) if (Number(k) < target) marks[Number(k)] = v;
      return { ...s, cursor: target, marks, errors: countErrors(marks) };
    }
    case "restart":
      return { ...s, cursor: 0, marks: {}, errors: 0, peeks: 0, pendingAlerts: 0 };
    case "peek":
      return { ...s, peeks: s.peeks + 1 };
    case "alerts":
      return { ...s, alerts: { ...s.alerts, ...a.patch } };
    case "flushAlerts":
      return { ...s, pendingAlerts: 0 };
    case "resetPage":
      return { ...s, cursor: 0, marks: {}, errors: 0, pendingAlerts: 0 };
    default:
      return s;
  }
}
