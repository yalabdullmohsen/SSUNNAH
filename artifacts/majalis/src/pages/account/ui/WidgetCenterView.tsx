import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";
import { DetailScreen } from "@/components/design-system/screens";
import { SettingsToggleRow } from "@/components/design-system/SettingsList";
import { EmptyStateV2, ErrorStateV2, LoadingStateV2, OfflineStateV2 } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { SearchInput, FormLabel } from "@/components/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppBackButton } from "@/components/common/AppBackButton";
import { isIOS, isNative } from "@/lib/capacitor-utils";
import { getActivePrayerLocation } from "@/lib/prayer-location-prefs";
import { getTodayProgress } from "@/lib/daily-progress";
import { getUserStreak } from "@/lib/user-streak";
import { loadLastPageSync } from "@/lib/quran-last-page";
import { getMyBookmarks } from "@/lib/quran-my-bookmarks";
import { buildSunnahWidgetEnvelope, publishSunnahWidgetEnvelope } from "@/lib/plugins/sunnah-widget-envelope-publish";
import { getAppGroupAvailability, lastWidgetPublicationEpochMs } from "@/lib/widget-data/repository";
import { WIDGET_CENTER_CATALOG } from "@/lib/widget-data/catalog";
import { WIDGET_CENTER_STATE_COPY, type WidgetCenterUxState } from "@/lib/widget-data/center-state";
import { loadWidgetPreferences, saveWidgetPreferences } from "@/lib/widget-data/preferences";
import {
  loadWidgetSelections,
  removeWidgetSelection,
  upsertWidgetSelection,
  WIDGET_CUSTOM_CONTENT_TYPES,
} from "@/lib/widget-data/selections";
import { listWidgetIslamicEvents } from "@/lib/widget-data/islamic-events";
import { WIDGET_FUTURE_BINARY_REQUIRED } from "@/lib/widget-data/types";
import { WIDGET_PROGRESS_CONTRACTS } from "@/lib/widget-data/progress-contract";
import { getCurrentHijriInfo } from "@/lib/hijri-utils";
import "@/styles/pages/settings.css";

const SECTIONS = [
  { id: "catalog", title: "الويدجت المتاحة" },
  { id: "prayer", title: "مواقيت الصلاة" },
  { id: "calendar", title: "التاريخ والمناسبات" },
  { id: "events", title: "المناسبات الإسلامية" },
  { id: "adhkar", title: "الأذكار" },
  { id: "quran", title: "القرآن والمصحف" },
  { id: "custom", title: "المحتوى المخصص" },
  { id: "progress", title: "التقدم والأهداف" },
  { id: "privacy", title: "الخصوصية" },
  { id: "health", title: "حالة البيانات" },
  { id: "help", title: "المساعدة" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function formatWhen(epochMs: number | null): string {
  if (!epochMs) return "لم يُنشر بعد";
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(epochMs));
  } catch {
    return "غير متاح";
  }
}

function PreviewCard({ title, line }: { title: string; line: string }) {
  return (
    <div className="widget-center-preview-card" aria-label={`معاينة ${title}`}>
      <strong>{title}</strong>
      <span>{line}</span>
      <span className="widget-center-meta">معاينة داخل سُنّة — ليست البيانات الحية على الشاشة الرئيسية أو شاشة القفل</span>
    </div>
  );
}

function CenterSelect({
  id,
  label,
  value,
  onValueChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="widget-center-field">
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="min-h-11 text-base" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StateBlock({ state }: { state: WidgetCenterUxState }) {
  const copy = WIDGET_CENTER_STATE_COPY[state];
  if (state === "LOADING") return <LoadingStateV2 title={copy.title} skeletonLines={2} />;
  if (state === "EMPTY") return <EmptyStateV2 title={copy.title} description={copy.description} />;
  if (state === "NO_RESULTS") return <EmptyStateV2 title={copy.title} description={copy.description} />;
  if (state === "ERROR") return <ErrorStateV2 title={copy.title} description={copy.description} homeHref="/settings" homeLabel="الإعدادات" />;
  if (state === "OFFLINE") {
    return (
      <OfflineStateV2
        title={copy.title}
        description={copy.description}
        availableHint="افتح سُنّة عند عودة الشبكة لتحديث اللقطة."
        offlineCenterHref="/settings"
        offlineCenterLabel="الإعدادات"
      />
    );
  }
  return (
    <p className="settings-note" role="status">
      {copy.title}: {copy.description}
    </p>
  );
}

export default function WidgetCenterView() {
  const [section, setSection] = useState<SectionId>("catalog");
  const [query, setQuery] = useState("");
  const [prefs, setPrefs] = useState(() => loadWidgetPreferences());
  const [selections, setSelections] = useState(() => loadWidgetSelections());
  const [healthState, setHealthState] = useState<WidgetCenterUxState>("LOADING");
  const [appGroup, setAppGroup] = useState<boolean | null>(null);
  const [lastPublish, setLastPublish] = useState<number | null>(null);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [customType, setCustomType] = useState<(typeof WIDGET_CUSTOM_CONTENT_TYPES)[number]>("AYAH");
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  useEffect(() => {
    applyPageSeo({
      path: "/widget-center",
      title: "مركز الويدجت | سُنّة",
      description: "تصفح ويدجت سُنّة، أعد بياناتها، وافهم حالتها دون بيانات خاصة.",
      robots: "noindex, follow",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const available = await getAppGroupAvailability();
        if (cancelled) return;
        setAppGroup(available);
        setLastPublish(lastWidgetPublicationEpochMs());
        setHealthState(!online ? "OFFLINE" : "SUCCESS");
      } catch {
        if (!cancelled) setHealthState("ERROR");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [online]);

  const catalog = useMemo(() => {
    const q = query.trim();
    if (!q) return WIDGET_CENTER_CATALOG;
    return WIDGET_CENTER_CATALOG.filter((item) => `${item.nameAr} ${item.descriptionAr} ${item.kind}`.includes(q));
  }, [query]);

  const location = getActivePrayerLocation();
  const progress = getTodayProgress();
  const lastPage = loadLastPageSync();
  const bookmarks = (() => {
    try {
      return getMyBookmarks();
    } catch {
      return [];
    }
  })();
  const streak = (() => {
    try {
      return getUserStreak();
    } catch {
      return { currentStreak: 0, longestStreak: 0 };
    }
  })();
  const hijri = getCurrentHijriInfo() ?? { month: 1, day: 1, monthName: "" };
  const events = listWidgetIslamicEvents({ month: hijri.month, day: hijri.day });
  const envelope = useMemo(() => {
    try {
      return buildSunnahWidgetEnvelope(new Date());
    } catch {
      return null;
    }
  }, [prefs, lastPublish]);

  async function refreshPublication() {
    setBusy(true);
    setRefreshNote(null);
    try {
      if (!isNative || !isIOS) {
        setRefreshNote("النشر إلى App Group يعمل على تطبيق iOS المثبّت بعد التحديث القادم.");
        setHealthState("SUCCESS");
        return;
      }
      const ok = await publishSunnahWidgetEnvelope();
      setLastPublish(lastWidgetPublicationEpochMs());
      setRefreshNote(ok ? "تم تحديث لقطة الويدجت." : "تعذّر النشر. افتح مواقيت الصلاة ثم أعد المحاولة.");
      setHealthState(ok ? "SUCCESS" : "ERROR");
    } catch {
      setHealthState("ERROR");
      setRefreshNote("تعذّر تحديث اللقطة.");
    } finally {
      setBusy(false);
    }
  }

  function patchPrefs(next: Partial<typeof prefs>) {
    setPrefs(saveWidgetPreferences(next));
  }

  return (
    <DetailScreen compose="mark">
      <LegalPageLayout eyebrow="الأدوات" title="مركز الويدجت" density="medium" className="settings-page">
        <AppBackButton variant="inline" fallbackHref="/settings" label="رجوع" />
        <p className="settings-note">
          المعاينات هنا بطاقات داخل سُنّة. الويدجت الأصلية على الشاشة الرئيسية أو شاشة القفل تصل بعد تحديث iOS القادم.
        </p>
        {WIDGET_FUTURE_BINARY_REQUIRED ? (
          <p className="settings-note">يتطلب ظهور الويدجت الأصلية على الجهاز تحديث تطبيق سُنّة من App Store لاحقاً.</p>
        ) : null}

        <nav className="widget-center-nav" aria-label="أقسام مركز الويدجت">
          {SECTIONS.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={section === item.id ? "primary" : "secondary"}
              className="page-action-btn"
              onClick={() => setSection(item.id)}
            >
              {item.title}
            </Button>
          ))}
        </nav>

        {section === "catalog" && (
          <LegalSection title="الويدجت المتاحة">
            <div className="settings-search-field">
              <FormLabel htmlFor="widget-center-search" className="sr-only">
                بحث في الويدجت
              </FormLabel>
              <SearchInput
                id="widget-center-search"
                name="widget-center-search"
                placeholder="ابحث عن ويدجت…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery("")}
              />
            </div>
            {catalog.length === 0 ? (
              <StateBlock state="NO_RESULTS" />
            ) : (
              <ul className="kp-list">
                {catalog.map((item) => (
                  <li key={item.kind}>
                    <PreviewCard title={item.nameAr} line={item.descriptionAr} />
                    <p className="widget-center-meta">
                      الأحجام: {item.families.join(" · ")} · المتطلبات: {item.dataRequirementsAr}
                    </p>
                    <p className="widget-center-meta">
                      الإعداد: {item.configurationAr} · الخصوصية: {item.privacyClass === "public-safe" ? "آمن للعرض" : "تقدّم محلي"}
                    </p>
                    <p className="widget-center-meta">
                      {item.requiresAppOpen ? "قد يلزم فتح سُنّة لتهيئة البيانات." : "يمكن عرضه من اللقطة المنشورة دون فتح فوري."}
                    </p>
                    <p>
                      <Link href={item.deepLink}>فتح المصدر داخل سُنّة</Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </LegalSection>
        )}

        {section === "prayer" && (
          <LegalSection title="مواقيت الصلاة">
            <PreviewCard title="الصلاة التالية" line={String((envelope?.prayerPayload as { nextPrayerNameAr?: string } | undefined)?.nextPrayerNameAr || "افتح مواقيت الصلاة لتهيئة اللقطة")} />
            <p>وضع الموقع: {location.source === "gps" ? "الجهاز" : location.source === "city" ? "مدينة" : "محافظة الكويت"}</p>
            <p>الوصف الظاهر: {location.label}</p>
            <p>المنطقة الزمنية: {location.timeZone}</p>
            <p>طريقة الحساب المعروضة في اللقطة فقط كمعرّف، دون إحداثيات.</p>
            <p>آخر نشر: {formatWhen(lastPublish)}</p>
            <SettingsToggleRow
              id="widget-show-location"
              title="إظهار اسم المكان"
              checked={prefs.showLocationLabel}
              onChange={(on) => patchPrefs({ showLocationLabel: on })}
            />
            <CenterSelect
              id="widget-prayer-mode"
              label="نمط عرض الصلاة"
              value={prefs.prayerDisplayMode}
              onValueChange={(v) => patchPrefs({ prayerDisplayMode: v as typeof prefs.prayerDisplayMode })}
              options={[
                { value: "current", label: "الحالية" },
                { value: "next", label: "التالية" },
                { value: "previous", label: "السابقة" },
                { value: "all", label: "اليوم كاملاً" },
              ]}
            />
            <Button type="button" onClick={() => void refreshPublication()} disabled={busy}>
              تحديث بيانات الصلاة
            </Button>
            <p>
              <Link href="/prayer-times">فتح مواقيت الصلاة</Link>
            </p>
          </LegalSection>
        )}

        {section === "calendar" && (
          <LegalSection title="التاريخ والمناسبات">
            <PreviewCard
              title="التقويم"
              line={String((envelope?.calendarPayload as { displayDateArabic?: string } | undefined)?.displayDateArabic || hijri.monthName || "التاريخ الهجري وفق أم القرى")}
            />
            <p>السلطة: تقويم أم القرى المدني عبر محرك سُنّة المعتمد.</p>
            <CenterSelect
              id="widget-calendar-mode"
              label="نمط التاريخ"
              value={prefs.calendarMode}
              onValueChange={(v) => patchPrefs({ calendarMode: v as typeof prefs.calendarMode })}
              options={[
                { value: "hijri", label: "هجري فقط" },
                { value: "gregorian", label: "ميلادي فقط" },
                { value: "dual", label: "هجري وميلادي" },
              ]}
            />
            <SettingsToggleRow id="widget-hijri" title="إظهار التاريخ الهجري" checked={prefs.showHijriDate} onChange={(on) => patchPrefs({ showHijriDate: on })} />
            <SettingsToggleRow id="widget-greg" title="إظهار التاريخ الميلادي" checked={prefs.showGregorianDate} onChange={(on) => patchPrefs({ showGregorianDate: on })} />
            <p className="settings-note">لا يُخلط بين سلطات تقويم مختلفة. المناسبات المعتمدة على الرؤية تُعرض مؤقتة حتى التأكيد.</p>
          </LegalSection>
        )}

        {section === "events" && (
          <LegalSection title="المناسبات الإسلامية">
            {events.length === 0 ? (
              <StateBlock state="REVIEW_REQUIRED" />
            ) : (
              <ul className="kp-list">
                {events.slice(0, 12).map((event) => (
                  <li key={event.id}>
                    <strong>{event.titleArabic}</strong>
                    <span className="widget-center-badge">{event.confirmationStatus}</span>
                    <p className="widget-center-meta">
                      {event.countdownState}
                      {event.daysUntil != null ? ` · بعد ${event.daysUntil} يوماً` : ""} · {event.widgetEligible ? "ظاهر في الويدجت" : "غير مؤهل"}
                    </p>
                    {event.caveat ? <p className="settings-note">{event.caveat}</p> : null}
                  </li>
                ))}
              </ul>
            )}
            <p>
              <Link href="/occasions">تفاصيل المناسبات</Link>
            </p>
          </LegalSection>
        )}

        {section === "adhkar" && (
          <LegalSection title="الأذكار">
            <PreviewCard title="أذكار الوقت" line="ورد الصباح أو المساء حسب النافذة المعتمدة" />
            <CenterSelect
              id="widget-adhkar-category"
              label="الفئة المفضلة"
              value={prefs.preferredAdhkarCategory}
              onValueChange={(v) => patchPrefs({ preferredAdhkarCategory: v as typeof prefs.preferredAdhkarCategory })}
              options={[
                { value: "morning", label: "الصباح" },
                { value: "evening", label: "المساء" },
                { value: "timeAware", label: "حسب الوقت" },
                { value: "rotating", label: "ذكر اليوم" },
              ]}
            />
            <p>صباح اليوم: {progress["morning-adhkar"] > 0 ? "مكتمل" : "غير مكتمل"}</p>
            <p>مساء اليوم: {progress["evening-adhkar"] > 0 ? "مكتمل" : "غير مكتمل"}</p>
            <p>السلسلة الحالية: {streak.currentStreak > 0 ? streak.currentStreak : "لا سلسلة حتى يُسجَّل إتمام حقيقي"}</p>
            <p className="settings-note">لا تُعدّ الجلسة مكتملة بمجرد فتح الصفحة. الإتمام بعد آخر ذكر في الورد.</p>
            <p>
              <Link href="/adhkar/morning">أذكار الصباح</Link> · <Link href="/adhkar/evening">أذكار المساء</Link>
            </p>
          </LegalSection>
        )}

        {section === "quran" && (
          <LegalSection title="القرآن والمصحف">
            <PreviewCard title="آية اليوم" line="نص معتمد من المستودع دون اختصار مخلّ" />
            <p>آخر موضع: {lastPage != null ? `صفحة ${lastPage}` : "لم يبدأ بعد — لن تُعرض صفحة ١ كتقدم"}</p>
            <p>هدف اليوم: {progress.quran > 0 ? "مسجّل" : "فعّل التتبع بقراءة معتمدة"}</p>
            <p>الإشارات: {bookmarks.length > 0 ? `${bookmarks.length} إشارة` : "لا إشارة مختارة"}</p>
            <CenterSelect
              id="widget-ayah-mode"
              label="مصدر آية الويدجت"
              value={prefs.ayahWidgetMode}
              onValueChange={(v) => patchPrefs({ ayahWidgetMode: v as typeof prefs.ayahWidgetMode })}
              options={[
                { value: "CURATED_ROTATION", label: "دورة مراجعة معتمدة" },
                { value: "USER_SELECTED", label: "اختيارك" },
                { value: "BOOKMARK_SELECTED", label: "من الإشارة" },
              ]}
            />
            <p className="settings-note">النص القرآني من المستودع المعتمد فقط. لا توليد ولا إعادة صياغة.</p>
            <p>
              <Link href="/mushaf">المصحف</Link> · <Link href="/mushaf/bookmarks">الفواصل</Link>
            </p>
          </LegalSection>
        )}

        {section === "custom" && (
          <LegalSection title="المحتوى المخصص">
            <p className="settings-note">النصوص الحرة الخاصة غير مدعومة في الإصدار الأول. كل نسخة ويدجت لها اختيار مستقل.</p>
            <label className="widget-center-field">
              <span>معرّف النسخة</span>
              <input id="widget-instance" defaultValue="custom-1" />
            </label>
            <CenterSelect
              id="widget-content-type"
              label="نوع المحتوى"
              value={customType}
              onValueChange={(v) => setCustomType(v as (typeof WIDGET_CUSTOM_CONTENT_TYPES)[number])}
              options={WIDGET_CUSTOM_CONTENT_TYPES.map((type) => ({ value: type, label: type }))}
            />
            <label className="widget-center-field">
              <span>معرّف العنصر المعتمد</span>
              <input id="widget-content-id" placeholder="ayah:daily أو hadith:daily" defaultValue="ayah:daily" />
            </label>
            <SettingsToggleRow
              id="widget-show-source"
              title="إظهار المصدر"
              checked={prefs.contentSourceVisibility}
              onChange={(on) => patchPrefs({ contentSourceVisibility: on })}
            />
            <Button
              type="button"
              onClick={() => {
                const instanceId = (document.getElementById("widget-instance") as HTMLInputElement | null)?.value || "custom-1";
                const contentType = customType;
                const contentId = (document.getElementById("widget-content-id") as HTMLInputElement | null)?.value || "ayah:daily";
                upsertWidgetSelection({
                  widgetInstanceId: instanceId,
                  contentType,
                  contentId,
                  displayStyle: "standard",
                  showSource: prefs.contentSourceVisibility,
                  textSizePreference: "default",
                });
                patchPrefs({ selectedCustomContentId: contentId });
                setSelections(loadWidgetSelections());
              }}
            >
              حفظ الاختيار
            </Button>
            {selections.length === 0 ? (
              <StateBlock state="CONFIGURATION_REQUIRED" />
            ) : (
              <ul className="kp-list">
                {selections.map((row) => (
                  <li key={row.id}>
                    <strong>{row.widgetInstanceId}</strong> · {row.contentType} · {row.contentId}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        removeWidgetSelection(row.widgetInstanceId);
                        setSelections(loadWidgetSelections());
                      }}
                    >
                      إزالة
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </LegalSection>
        )}

        {section === "progress" && (
          <LegalSection title="التقدم والأهداف">
            {WIDGET_PROGRESS_CONTRACTS.filter((row) => row.widgetEligibility !== "never").map((row) => (
              <p key={row.type} className="widget-center-meta">
                {row.type}: {row.unit} · {row.source} · {row.anonymousBehavior}
              </p>
            ))}
            <p>لا تُعرض نسب إكمال مخترعة. إن لم يوجد تتبع تظهر حالة إعداد صادقة.</p>
            <p>
              <Link href="/progress">مركز التقدّم</Link>
            </p>
          </LegalSection>
        )}

        {section === "privacy" && (
          <LegalSection title="الخصوصية">
            <p>لا تُنشر في حاوية الويدجت: الرموز السرية، البريد، الهاتف، الإحداثيات الدقيقة، الملاحظات الخاصة، أو سجلات الحساب الكاملة.</p>
            <CenterSelect
              id="widget-privacy-level"
              label="مستوى العرض"
              value={prefs.privacyDisplayLevel}
              onValueChange={(v) => patchPrefs({ privacyDisplayLevel: v as typeof prefs.privacyDisplayLevel })}
              options={[
                { value: "minimal", label: "أدنى" },
                { value: "standard", label: "قياسي" },
              ]}
            />
            <p>
              <Link href="/privacy-center">مركز الخصوصية</Link>
            </p>
          </LegalSection>
        )}

        {section === "health" && (
          <LegalSection title="حالة البيانات">
            {healthState !== "SUCCESS" ? <StateBlock state={healthState} /> : null}
            <p>App Group: {appGroup == null ? "يُفحص على iOS" : appGroup ? "متاح" : "غير متاح على هذا السطح"}</p>
            <p>المخطط: 1</p>
            <p>آخر نشر: {formatWhen(lastPublish)}</p>
            <p>السطح الحالي: {isNative && isIOS ? "تطبيق iOS المثبّت" : "ويب / سطح بلا ويدجت النظام"}</p>
            <p>تحديث ثنائي مستقبلي: {WIDGET_FUTURE_BINARY_REQUIRED ? "مطلوب" : "غير مطلوب"}</p>
            <p className="settings-note">لا يُعرض JSON الخام أو الأسرار هنا.</p>
            {refreshNote ? <p role="status">{refreshNote}</p> : null}
            <Button type="button" onClick={() => void refreshPublication()} disabled={busy} loading={busy}>
              تحديث بيانات الويدجت
            </Button>
          </LegalSection>
        )}

        {section === "help" && (
          <LegalSection title="المساعدة">
            <ol>
              <li>على iPhone: اضغط مطولاً على الشاشة الرئيسية أو شاشة القفل ثم «إضافة ويدجت» واختر سُنّة.</li>
              <li>لتحرير ويدجت: اضغط مطولاً عليها ثم «تحرير الويدجت».</li>
              <li>إن نقصت البيانات افتح سُنّة مرة لتهيئة اللقطة ثم حدّث من هذا المركز.</li>
              <li>شاشة القفل تختلف عن الرئيسية في المساحة والعدّ التنازلي الحي.</li>
              <li>معاينة المعرض ليست البيانات الحية على الجهاز.</li>
              <li>Build الحالي 55 لا يستلم مصدر الويدجت الجديد إلا بعد تحديث ثنائي لاحق.</li>
            </ol>
            <p>
              <Link href="/settings">العودة إلى الإعدادات</Link>
            </p>
          </LegalSection>
        )}
      </LegalPageLayout>
    </DetailScreen>
  );
}
