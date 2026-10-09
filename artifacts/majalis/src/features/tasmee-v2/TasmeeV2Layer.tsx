import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Button, Chip, IconButton } from "@/design-system/primitives";
import { Icon, type DsIconName } from "@/design-system/Icon";
import { ListRow, Switch } from "@/design-system/navigation";
import { Sheet } from "@/design-system/overlays";
import { hapticTap } from "@/lib/capacitor-utils";
import {
  DEFAULT_ALERTS,
  initialTasmeeState,
  isActiveMode,
  tasmeeReducer,
  type AlertPrefs,
  type TasmeeMode,
} from "@/lib/tasmee-v2/session-state";
import { stepsBackToAyahStart } from "@/lib/tasmee-v2/word-model";
import { T } from "./strings";

const ALERTS_KEY = "ssunnah-tasmee-v2-alerts";
const LONG_PRESS_MS = 500;
const PEEK_PRESS_MS = 380;
const PEEK_SHOW_MS = 1400;

function loadAlerts(): AlertPrefs {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) return { ...DEFAULT_ALERTS, ...(JSON.parse(raw) as Partial<AlertPrefs>) };
  } catch {
    /* تخزين غير متاح */
  }
  return DEFAULT_ALERTS;
}

/** مدة بأرقام لاتينية دائمًا: 00:06 */
export function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playTone() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => void ctx.close();
  } catch {
    /* بلا صوت */
  }
}

/** صفحة المصحف الحالية في DOM — طبقة عرض فوق القارئ بلا لمس لتخطيطه. */
function findPage(pageNumber: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(`article.nm-page[data-page="${pageNumber}"]`);
}

function collectWords(article: HTMLElement) {
  const all = Array.from(article.querySelectorAll<HTMLElement>(".nm-line .nm-word"));
  const words: HTMLElement[] = [];
  const ends: { el: HTMLElement; after: number }[] = [];
  for (const el of all) {
    if (el.classList.contains("nm-word--end")) ends.push({ el, after: words.length });
    else words.push(el);
  }
  return { words, ends, keys: words.map((w) => w.dataset.ayah ?? "") };
}

type Props = {
  pageNumber: number;
  /** يُفتح مباشرة في وضع التسميع (`?tasmee=1`) */
  startInTasmee?: boolean;
  /** يُخفي الواجهة أثناء النوافذ الأخرى */
  blocked?: boolean;
};

const MODE_ICON: Record<Exclude<TasmeeMode, "off">, DsIconName> = {
  listen: "tilawa",
  tasmee: "mic",
  test: "star",
};

export function TasmeeV2Layer({ pageNumber, startInTasmee = false, blocked = false }: Props) {
  const [state, dispatch] = useReducer(tasmeeReducer, undefined, () => ({
    ...initialTasmeeState(startInTasmee ? "tasmee" : "off"),
    alerts: loadAlerts(),
  }));
  const [modesOpen, setModesOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const keysRef = useRef<string[]>([]);
  const totalRef = useRef(0);
  const longFiredRef = useRef(false);
  const fabTimerRef = useRef<number | null>(null);
  const active = isActiveMode(state.mode);

  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(state.alerts));
    } catch {
      /* تخزين غير متاح */
    }
  }, [state.alerts]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  /* المؤقّت */
  useEffect(() => {
    if (!state.recording) return;
    setElapsed(0);
    const id = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [state.recording]);

  /* تغيّر الصفحة يعيد المقطع */
  useEffect(() => {
    dispatch({ type: "resetPage" });
  }, [pageNumber]);

  /* تطبيق الحالة على كلمات الصفحة (سمات data فقط — التخطيط لا يتغيّر) */
  useEffect(() => {
    let raf = 0;
    let tries = 0;
    const apply = () => {
      const article = findPage(pageNumber);
      if (!article) {
        if (tries++ < 30) raf = requestAnimationFrame(apply);
        return;
      }
      const { words, ends, keys } = collectWords(article);
      keysRef.current = keys;
      totalRef.current = words.length;
      const hide = active && state.hideAyahs;
      if (hide) article.setAttribute("data-tasmee-hide", "1");
      else article.removeAttribute("data-tasmee-hide");
      article.setAttribute("data-tasmee-view", active && state.focusView ? "focus" : "page");
      const showRed = state.alerts.redShade && (state.alerts.timing === "instant" || !state.recording);
      article.setAttribute("data-tasmee-red", showRed ? "1" : "0");
      const curKey = keys[Math.min(state.cursor, keys.length - 1)];
      words.forEach((el, i) => {
        const mark = state.marks[i];
        let v: string | null = null;
        if (hide) v = mark ?? "hidden";
        else if (active && mark === "wrong") v = "wrong";
        else if (active && mark === "skipped") v = "skipped";
        if (v) el.setAttribute("data-tasmee", v);
        else el.removeAttribute("data-tasmee");
        if (active && state.focusView && keys[i] !== curKey) el.setAttribute("data-tasmee-dim", "1");
        else el.removeAttribute("data-tasmee-dim");
      });
      for (const { el, after } of ends) {
        if (hide && after > state.cursor) el.setAttribute("data-tasmee", "hidden");
        else el.removeAttribute("data-tasmee");
      }
    };
    apply();
    return () => cancelAnimationFrame(raf);
  }, [pageNumber, active, state.hideAyahs, state.focusView, state.marks, state.cursor, state.alerts, state.recording]);

  /* تنظيف عند الإيقاف أو الخروج */
  useEffect(() => {
    return () => {
      const article = findPage(pageNumber);
      if (!article) return;
      article.removeAttribute("data-tasmee-hide");
      article.removeAttribute("data-tasmee-view");
      article.removeAttribute("data-tasmee-red");
      article.querySelectorAll("[data-tasmee]").forEach((el) => el.removeAttribute("data-tasmee"));
      article.querySelectorAll("[data-tasmee-dim]").forEach((el) => el.removeAttribute("data-tasmee-dim"));
    };
  }, [pageNumber]);

  /* تنبيهات الخطأ: فوري أو بعد نهاية المقطع */
  const fireAlerts = useCallback(
    (a: AlertPrefs) => {
      if (a.haptic) void hapticTap("light");
      if (a.tone) playTone();
    },
    [],
  );
  const lastErrorsRef = useRef(0);
  useEffect(() => {
    if (state.errors > lastErrorsRef.current && state.alerts.timing === "instant") fireAlerts(state.alerts);
    lastErrorsRef.current = state.errors;
  }, [state.errors, state.alerts, fireAlerts]);
  useEffect(() => {
    if (!state.recording && state.pendingAlerts > 0) {
      if (state.alerts.timing === "after-segment") fireAlerts(state.alerts);
      dispatch({ type: "flushAlerts" });
    }
  }, [state.recording, state.pendingAlerts, state.alerts, fireAlerts]);

  /* نظرة خاطفة: ضغط مطوّل على سطر مخفي يكشفه لحظة (تلميح لا خطأ) */
  useEffect(() => {
    if (!active || !state.hideAyahs) return;
    const article = findPage(pageNumber);
    if (!article) return;
    let timer: number | null = null;
    let revealTimer: number | null = null;
    const clear = () => {
      if (timer != null) window.clearTimeout(timer);
      timer = null;
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const line = target?.closest<HTMLElement>(".nm-line");
      if (!line || !target?.closest(".nm-word")) return;
      clear();
      timer = window.setTimeout(() => {
        line.setAttribute("data-tasmee-peek", "1");
        dispatch({ type: "peek" });
        /* يمنع قائمة الآية الخاصة بالمصحف من الفتح فوق النظرة */
        target.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: e.pointerId }));
        void hapticTap("light");
        if (revealTimer != null) window.clearTimeout(revealTimer);
        revealTimer = window.setTimeout(() => line.removeAttribute("data-tasmee-peek"), PEEK_SHOW_MS);
      }, PEEK_PRESS_MS);
    };
    article.addEventListener("pointerdown", onDown);
    article.addEventListener("pointerup", clear);
    article.addEventListener("pointermove", clear);
    article.addEventListener("pointercancel", clear);
    return () => {
      clear();
      if (revealTimer != null) window.clearTimeout(revealTimer);
      article.removeEventListener("pointerdown", onDown);
      article.removeEventListener("pointerup", clear);
      article.removeEventListener("pointermove", clear);
      article.removeEventListener("pointercancel", clear);
      article.querySelectorAll("[data-tasmee-peek]").forEach((el) => el.removeAttribute("data-tasmee-peek"));
    };
  }, [active, state.hideAyahs, pageNumber]);

  /* زر الميكروفون: نقرة = بدء/إيقاف · ضغط مطوّل = مبدّل الأوضاع */
  const onFabDown = () => {
    longFiredRef.current = false;
    fabTimerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      void hapticTap("medium");
      setModesOpen(true);
    }, LONG_PRESS_MS);
  };
  const onFabUp = () => {
    if (fabTimerRef.current != null) window.clearTimeout(fabTimerRef.current);
    fabTimerRef.current = null;
  };
  const onFabClick = () => {
    if (longFiredRef.current) return;
    if (!active) {
      dispatch({ type: "setMode", mode: "tasmee" });
      return;
    }
    dispatch({ type: "toggleRecording" });
  };

  const pickMode = (mode: TasmeeMode) => {
    setModesOpen(false);
    if (mode === "listen" || mode === "test") return;
    dispatch({ type: "setMode", mode });
  };

  const toggleHide = () => {
    dispatch({ type: "toggleHide" });
    setToast(state.hideAyahs ? T.hideOff : T.hideOn);
  };

  if (blocked) return null;

  const fabLabel = !active ? T.fabStart : state.recording ? T.fabStop : T.fabRecord;

  return (
    <>
      <div className="tv2" data-active={active ? "1" : "0"} dir="rtl">
        {active ? (
          <div className="sn-card--featured tv2-toolbar" role="toolbar" aria-label={T.toolbar}>
            <Chip className="tv2-errors" aria-label={`${T.errors}: ${state.errors}`}>
              <span>{T.errors}</span>
              <bdi className="tv2-num">{state.errors}</bdi>
            </Chip>
            <IconButton
              icon="focus"
              label={T.viewMode}
              tone="tinted"
              size={20}
              aria-pressed={state.focusView}
              onClick={() => dispatch({ type: "toggleFocusView" })}
            />
            <IconButton
              icon={state.hideAyahs ? "eyeOff" : "eye"}
              label={T.hideAyahs}
              tone="tinted"
              size={20}
              aria-pressed={state.hideAyahs}
              onClick={toggleHide}
            />
            <IconButton
              icon="undo"
              label={T.backWord}
              tone="tinted"
              size={20}
              onClick={() => dispatch({ type: "back", steps: 1 })}
            />
            <IconButton
              icon="back"
              label={T.backAyah}
              tone="tinted"
              size={20}
              onClick={() => dispatch({ type: "back", steps: stepsBackToAyahStart(keysRef.current, state.cursor) })}
            />
            <IconButton icon="restart" label={T.restart} tone="tinted" size={20} onClick={() => dispatch({ type: "restart" })} />
            <IconButton
              icon="chevron"
              label={T.revealNext}
              tone="tinted"
              size={20}
              onClick={() => dispatch({ type: "revealNext", total: totalRef.current })}
            />
            <IconButton icon="settings" label={T.alertSettings} tone="tinted" size={20} onClick={() => setAlertsOpen(true)} />
          </div>
        ) : null}

        <div className="tv2-fabwrap">
          {state.recording ? (
            <span className="sn-chip tv2-timer" role="timer" aria-label={T.timer}>
              <span className="tv2-dot" aria-hidden="true" />
              <bdi className="tv2-num">{formatElapsed(elapsed)}</bdi>
            </span>
          ) : null}
          <IconButton
            label={fabLabel}
            tone="filled"
            className="tv2-fab"
            data-recording={state.recording ? "1" : "0"}
            aria-pressed={state.recording}
            onPointerDown={onFabDown}
            onPointerUp={onFabUp}
            onPointerLeave={onFabUp}
            onPointerCancel={onFabUp}
            onClick={onFabClick}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Icon name={state.recording ? "stop" : "mic"} size={24} />
          </IconButton>
        </div>
        {toast ? (
          <div className="sn-toast tv2-toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </div>

      <Sheet open={modesOpen} onClose={() => setModesOpen(false)} title={T.modesTitle}>
        <div className="tv2-modes">
          {(["listen", "tasmee", "test"] as const).map((m) => {
            const ready = m === "tasmee";
            return (
              <ListRow
                key={m}
                icon={MODE_ICON[m]}
                title={T.modes[m]}
                description={ready ? T.modeHints[m] : T.modeSoon[m]}
                trailing={state.mode === m ? <Icon name="check" size={20} /> : undefined}
                onClick={() => (ready ? pickMode(m) : (setModesOpen(false), setToast(T.modeSoon[m])))}
              />
            );
          })}
        </div>
        {active ? (
          <Button variant="tertiary" block onClick={() => { setModesOpen(false); dispatch({ type: "setMode", mode: "off" }); }}>
            {T.exit}
          </Button>
        ) : null}
      </Sheet>

      <Sheet open={alertsOpen} onClose={() => setAlertsOpen(false)} title={T.alertsTitle}>
        <div className="tv2-settings">
          <div className="tv2-setting">
            <span>{T.redShade}</span>
            <Switch checked={state.alerts.redShade} label={T.redShade} onChange={(v) => dispatch({ type: "alerts", patch: { redShade: v } })} />
          </div>
          <div className="tv2-setting">
            <span>{T.haptic}</span>
            <Switch checked={state.alerts.haptic} label={T.haptic} onChange={(v) => dispatch({ type: "alerts", patch: { haptic: v } })} />
          </div>
          <div className="tv2-setting">
            <span>{T.tone}</span>
            <Switch checked={state.alerts.tone} label={T.tone} onChange={(v) => dispatch({ type: "alerts", patch: { tone: v } })} />
          </div>
          <div className="tv2-timing" role="radiogroup" aria-label={T.timing}>
            {(["instant", "after-segment"] as const).map((t) => (
              <Chip
                key={t}
                role="radio"
                aria-checked={state.alerts.timing === t}
                selected={state.alerts.timing === t}
                onClick={() => dispatch({ type: "alerts", patch: { timing: t } })}
              >
                {t === "instant" ? T.instant : T.afterSegment}
              </Chip>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
