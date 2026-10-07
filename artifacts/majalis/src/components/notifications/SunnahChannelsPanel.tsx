/**
 * لوحة الهدوء والإيقاف — ساعات الهدوء (مُطبَّقة فعليًا على الجدولة) + إيقاف غير الضروري.
 * الصلاة مستقلة دائمًا (محرك الأذان) ولا تتأثر بهذه اللوحة.
 *
 * كانت اللوحة تعرض «قنوات سُنّة» (تعلّم/محتوى جديد/تحديثات…) تُحفَظ ولا يقرؤها أي مُجدوِل،
 * وساعات هدوء لا يطبّقها شيء — أُزيلت القنوات الميتة ووُصلت ساعات الهدوء
 * بـ smart-local-notifications وdhikr-phrase-reminders وscheduleIslamicReminder.
 */

import { useState } from "react";
import {
  disableAllNonEssentialChannels,
  loadSunnahNotificationPrefs,
  saveSunnahNotificationPrefs,
  trackNotificationTelemetry,
  type SunnahNotificationPrefs,
} from "@/lib/sunnah-notifications";
import { loadNotifPrefs, saveNotifPrefs } from "@/lib/local-notifications";
import { toArabicDigits } from "@/lib/utils";
import { SettingsToggleRow } from "@/components/design-system/SettingsList";
import { FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function hourLabel(h: number): string {
  const period = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${toArabicDigits(h12)}:٠٠ ${period}`;
}

async function resyncSchedules(): Promise<void> {
  const { syncSmartLocalNotifications } = await import("@/lib/smart-local-notifications");
  await syncSmartLocalNotifications();
}

export function SunnahChannelsPanel({ onStopAll }: { onStopAll?: () => void }) {
  const [prefs, setPrefs] = useState<SunnahNotificationPrefs>(() => loadSunnahNotificationPrefs());
  const [stopped, setStopped] = useState(false);

  const persist = (next: SunnahNotificationPrefs) => {
    saveSunnahNotificationPrefs(next);
    setPrefs(loadSunnahNotificationPrefs());
    void resyncSchedules();
  };

  const quiet = prefs.quietHours;

  return (
    <section className="notif-card" aria-labelledby="notif-quiet-title">
      <h2 className="notif-card__title" id="notif-quiet-title">
        الهدوء والإيقاف
      </h2>

      <SettingsToggleRow
        id="notif-quiet-hours"
        title="ساعات الهدوء"
        description="لا تصل تذكيرات المحتوى خلالها — تنبيهات الصلاة وأوقات الأذكار لا تتأثر"
        checked={quiet.enabled}
        onChange={(enabled) => persist({ ...prefs, quietHours: { ...quiet, enabled } })}
      />

      {quiet.enabled ? (
        <div className="nsp-quiet-range">
          {(
            [
              { key: "startHour", id: "notif-quiet-start", label: "من" },
              { key: "endHour", id: "notif-quiet-end", label: "إلى" },
            ] as const
          ).map((field) => (
            <div key={field.key} className="nsp-quiet-range__field">
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              <Select
                value={String(quiet[field.key])}
                onValueChange={(v) =>
                  persist({ ...prefs, quietHours: { ...quiet, [field.key]: Number(v) } })
                }
              >
                <SelectTrigger
                  id={field.id}
                  className="min-h-11 text-base"
                  aria-label={`${field.label} — ساعات الهدوء`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {hourLabel(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="page-action-btn page-action-btn--secondary notif-stop-all"
        onClick={() => {
          const current = loadNotifPrefs();
          saveNotifPrefs({
            ...current,
            enabled: false,
            quranDailyReminder: false,
            adhkarReminder: false,
            flashcardsReminder: false,
            dhikrPhraseReminder: false,
            sections: {
              quran: { enabled: false },
              adhkar: { enabled: false },
              seekingKnowledge: { enabled: false },
              fridayOccasions: { enabled: false },
            },
          });
          setPrefs(disableAllNonEssentialChannels());
          trackNotificationTelemetry("category_disabled", { channel: "all_non_essential" });
          void resyncSchedules();
          setStopped(true);
          onStopAll?.();
        }}
      >
        إيقاف جميع الإشعارات غير الضرورية
      </Button>
      {stopped ? (
        <p className="notif-row__sub" role="status">
          أُوقفت كل تذكيرات المحتوى. تنبيهات الصلاة باقية كما ضبطتها في إعدادات الأذان.
        </p>
      ) : null}
    </section>
  );
}
