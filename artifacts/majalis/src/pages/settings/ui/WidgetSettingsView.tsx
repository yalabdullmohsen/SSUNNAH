import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  DEFAULT_WIDGET_PREFS,
  type SunnahWidgetPrefs,
  type WidgetKind,
  type WidgetRefreshMode,
  readWidgetPrefs,
  writeWidgetPrefs,
  syncSunnahWidgets,
  trackWidgetEvent,
  WIDGET_DEEP_LINKS,
  WIDGET_THEME_AA,
} from "@/lib/native-widgets";
import { isSunnahWidgetsSupported } from "@/lib/plugins/sunnah-widgets";
import "@/styles/pages/widget-settings.css";

const KIND_LABELS: Record<WidgetKind, string> = {
  prayer_times: "مواقيت الصلاة",
  next_prayer: "الصلاة القادمة",
  daily_adhkar: "أذكار يومية",
  daily_dua: "دعاء يومي",
  quran_verse: "آية يومية",
  resume_mushaf: "متابعة المصحف",
  learning: "التعلم",
  daily_motivation: "تحفيز يومي",
  prayer_tracking: "متابعة الصلوات",
  smart: "ودجت ذكي",
};

const PHASE1_KINDS: WidgetKind[] = ["next_prayer", "prayer_times", "daily_adhkar", "resume_mushaf"];

export default function WidgetSettingsView() {
  const [prefs, setPrefs] = useState<SunnahWidgetPrefs>(() => readWidgetPrefs());
  const [supported, setSupported] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    trackWidgetEvent({ name: "widget_settings_open" });
    void isSunnahWidgetsSupported().then(setSupported);
  }, []);

  const save = (next: SunnahWidgetPrefs) => {
    const normalized = { ...DEFAULT_WIDGET_PREFS, ...next };
    setPrefs(normalized);
    writeWidgetPrefs(normalized);
    trackWidgetEvent({ name: "widget_prefs_save", kinds: normalized.enabledKinds });
    setStatus("حُفظت الإعدادات.");
  };

  const toggleKind = (kind: WidgetKind) => {
    const set = new Set(prefs.enabledKinds);
    if (set.has(kind)) set.delete(kind);
    else set.add(kind);
    save({ ...prefs, enabledKinds: [...set] });
  };

  const onSync = async () => {
    setSyncing(true);
    setStatus("نحدّث لقطة الودجت…");
    const ok = await syncSunnahWidgets();
    setSyncing(false);
    setStatus(ok ? "تمت مزامنة الودجت." : "المزامنة متاحة على التطبيق الأصلي بعد التثبيت.");
  };

  return (
    <main className="widget-settings" dir="rtl" style={{ ["--ws-ink" as string]: WIDGET_THEME_AA.primaryText }}>
      <header className="widget-settings__hero">
        <p className="widget-settings__eyebrow">سُنّة · ودجت</p>
        <h1 className="widget-settings__title">إعدادات الودجت</h1>
        <p className="widget-settings__sub">
          ودجات الشاشة الرئيسية وقفل الشاشة — عربي RTL · تباين AA · محتوى معتمد فقط.
        </p>
      </header>

      <section className="widget-settings__card" aria-labelledby="ws-status">
        <h2 id="ws-status">الحالة</h2>
        <p>
          الطبقة الأصلية:{" "}
          <strong>{supported ? "مدعومة على هذا الجهاز" : "متاحة بعد تثبيت تطبيق سُنّة (iOS/Android)"}</strong>
        </p>
        <button type="button" className="widget-settings__btn" onClick={() => void onSync()} disabled={syncing}>
          {syncing ? "لحظة…" : "مزامنة الآن"}
        </button>
        {status ? (
          <p className="widget-settings__status" role="status">
            {status}
          </p>
        ) : null}
      </section>

      <section className="widget-settings__card" aria-labelledby="ws-kinds">
        <h2 id="ws-kinds">أنواع الودجت (Phase 1)</h2>
        <ul className="widget-settings__list">
          {PHASE1_KINDS.map((kind) => (
            <li key={kind}>
              <div className="widget-settings__row">
                <input
                  id={`ws-kind-${kind}`}
                  type="checkbox"
                  checked={prefs.enabledKinds.includes(kind)}
                  onChange={() => toggleKind(kind)}
                />
                <span>
                  <label htmlFor={`ws-kind-${kind}`}>
                    <strong>{KIND_LABELS[kind]}</strong>
                  </label>
                  <small>
                    <Link href={WIDGET_DEEP_LINKS[kind]}>{WIDGET_DEEP_LINKS[kind]}</Link>
                  </small>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="widget-settings__hint">قريباً: دعاء · آية · دروس · تحفيز · سلسلة · ذكي.</p>
      </section>

      <section className="widget-settings__card" aria-labelledby="ws-refresh">
        <h2 id="ws-refresh">التحديث</h2>
        <label className="widget-settings__field">
          وضع التحديث
          <select
            value={prefs.refreshMode}
            onChange={(e) => save({ ...prefs, refreshMode: e.target.value as WidgetRefreshMode })}
          >
            <option value="timeline">جدول زمني (موصى به)</option>
            <option value="on_open">عند فتح التطبيق</option>
            <option value="manual">يدوي فقط</option>
          </select>
        </label>
        <label className="widget-settings__row">
          <input
            type="checkbox"
            checked={prefs.autoRotation}
            onChange={(e) => save({ ...prefs, autoRotation: e.target.checked })}
          />
          <span>تدوير تلقائي للمحتوى (أذكار/ذكي)</span>
        </label>
        <label className="widget-settings__field">
          مقياس الخط
          <input
            type="range"
            min={0.85}
            max={1.4}
            step={0.05}
            value={prefs.fontScale}
            onChange={(e) => save({ ...prefs, fontScale: Number(e.target.value) })}
          />
        </label>
      </section>

      <section className="widget-settings__card" aria-labelledby="ws-city">
        <h2 id="ws-city">الموقع وطريقة الحساب</h2>
        <p className="widget-settings__hint">
          تُؤخذ مواقيت الصلاة من إعدادات الصلاة الحالية دون تغيير معادلات الحساب.{" "}
          <Link href="/prayer-times">افتح مواقيت الصلاة</Link>
          {" · "}
          <Link href="/adhan-settings">إعدادات الأذان</Link>
        </p>
        <label className="widget-settings__field">
          تسمية المدينة (عرض الودجت)
          <input
            type="text"
            value={prefs.cityLabel}
            onChange={(e) => save({ ...prefs, cityLabel: e.target.value })}
            placeholder="مثال: الكويت"
            maxLength={80}
          />
        </label>
      </section>
    </main>
  );
}
