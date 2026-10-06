/**
 * فئات تذكير الأذكار والمناسبات داخل مركز الإشعارات (لا شاشة موازية).
 * الفئات من البيانات؛ لكل فئة: تفعيل، وقت أو ارتباط بالصلاة مع إزاحة، تكرار، صوت مع معاينة.
 */
import { useState } from "react";
import { SettingsToggleRow } from "@/components/design-system/SettingsList";
import { FieldLabel } from "@/components/design-system/FormFields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  INTERVAL_CHOICES,
  REMINDER_CATEGORIES,
  REMINDER_SOUNDS,
  loadReminderPrefs,
  resetReminderPrefs,
  saveReminderPrefs,
  type AdhkarReminderPrefs,
  type CategoryPref,
  type ReminderCategory,
  type ReminderGroup,
  type ReminderSound,
} from "@/lib/adhkar-reminders";

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "الفجر", Sunrise: "الشروق", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء",
};
const OFFSETS = [-90, -60, -45, -30, -20, -15, -10, 0, 10, 15, 20, 30, 45, 60, 90];

function offsetLabel(min: number): string {
  if (min === 0) return "عند الوقت";
  return min < 0 ? `قبل ${-min} دقيقة` : `بعد ${min} دقيقة`;
}

function whenSummary(c: ReminderCategory, p: CategoryPref): string {
  const w = c.when;
  if (w.type === "interval") return `كل ${(p.everyMinutes ?? w.everyMinutes) / 60} ساعات من ${w.start} إلى ${w.end}`;
  if (w.type === "time") return p.time ?? w.time;
  if ((p.mode ?? "prayer") === "time" && c.defaultTime) return p.time ?? c.defaultTime;
  const at = offsetLabel(p.offsetMin ?? w.offsetMin);
  return w.type === "prayer" ? `${at} — ${PRAYER_NAMES[w.prayer]}` : `${at} من كل صلاة`;
}

function previewSound(id: ReminderSound): void {
  if (id === "system" || id === "silent") return;
  try {
    void new Audio(`/audio/reminder-tones/${id}.m4a`).play().catch(() => {});
  } catch {
    /* المتصفح لا يدعم التشغيل */
  }
}

function PrefSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="nsp-field">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-h-11 text-base" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryDetail({ c, p, onPatch }: { c: ReminderCategory; p: CategoryPref; onPatch: (patch: Partial<CategoryPref>) => void }) {
  const w = c.when;
  const prayerBased = w.type === "prayer" || w.type === "prayers";
  const mode = p.mode ?? "prayer";
  const sound = p.sound ?? c.sound;
  return (
    <div className="nsp-reminder-detail">
      {prayerBased && c.defaultTime ? (
        <PrefSelect
          label="التوقيت"
          value={mode}
          options={[{ value: "prayer", label: `مرتبط بالصلاة (${PRAYER_NAMES[w.type === "prayer" ? w.prayer : "Fajr"]})` }, { value: "time", label: "وقت أختاره" }]}
          onChange={(v) => onPatch({ mode: v as "prayer" | "time" })}
        />
      ) : null}
      {prayerBased && mode === "prayer" ? (
        <PrefSelect
          label="الإزاحة عن الصلاة"
          value={String(p.offsetMin ?? w.offsetMin)}
          options={OFFSETS.map((m) => ({ value: String(m), label: offsetLabel(m) }))}
          onChange={(v) => onPatch({ offsetMin: Number(v) })}
        />
      ) : null}
      {w.type === "time" || (prayerBased && mode === "time" && c.defaultTime) ? (
        <div className="nsp-field">
          <FieldLabel htmlFor={`rem-time-${c.id}`}>الوقت</FieldLabel>
          <input
            id={`rem-time-${c.id}`}
            type="time"
            className="notif-time__input"
            value={p.time ?? (w.type === "time" ? w.time : c.defaultTime)}
            onChange={(e) => e.target.value && onPatch({ time: e.target.value })}
          />
        </div>
      ) : null}
      {w.type === "interval" ? (
        <PrefSelect
          label="التكرار"
          value={String(p.everyMinutes ?? w.everyMinutes)}
          options={INTERVAL_CHOICES.map((m) => ({ value: String(m), label: `كل ${m / 60} ساعات` }))}
          onChange={(v) => onPatch({ everyMinutes: Number(v) })}
        />
      ) : null}
      <div className="nsp-field nsp-field--inline nsp-reminder-sound">
        <PrefSelect
          label="الصوت"
          value={sound}
          options={REMINDER_SOUNDS.map((s) => ({ value: s.id, label: s.label }))}
          onChange={(v) => {
            onPatch({ sound: v as ReminderSound });
            previewSound(v as ReminderSound);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="small"
          className="nsp-reminder-preview"
          disabled={sound === "system" || sound === "silent"}
          onClick={() => previewSound(sound)}
        >
          معاينة
        </Button>
      </div>
    </div>
  );
}

export function AdhkarRemindersPanel({ group, disabled, ensurePermission, onChanged }: {
  group: ReminderGroup;
  disabled?: boolean;
  /** يطلب الإذن في سياقه (بعد شرح قصير) عند تفعيل أول تذكير */
  ensurePermission: () => Promise<boolean>;
  onChanged: () => void;
}) {
  const [prefs, setPrefs] = useState<AdhkarReminderPrefs>(loadReminderPrefs);
  const cats = REMINDER_CATEGORIES.filter((c) => c.group === group);

  const commit = (next: AdhkarReminderPrefs) => {
    saveReminderPrefs(next);
    setPrefs(next);
    onChanged();
  };
  const patch = (id: string, change: Partial<CategoryPref>) =>
    commit({ ...prefs, categories: { ...prefs.categories, [id]: { ...prefs.categories[id], ...change } } });

  const toggle = async (id: string, on: boolean) => {
    if (on && !(await ensurePermission())) return;
    patch(id, { enabled: on });
  };

  const stopAll = () =>
    commit({
      ...prefs,
      categories: Object.fromEntries(
        Object.entries(prefs.categories).map(([id, p]) => [id, cats.some((c) => c.id === id) ? { ...p, enabled: false } : p]),
      ),
    });

  return (
    <div className="nsp-reminders" data-testid={`adhkar-reminders-${group}`}>
      {cats.map((c) => {
        const p = prefs.categories[c.id] ?? { enabled: c.defaultEnabled };
        return (
          <div key={c.id} className="nsp-reminder">
            <SettingsToggleRow
              id={`rem-${c.id}`}
              title={c.title}
              description={whenSummary(c, p)}
              checked={p.enabled}
              disabled={disabled}
              onChange={(v) => void toggle(c.id, v)}
            />
            {p.enabled && !disabled ? <CategoryDetail c={c} p={p} onPatch={(ch) => patch(c.id, ch)} /> : null}
          </div>
        );
      })}
      {group === "occasions" ? (
        <PrefSelect
          label="تصحيح التاريخ الهجري (تقويم أم القرى)"
          value={String(prefs.hijriOffset)}
          options={[{ value: "-1", label: "يوم قبل" }, { value: "0", label: "بلا تصحيح" }, { value: "1", label: "يوم بعد" }]}
          onChange={(v) => commit({ ...prefs, hijriOffset: Number(v) as -1 | 0 | 1 })}
        />
      ) : null}
      <div className="nsp-confirm-row nsp-reminders__actions">
        <Button type="button" variant="secondary" size="small" disabled={disabled} onClick={stopAll}>
          إيقاف الكل
        </Button>
        <Button type="button" variant="ghost" size="small" disabled={disabled} onClick={() => { setPrefs(resetReminderPrefs()); onChanged(); }}>
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
}
