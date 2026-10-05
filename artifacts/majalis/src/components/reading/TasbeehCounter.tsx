import { useEffect, useRef, useState } from "react";
import { useTasbeehCounter } from "@/hooks/useTasbeehCounter";
import { TASBEEH_PRESETS, type TasbeehWird } from "@/lib/tasbeeh-storage";
import { Button } from "@/components/ui/button";

/** أهداف لوحة المفاتيح التي تملك تفعيلها الأصلي — اختصارات العدّاد لا تعمل فوقها */
const INTERACTIVE_TARGET =
  'input, textarea, select, button, a[href], summary, [contenteditable="true"], [role="button"], [role="tab"], [role="link"], [role="menuitem"], [role="checkbox"], [role="switch"], [role="radio"], [role="option"], [role="slider"]';

// ─── SVG Progress Ring ─────────────────────────────────────────────────────

const RING_R = 66;
const RING_C = 2 * Math.PI * RING_R; // ≈ 414.7

function ProgressRing({
  count,
  target,
  goalReached,
  pulse,
  onClick,
}: {
  count: number;
  target: number;
  goalReached: boolean;
  pulse: boolean;
  onClick: () => void;
}) {
  const rounds   = target > 0 ? Math.floor(count / target) : 0;
  const remainder = target > 0 ? count % target : count;
  const ringPct  = target > 0
    ? (remainder === 0 && count > 0 ? 100 : (remainder / target) * 100)
    : 0;
  const displayCount = target > 0
    ? (remainder === 0 && count > 0 ? target : remainder)
    : count;
  const offset = RING_C * (1 - Math.min(ringPct, 100) / 100);

  return (
    <Button
      type="button"
      variant="ghost"
      className={[
        "tc-ring-btn tc-btn-wrap",
        pulse ? "tc-ring-btn--pulse" : "",
        goalReached ? "tc-ring-btn--done" : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
      aria-label={`${count} — اضغط للتسبيح`}
    >
      <svg viewBox="0 0 160 160" className="tc-ring-svg" aria-hidden="true">
        <circle cx="80" cy="80" r={RING_R} className="tc-ring-track" />
        <circle
          cx="80" cy="80" r={RING_R}
          className={`tc-ring-fill${goalReached ? " tc-ring-fill--done" : ""}`}
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="tc-ring-inner">
        {rounds > 0 && (
          <span className="tc-ring-rounds">{rounds}×</span>
        )}
        <span className="tc-ring-count">{displayCount}</span>
        {target > 0 && rounds > 0 && (
          <span className="tc-ring-total">مجموع: {count}</span>
        )}
        <span className="tc-ring-hint">
          {goalReached ? "✓ استمر" : "اضغط"}
        </span>
      </div>
    </Button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

type Props = {
  storageId: string;
  target: number;
  label?: string;
  compact?: boolean;
  wird?: TasbeehWird;
  onWirdChange?: (next: TasbeehWird) => void;
};

export function TasbeehCounter({
  storageId, target, label = "عداد التسبيح", compact = false, wird, onWirdChange,
}: Props) {
  const {
    count,
    target: activeTarget,
    progress,
    goalReached,
    pulse,
    increment,
    undo,
    reset,
    setTarget,
    canUndo,
  } = useTasbeehCounter({ storageId, initialTarget: target, wird, onWirdChange });
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const confirmActionRef = useRef<HTMLButtonElement>(null);

  const openResetConfirm = () => setConfirmReset(true);
  const cancelResetConfirm = () => {
    setConfirmReset(false);
    window.requestAnimationFrame(() => {
      resetTriggerRef.current?.focus({ preventScroll: true });
    });
  };
  const confirmAndReset = () => {
    reset();
    setConfirmReset(false);
    window.requestAnimationFrame(() => {
      resetTriggerRef.current?.focus({ preventScroll: true });
    });
  };

  // Escape يلغي التأكيد؛ Space/Enter للتسبيح فقط خارج حالة التأكيد
  useEffect(() => {
    if (compact && !confirmReset) return;
    const onKey = (e: KeyboardEvent) => {
      if (confirmReset && e.code === "Escape") {
        e.preventDefault();
        cancelResetConfirm();
        return;
      }
      if (compact || confirmReset) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // لا نخطف Enter/Space/Backspace من عنصر تفاعلي مُركَّز (زر/رابط/تبويب/حقل)؛
      // وإلا تعطّل تفعيل كل أزرار الصفحة بلوحة المفاتيح وتحوّل إلى «تسبيح».
      const target = e.target as Element | null;
      if (target?.closest?.(INTERACTIVE_TARGET)) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        increment(1);
      }
      if (e.code === "Backspace" || (e.code === "KeyZ" && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compact, confirmReset, increment, undo]);

  useEffect(() => {
    if (!confirmReset) return;
    window.requestAnimationFrame(() => {
      confirmActionRef.current?.focus({ preventScroll: true });
    });
  }, [confirmReset]);

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={`tasbeeh-counter tasbeeh-counter--compact${pulse ? " tasbeeh-counter--pulse" : ""}`}>
        <div className="tasbeeh-counter__head">
          <span>{label}</span>
          <strong>{count}{activeTarget > 0 ? ` / ${activeTarget}` : ""}</strong>
        </div>
        {activeTarget > 0 && (
          <div className="tasbeeh-counter__bar" aria-hidden="true">
            <span style={{ "--tc-pct": `${progress}%` } as React.CSSProperties} />
          </div>
        )}
        <div className="tasbeeh-counter__actions">
          <Button type="button" variant="primary" size="small" className="tasbeeh-counter__btn tasbeeh-counter__btn--primary" onClick={() => increment(1)} aria-label="إضافة ذكر واحد">
            +1
          </Button>
          <Button type="button" variant="secondary" size="small" className="tasbeeh-counter__btn" disabled={!canUndo} onClick={undo}>تراجع</Button>
          {confirmReset ? (
            <div className="tasbeeh-counter__confirm" role="alertdialog" aria-label="تأكيد التصفير" aria-modal="true">
              <Button ref={confirmActionRef} type="button" variant="destructive" size="small" onClick={confirmAndReset}>تأكيد</Button>
              <Button type="button" variant="ghost" size="small" onClick={cancelResetConfirm}>إلغاء</Button>
            </div>
          ) : (
            <Button
              ref={resetTriggerRef}
              type="button"
              variant="ghost"
              size="small"
              className="tasbeeh-counter__btn tasbeeh-counter__btn--ghost"
              onClick={openResetConfirm}
              aria-label="تصفير العداد"
            >
              تصفير
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Pro mode ──────────────────────────────────────────────────────────────
  const isCustomTarget = !TASBEEH_PRESETS.some(
    (p) => p.value !== "custom" && Number(p.value) === activeTarget,
  );

  return (
    <div className={`tasbeeh-counter tasbeeh-counter--pro${pulse ? " tasbeeh-counter--pulse" : ""}`}>
      {/* أهداف جاهزة — صف مستقل */}
      <div className="tasbeeh-counter__presets" role="group" aria-label="هدف جاهز">
        {TASBEEH_PRESETS.filter((p) => p.value !== "custom").map((p) => (
          <Button
            key={String(p.value)}
            type="button"
            variant="ghost"
            className={`tasbeeh-counter__preset${activeTarget === p.value ? " is-active" : ""}`}
            onClick={() => setTarget(Number(p.value))}
          >
            {p.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          className={`tasbeeh-counter__preset${isCustomTarget ? " is-active" : ""}`}
          onClick={() => {
            if (!isCustomTarget) setTarget(Math.max(1, activeTarget || 33));
          }}
          aria-pressed={isCustomTarget}
        >
          مخصص
        </Button>
      </div>

      {/* حقل المخصص يظهر فقط عند اختياره — لا يتراكب مع الأزرار */}
      {isCustomTarget && (
        <label className="tasbeeh-counter__custom-target tasbeeh-counter__custom-target--row">
          <span>الهدف المخصص</span>
          <input
            type="number"
            min={1}
            max={99999}
            inputMode="numeric"
            value={activeTarget || ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n) || n < 1) return;
              setTarget(Math.min(99999, Math.floor(n)));
            }}
            aria-label="هدف مخصص"
          />
        </label>
      )}

      {/* Progress ring — main tap area */}
      <ProgressRing
        count={count}
        target={activeTarget}
        goalReached={goalReached}
        pulse={pulse}
        onClick={() => increment(1)}
      />

      {/* Actions */}
      <div className="tasbeeh-counter__actions">
        <Button type="button" variant="secondary" size="small" className="tasbeeh-counter__btn" disabled={!canUndo} onClick={undo}>
          تراجع
        </Button>
        {confirmReset ? (
          <div className="tasbeeh-counter__confirm" role="alertdialog" aria-label="تأكيد التصفير" aria-modal="true">
            <Button ref={confirmActionRef} type="button" variant="destructive" size="small" onClick={confirmAndReset}>
              تأكيد التصفير
            </Button>
            <Button type="button" variant="ghost" size="small" onClick={cancelResetConfirm}>
              إلغاء
            </Button>
          </div>
        ) : (
          <Button
            ref={resetTriggerRef}
            type="button"
            variant="ghost"
            size="small"
            className="tasbeeh-counter__btn tasbeeh-counter__btn--ghost"
            onClick={openResetConfirm}
            aria-label="تصفير العداد"
          >
            تصفير
          </Button>
        )}
      </div>

      <p className="tc-keyboard-hint" aria-hidden="true">
        {confirmReset
          ? "Escape لإلغاء التأكيد"
          : "مفتاح المسافة أو Enter للتسبيح · Backspace للتراجع"}
      </p>
    </div>
  );
}

export default TasbeehCounter;
