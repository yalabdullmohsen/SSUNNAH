import { useState } from "react";
import { GOVERNORATES } from "@/lib/theme";
import { FIELD_LABELS, EMPTY_PARSED, type DebugLog, type ParsedLessonFields } from "@/lib/lesson-import-api";
import { Button } from "@/components/ui/button";

export const CATEGORIES = ["تفسير", "فقه", "عقيدة", "حديث", "سيرة", "تجويد", "أخرى"];
export const VENUE_TYPES = ["مسجد", "مجلس", "ديوان", "مزرعة", "استراحة", "مركز", "جامعة", "أخرى"] as const;
export const WEEK_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const;

export const inputStyle: React.CSSProperties = {};
export const labelStyle: React.CSSProperties = {};

export function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const mod = pct >= 75 ? " lis-conf-badge--high" : pct >= 45 ? " lis-conf-badge--mid" : "";
  return (
    <span className={`lis-conf-badge${mod}`}>
      ثقة الاستخراج: {pct}%
    </span>
  );
}

export function MissingBadge({ fields }: { fields: string[] }) {
  if (!fields.length) {
    return (
      <span className="lis-missing-badge lis-missing-badge--ok">
        ✓ البيانات الأساسية مكتملة
      </span>
    );
  }
  return (
    <span className="lis-missing-badge">
      ✗ تحتاج مراجعة: {fields.map((f) => FIELD_LABELS[f] || f).join("، ")}
    </span>
  );
}

const KEY_FIELDS_SHARED = ["title", "speaker_name", "day_of_week", "lesson_time", "mosque", "city"] as const;

export function FieldStatusGrid({
  parsed,
  fieldConfidence,
  failureReasons,
}: {
  parsed: ParsedLessonFields;
  fieldConfidence: Record<string, number>;
  failureReasons: Record<string, string>;
}) {
  return (
    <div className="lis-field-grid">
      {KEY_FIELDS_SHARED.map((field) => {
        const val = String((parsed as Record<string, unknown>)[field] || "").trim();
        const conf = fieldConfidence[field] ?? (val ? 1 : 0);
        const reason = failureReasons[field];
        const isOk = val && conf >= 0.5;
        const isWarn = val && conf < 0.5;
        const isMissing = !val;
        const cellMod = isOk ? " lis-field-cell--ok" : isWarn ? " lis-field-cell--warn" : " lis-field-cell--missing";
        const icon = isOk ? "✓" : isWarn ? "⚠" : "✗";
        return (
          <div
            key={field}
            className={`lis-field-cell${cellMod}`}
            title={reason || val || "غير موجود"}
          >
            <div className="lis-field-icon">{icon} {FIELD_LABELS[field] || field}</div>
            <div className="lis-field-value">
              {isMissing ? (reason || "لم يُستخرج") : val}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DebugLogPanel({ log }: { log: DebugLog }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lis-debug-panel">
      <Button type="button" variant="ghost" onClick={() => setOpen((o) => !o)} className="lis-debug-btn">
        <span>تفاصيل الاستخراج (Debug) — {log.total_ms ?? 0} ms</span>
        <span>{open ? "▲" : "▼"}</span>
      </Button>
      {open && (
        <div className="lis-debug-content">
          {log.stages.map((s, i) => (
            <div
              key={i}
              className={`lis-debug-stage${s.ok === false ? " lis-debug-stage--error" : ""}`}
            >
              <strong>{s.stage}</strong>
              {s.ms != null && <span className="lis-debug-ms">({s.ms}ms)</span>}
              {s.error && <span className="lis-debug-err"> ✗ {s.error}</span>}
              {s.fields_found?.length ? <div className="lis-debug-found">✓ {s.fields_found.join(", ")}</div> : null}
              {s.fields_missing?.length ? <div className="lis-debug-missing">✗ missing: {s.fields_missing.join(", ")}</div> : null}
              {s.fields_recovered?.length ? <div className="lis-debug-recovered">↑ recovered: {s.fields_recovered.join(", ")}</div> : null}
              {s.fields_filled?.length ? <div className="lis-debug-filled">DB: {s.fields_filled.join(", ")}</div> : null}
              {s.raw_confidence != null && <div className="lis-debug-conf">confidence: {Math.round(s.raw_confidence * 100)}%</div>}
            </div>
          ))}
          {log.raw_ocr_text && (
            <details className="lis-debug-ocr lis-debug-ocr--mt">
              <summary>raw_ocr_text</summary>
              <pre>{log.raw_ocr_text}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export function PlatformBadge({ label }: { label: string }) {
  return <span className="lis-platform-badge">{label}</span>;
}

export function DuplicateBadge({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="lis-duplicate-badge">{message}</span>;
}

export function LessonImportForm({
  parsed,
  onChange,
  disabled,
}: {
  parsed: ParsedLessonFields;
  onChange: (next: ParsedLessonFields) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof ParsedLessonFields, value: unknown) => {
    onChange({ ...parsed, [key]: value });
  };

  return (
    <div className="lis-form-grid">
      <div className="lis-full-col">
        <label className="lis-label">{FIELD_LABELS.title}</label>
        <input className="lis-input" value={parsed.title || ""} disabled={disabled} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.speaker_name}</label>
        <input className="lis-input" value={parsed.speaker_name || ""} disabled={disabled} onChange={(e) => set("speaker_name", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.gregorian_date}</label>
        <input type="date" className="lis-input" value={parsed.gregorian_date || parsed.start_date || ""} disabled={disabled} onChange={(e) => { set("gregorian_date", e.target.value); set("start_date", e.target.value); }} />
      </div>
      <div className="lis-full-col">
        <label className="lis-label">{FIELD_LABELS.day_of_week} (اختر يومًا أو أكثر)</label>
        <div className="lis-days-row">
          {WEEK_DAYS.map(d => {
            const selected = (parsed.day_of_week || "").split("،").map(x => x.trim()).includes(d);
            return (
              <label
                key={d}
                className={`lis-day-label${selected ? " lis-day-label--selected" : ""}${disabled ? " lis-day-label--disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={selected}
                  onChange={e => {
                    const cur = (parsed.day_of_week || "").split("،").map(x => x.trim()).filter(Boolean);
                    const next = e.target.checked ? [...cur, d] : cur.filter(x => x !== d);
                    set("day_of_week", next.join("،"));
                  }}
                  className="lis-day-checkbox"
                />
                {d}
              </label>
            );
          })}
        </div>
        {(parsed.day_of_week || "").includes("،") && (
          <div className="lis-days-note">
            يتكرر كل: {(parsed.day_of_week || "").split("،").join(" و")}
          </div>
        )}
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.lesson_time}</label>
        <input className="lis-input" value={parsed.lesson_time || ""} disabled={disabled} onChange={(e) => set("lesson_time", e.target.value)} placeholder="مثل: بعد العشاء" />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.venue_type}</label>
        <select className="lis-select" value={parsed.venue_type || "مسجد"} disabled={disabled} onChange={(e) => set("venue_type", e.target.value)}>
          {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.mosque}</label>
        <input className="lis-input" value={parsed.mosque || ""} disabled={disabled} onChange={(e) => set("mosque", e.target.value)} placeholder={parsed.venue_type === "ديوان" ? "ديوان آل فلان" : parsed.venue_type === "مجلس" ? "مجلس الشيخ فلان" : "اسم المكان"} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.region}</label>
        <input className="lis-input" value={parsed.region || ""} disabled={disabled} onChange={(e) => set("region", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.city}</label>
        <select className="lis-select" value={parsed.city || "العاصمة"} disabled={disabled} onChange={(e) => set("city", e.target.value)}>
          {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.country}</label>
        <input className="lis-input" value={parsed.country || "الكويت"} disabled={disabled} onChange={(e) => set("country", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.category}</label>
        <select className="lis-select" value={parsed.category || ""} disabled={disabled} onChange={(e) => set("category", e.target.value)}>
          <option value="">—</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.organizer}</label>
        <input className="lis-input" value={parsed.organizer || ""} disabled={disabled} onChange={(e) => set("organizer", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.cooperative_org}</label>
        <input className="lis-input" value={parsed.cooperative_org || ""} disabled={disabled} onChange={(e) => set("cooperative_org", e.target.value)} />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.phone}</label>
        <input className="lis-input" value={parsed.phone || ""} disabled={disabled} onChange={(e) => set("phone", e.target.value)} dir="ltr" />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.live_url}</label>
        <input className="lis-input" value={parsed.live_url || ""} disabled={disabled} onChange={(e) => set("live_url", e.target.value)} dir="ltr" />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.registration_url}</label>
        <input className="lis-input" value={parsed.registration_url || ""} disabled={disabled} onChange={(e) => set("registration_url", e.target.value)} dir="ltr" />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.maps_url}</label>
        <input className="lis-input" value={parsed.maps_url || ""} disabled={disabled} onChange={(e) => set("maps_url", e.target.value)} dir="ltr" />
      </div>
      <div>
        <label className="lis-label">{FIELD_LABELS.slug}</label>
        <input className="lis-input" value={parsed.slug || ""} disabled={disabled} onChange={(e) => set("slug", e.target.value)} dir="ltr" />
      </div>
      <div className="lis-checkbox-row">
        <input type="checkbox" checked={Boolean(parsed.has_live_stream)} disabled={disabled} onChange={(e) => set("has_live_stream", e.target.checked)} id="has-live" />
        <label htmlFor="has-live" className="lis-label lis-label--inline">{FIELD_LABELS.has_live_stream}</label>
      </div>
      <div className="lis-checkbox-row">
        <input type="checkbox" checked={Boolean(parsed.has_women_section)} disabled={disabled} onChange={(e) => set("has_women_section", e.target.checked)} id="has-women" />
        <label htmlFor="has-women" className="lis-label lis-label--inline">{FIELD_LABELS.has_women_section}</label>
      </div>
      <div className="lis-full-col">
        <label className="lis-label">{FIELD_LABELS.keywords}</label>
        <input
          className="lis-input"
          value={(parsed.keywords || []).join("، ")}
          disabled={disabled}
          onChange={(e) => set("keywords", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))}
          placeholder="كلمات مفتاحية مفصولة بفاصلة"
        />
      </div>
      <div className="lis-full-col">
        <label className="lis-label">{FIELD_LABELS.description}</label>
        <textarea
          className="lis-textarea"
          value={parsed.description || ""}
          disabled={disabled}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
    </div>
  );
}

export type LessonImportReviewProps = {
  parsed: ParsedLessonFields;
  onParsedChange: (next: ParsedLessonFields) => void;
  busy: boolean;
  draftId: string | null;
  imageUrl: string | null;
  sourceUrl?: string | null;
  extractedText: string;
  confidence: number;
  missingFields: string[];
  warnings: { field: string; message: string }[];
  sheikhHint: string;
  platformLabel?: string;
  duplicateMessage?: string;
  fieldConfidence?: Record<string, number>;
  failureReasons?: Record<string, string>;
  debugLog?: DebugLog | null;
  onApprove: () => void;
  onSaveDraft: () => void;
  onReject: () => void;
  onReExtract?: () => void;
  reExtractLabel?: string;
};

export function LessonImportReviewPanel({
  parsed,
  onParsedChange,
  busy,
  draftId,
  imageUrl,
  sourceUrl,
  extractedText,
  confidence,
  missingFields,
  warnings,
  sheikhHint,
  platformLabel,
  duplicateMessage,
  fieldConfidence = {},
  failureReasons = {},
  debugLog,
  onApprove,
  onSaveDraft,
  onReject,
  onReExtract,
  reExtractLabel = "إعادة استخراج",
}: LessonImportReviewProps) {
  return (
    <>
      <div className="lis-badges-row">
        <ConfidenceBadge score={confidence} />
        <MissingBadge fields={missingFields} />
        {platformLabel && <PlatformBadge label={platformLabel} />}
        <DuplicateBadge message={duplicateMessage} />
        {sheikhHint && <span className="lis-hint-badge">{sheikhHint}</span>}
      </div>

      <FieldStatusGrid parsed={parsed} fieldConfidence={fieldConfidence} failureReasons={failureReasons} />
      {debugLog && <DebugLogPanel log={debugLog} />}

      <div className="lis-review-grid">
        <section className="lis-panel">
          <h3 className="lis-panel-h3">المصدر</h3>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="lis-source-link">
              {sourceUrl}
            </a>
          )}
          {imageUrl ? (
            <>
              <h3 className="lis-panel-h3--sm">صورة الإعلان</h3>
              <img src={imageUrl} alt="إعلان الدرس" className="lis-preview-img" />
            </>
          ) : (
            <p className="lis-no-image">لا توجد صورة مستخرجة من الرابط</p>
          )}
          <h3 className="lis-panel-h3--sm">النص المستخرج</h3>
          <pre className="lis-ocr-pre">{extractedText || "—"}</pre>
          {warnings.length > 0 && (
            <ul className="lis-warnings">
              {warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="lis-panel">
          <h3 className="lis-panel-h3">مراجعة وتعديل الحقول</h3>
          <LessonImportForm parsed={parsed} onChange={onParsedChange} disabled={busy} />
        </section>
      </div>

      <div className="lis-review-actions">
        <Button type="button" variant="primary" disabled={busy} onClick={onApprove} className="lis-approve-btn">
          اعتماد ونشر
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={onSaveDraft} className="lis-draft-btn">
          حفظ كمسودة
        </Button>
        {onReExtract && (
          <Button type="button" variant="ghost" disabled={busy} onClick={onReExtract} className="lis-extract-btn">
            {reExtractLabel}
          </Button>
        )}
        <Button type="button" variant="destructive" disabled={busy || !draftId} onClick={onReject} className="lis-reject-btn">
          رفض
        </Button>
      </div>
    </>
  );
}

export { EMPTY_PARSED };
