/**
 * Flutter `AudioRecitationReviewCard` — web port with live audio + decisions.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { RecitationReviewItem } from "@/lib/admin-review-hub";
import { LinearAudioReviewPlayer } from "./LinearAudioReviewPlayer";

export type RecitationReviewCardProps = {
  item: RecitationReviewItem;
  selected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onReject: (feedback: string) => void;
  onOverrideScore: (score: number) => void;
};

export function RecitationReviewCard({
  item,
  selected,
  onToggleSelect,
  onApprove,
  onReject,
  onOverrideScore,
}: RecitationReviewCardProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState(item.feedback ?? "");
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideVal, setOverrideVal] = useState(
    String(item.overriddenScore ?? item.aiScore),
  );

  const displayScore = item.overriddenScore ?? item.aiScore;
  const locked = item.status === "approved" || item.status === "rejected";
  const flagReason = item.notes || item.feedback;

  return (
    <article
      className={`rh-flutter-card rh-flutter-card--audio${selected ? " is-selected" : ""}`}
      data-status={item.status}
    >
      <header className="rh-flutter-card__head">
        <label className="rh-card__check">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            disabled={locked}
            aria-label={`تحديد ${item.id}`}
          />
        </label>
        <p className="rh-flutter-card__user">{item.userName}</p>
        <span className="rh-flutter-card__verse-badge">{item.verseRef}</span>
        <span className="rh-flutter-card__ai">
          تقييم الذكاء الاصطناعي: {displayScore}%
        </span>
      </header>

      <div className="rh-flutter-card__quran">
        <p>{item.expectedText}</p>
      </div>

      <LinearAudioReviewPlayer src={item.audioUrl} />

      {flagReason ? (
        <p className="rh-flutter-card__flag">تنبيه النظام: {flagReason}</p>
      ) : null}

      <div className="rh-flutter-card__divider" />

      {!locked ? (
        <footer className="rh-flutter-card__actions">
          <Button
            type="button"
            variant="ghost"
            className="rh-btn rh-btn--ghost"
            onClick={() => setOverrideOpen((v) => !v)}
          >
            تجاوز درجة الذكاء
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rh-btn rh-btn--outline"
            onClick={() => setFeedbackOpen((v) => !v)}
          >
            رفض التلاوة
          </Button>
          <Button type="button" variant="primary" className="rh-btn rh-btn--sage" onClick={onApprove}>
            اعتماد القراءة صحيحة
          </Button>
        </footer>
      ) : null}

      {feedbackOpen ? (
        <div className="rh-card__panel">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="سبب الرفض للمستخدم…"
            aria-label="ملاحظة الرفض"
          />
          <Button
            type="button"
            variant="destructive"
            className="rh-btn rh-btn--rose"
            onClick={() => {
              onReject(feedback);
              setFeedbackOpen(false);
            }}
          >
            تأكيد الرفض
          </Button>
        </div>
      ) : null}

      {overrideOpen ? (
        <div className="rh-card__panel">
          <label className="rh-card__override">
            الدرجة الجديدة (0–100)
            <input
              type="number"
              min={0}
              max={100}
              value={overrideVal}
              onChange={(e) => setOverrideVal(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            className="rh-btn rh-btn--gold"
            onClick={() => {
              onOverrideScore(Number(overrideVal));
              setOverrideOpen(false);
            }}
          >
            حفظ الدرجة
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export default RecitationReviewCard;
