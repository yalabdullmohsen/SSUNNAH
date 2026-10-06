import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { STATUS } from "@/lib/ui-copy";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";
import { UtilityScreen } from "@/components/design-system/screens";
import { SettingsToggleRow } from "@/components/design-system/SettingsList";
import { NavigationList } from "@/components/design-system/ListSystem";
import { AppCard } from "@/components/design-system/AppCard";
import { FieldError, FieldLabel, FormLabel, SearchInput } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { useFontPreference } from "@/components/FontPreferenceProvider";
import { useThemePreference } from "@/components/ThemePreferenceProvider";
import { useUserPreferences } from "@/components/UserPreferencesProvider";
import { THEME_OPTIONS, type ThemePreference } from "@/lib/theme-preference";
import { clearQuranCache } from "@/lib/quran-api";
import { type UserPreferences } from "@/lib/user-preferences";
import { clearLocalBookmarks } from "@/lib/local-bookmarks";
import { clearOfflineReading } from "@/lib/offline-reading-pack";
import { useQuranPreferences, type QuranFontId } from "@/hooks/useQuranPreferences";
import {
  clampQuranFontSize,
  clampReadingTextSize,
  QURAN_FONT_MAX_PX,
  QURAN_FONT_MIN_PX,
  QURAN_FONT_STEP_PX,
  READING_TEXT_MAX_PX,
  READING_TEXT_MIN_PX,
} from "@/lib/quran-font-size";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import {
  loadPlaybackRate,
  loadReciterId,
  savePlaybackRate,
  saveReciterId,
  VALID_PLAYBACK_RATES,
} from "@/lib/quran-audio";
import { useVerifiedReciters } from "@/hooks/useVerifiedReciters";
import { useDialogKeyboard } from "@/hooks/useDialogKeyboard";
import {
  MUSHAF_TAFSIR_EDITIONS,
  persistTafsirEdition,
  readStoredTafsirEdition,
} from "@/lib/quran-data";
import { restoreDefaultAppSettings } from "@/lib/restore-default-settings";
import { loadNotifPrefs } from "@/lib/local-notifications";
import { loadAdhanPrefs } from "@/lib/adhan-preferences";
import { loadPrayerAlertPrefs } from "@/lib/prayer-alert-preferences";
import { MushafDisplayModeControl } from "@/features/mushaf-reader/MushafDisplayModeControl";
import {
  MUSHAF_APPEARANCE_CHANGE_EVENT,
  loadMushafAppearanceMode,
  type MushafAppearanceMode,
} from "@/lib/mushaf-v2/appearance-prefs";
import { QuranSettingsRepository } from "@/lib/mushaf-v2/QuranSettingsRepository";
import {
  fetchLiveVersionInfo,
  getDisplayedAppVersion,
  refreshAppAndPurgeCaches,
} from "@/lib/runtime-cache-purge";
import "@/styles/pages/settings.css";
import "@/styles/pages/profile-hub-v2.css";

const ReciterDownloadManager = lazy(() =>
  import("@/components/quran/ReciterDownloadManager").then((m) => ({
    default: m.ReciterDownloadManager,
  })),
);

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <SettingsToggleRow
      id={`settings-toggle-${label.replace(/\s+/g, "-")}`}
      title={label}
      description={description}
      checked={checked}
      onChange={onChange}
    />
  );
}

type SectionDef = {
  id: string;
  title: string;
  keywords: string;
};

export default function SettingsPage() {
  const { user, isLoggedIn, logout, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [reciterId, setReciterIdState] = useState(loadReciterId);
  const [tafsirId, setTafsirIdState] = useState(readStoredTafsirEdition);
  const [playbackRate, setPlaybackRateState] = useState(loadPlaybackRate);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const closeDeleteDialog = useCallback(() => setDeleteDialogOpen(false), []);
  // حوار modal: تركيز أولي على «إلغاء» (الخيار الآمن) · Escape يغلق · حبس Tab · إعادة التركيز للمُشغِّل
  useDialogKeyboard(deleteDialogOpen, deleteDialogRef, closeDeleteDialog, {
    initialFocusRef: deleteCancelRef,
    trapFocus: true,
  });
  const [cacheRefreshBusy, setCacheRefreshBusy] = useState(false);
  const [cacheRefreshNote, setCacheRefreshNote] = useState<string | null>(null);
  const [displayedAppVersion, setDisplayedAppVersion] = useState<string | null>(() => getDisplayedAppVersion());
  /* حالات قراءة فقط من مصادرها الوحيدة — لا تبديل مكرر هنا */
  const [prayerAlertsOn] = useState(() => {
    try {
      return Boolean(loadAdhanPrefs().globalEnabled || loadPrayerAlertPrefs().alertsEnabled);
    } catch {
      return false;
    }
  });
  const [contentRemindersOn] = useState(() => {
    try {
      return loadNotifPrefs().enabled;
    } catch {
      return false;
    }
  });
  const [mushafDisplayMode, setMushafDisplayMode] = useState<MushafAppearanceMode>(() =>
    loadMushafAppearanceMode(),
  );

  useEffect(() => {
    setDisplayedAppVersion(getDisplayedAppVersion());
    let cancelled = false;
    void fetchLiveVersionInfo().then((live) => {
      if (!cancelled && live?.shortCommit) setDisplayedAppVersion(live.shortCommit);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onChange = () => setMushafDisplayMode(loadMushafAppearanceMode());
    window.addEventListener(MUSHAF_APPEARANCE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(MUSHAF_APPEARANCE_CHANGE_EVENT, onChange);
  }, []);

  useEffect(() => {
    applyPageSeo({
      path: "/settings",
      title: "الإعدادات | سُنّة",
      description: "إعدادات القراءة والصوت والتذكيرات والخصوصية في سُنّة.",
      keywords: ["إعدادات", "سُنّة", "تفضيلات"],
      robots: "noindex, follow",
    });
  }, []);

  const { t } = useLanguage();
  const { preference: fontPreference } = useFontPreference();
  const {
    preference: themePreference,
    resolvedTheme,
    setPreference: setThemePreference,
  } = useThemePreference();
  const { prefs: quranPrefs, setPref: setQuranPref, bumpFont } = useQuranPreferences();
  const { preferences, updatePreferences } = useUserPreferences();
  /** مسودة مقياس الخط أثناء السحب — تُلتزَم عند الإفلات فقط لتجنّب وميض التخطيط */
  const [draftQuranScale, setDraftQuranScale] = useState(quranPrefs.fontScale);
  const [draftReadingSize, setDraftReadingSize] = useState(
    () => clampReadingTextSize(Number(preferences.readingTextSize) || 17),
  );

  useEffect(() => {
    setDraftQuranScale(quranPrefs.fontScale);
  }, [quranPrefs.fontScale]);

  useEffect(() => {
    setDraftReadingSize(clampReadingTextSize(Number(preferences.readingTextSize) || 17));
  }, [preferences.readingTextSize]);

  const commitQuranScale = (raw: number) => {
    const next = clampQuranFontSize(raw);
    setDraftQuranScale(next);
    setQuranPref("fontScale", next);
  };

  const commitReadingSize = (raw: number) => {
    const next = clampReadingTextSize(raw);
    setDraftReadingSize(next);
    updatePreferences({ readingTextSize: String(next) });
  };

  const update = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    updatePreferences({ [key]: value });
  };

  const reciters = useVerifiedReciters();
  const tafsirs = useMemo(() => MUSHAF_TAFSIR_EDITIONS, []);

  const sections: SectionDef[] = [
    {
      id: "appearance",
      title: "العرض والمظهر",
      keywords: "سمة ثيم مظهر تباين كثافة كبار السن خط واجهة لغة اهتزاز لمس",
    },
    {
      id: "reading",
      title: "القراءة والمصحف",
      keywords: "قراءة قرآن مصحف خط تفسير حجم تباعد قارئ سرعة تلاوة صوت تنزيل كاش مساحة دون اتصال تخزين بيانات",
    },
    {
      id: "prayer",
      title: "الصلاة والأذان",
      keywords: "صلاة أذان مواقيت إقامة مؤذن تنبيه ويدجت widget موقع",
    },
    {
      id: "notifications",
      title: "الإشعارات",
      keywords: "إشعار تذكير أذكار قرآن ورد مراجعة جمعة مناسبات هدوء إذن",
    },
    {
      id: "privacy",
      title: "الخصوصية والحساب",
      keywords: "حساب دخول تسجيل خروج حذف الحساب ملف خصوصية تصدير بيانات مسح",
    },
    { id: "about", title: "حول", keywords: "حول نسخة تحديث سياسة شروط دعم مصادر جولة مزايا مساعدة" },
  ];

  const q = query.trim().toLowerCase();
  const visible = (sec: SectionDef) => {
    if (!q) return true;
    return `${sec.title} ${sec.keywords}`.toLowerCase().includes(q);
  };

  const setSeniorMode = (on: boolean) => {
    if (on) {
      updatePreferences({
        seniorMode: true,
        fontSize: "كبير",
        highContrast: true,
        uiDensity: "comfortable",
        readingTextSize: String(Math.max(22, Number(preferences.readingTextSize) || 17)),
        readingSpacing: "واسع",
      });
    } else {
      update("seniorMode", false);
    }
  };

  return (
    <UtilityScreen compose="mark">
    <LegalPageLayout
      eyebrow={t("settings_eyebrow")}
      title={t("settings_title")}
      density="medium"
      className="settings-page"
    >
      <div className="settings-search-wrap">
        <div className="settings-search-field">
          <FormLabel htmlFor="settings-search" className="sr-only">
            بحث في الإعدادات
          </FormLabel>
          <SearchInput
            id="settings-search"
            name="settings-search"
            placeholder="ابحث في الإعدادات…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="page-action-btn page-action-btn--secondary"
          onClick={() => {
            restoreDefaultAppSettings(updatePreferences);
            setThemePreference("auto");
            setReciterIdState(loadReciterId());
            setTafsirIdState(readStoredTafsirEdition());
            setPlaybackRateState(1);
          }}
        >
          استعادة الإعدادات الافتراضية
        </Button>
      </div>

      {visible(sections[0]!) && (
        <LegalSection title={sections[0]!.title}>
          <div className="settings-field settings-field--lang">
            <span>{t("settings_language")}</span>
            <LanguageSwitcher />
          </div>
          <p className="settings-note">{t("lang_overlay_note")}</p>
          <p className="settings-note">السمة والمظهر</p>
          <NavigationList
            rows={THEME_OPTIONS.map((option) => ({
              id: `theme-${option.id}`,
              title: option.label,
              description: option.description,
              value: themePreference === option.id ? "✓" : undefined,
              onClick: () => setThemePreference(option.id as ThemePreference),
              testId: `settings-theme-${option.id}`,
            }))}
          />
          <p className="settings-note">
            الوضع الحالي: {resolvedTheme === "dark" ? "داكن" : "فاتح"}
          </p>
          <ToggleRow
            label="وضع كبار السن"
            description="خط أوضح وتباين أعلى ومسافات أوسع للقراءة"
            checked={preferences.seniorMode}
            onChange={setSeniorMode}
          />
          <ToggleRow
            label="تباين مرتفع"
            description="يزيد وضوح النص والحدود دون تغيير لون الهوية"
            checked={preferences.highContrast}
            onChange={(value) => update("highContrast", value)}
          />
          <ToggleRow
            label="الاهتزاز اللمسي"
            description="اهتزاز خفيف عند العدّ في المسبحة والأذكار والتفاعلات (حسب دعم الجهاز)"
            checked={preferences.hapticsEnabled}
            onChange={(value) => update("hapticsEnabled", value)}
          />
          <div className="settings-field">
            <FieldLabel htmlFor="interface-font-size">{t("settings_font_size")}</FieldLabel>
            <Select
              value={preferences.fontSize}
              onValueChange={(v) => update("fontSize", v as UserPreferences["fontSize"])}
            >
              <SelectTrigger
                id="interface-font-size"
                name="interface-font-size"
                className="min-h-11 text-base"
                aria-label={t("settings_font_size")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="صغير">صغير</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="كبير">كبير</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </LegalSection>
      )}

      {visible(sections[1]!) && (
        <LegalSection title={sections[1]!.title}>
          <MushafDisplayModeControl
            value={mushafDisplayMode}
            onChange={(mode) => {
              QuranSettingsRepository.setAppearanceMode(mode);
              QuranSettingsRepository.applyAppearance(mode);
              setMushafDisplayMode(mode);
            }}
          />
          <p className="settings-note">
            يؤثر على المصحف فقط ولا يغيّر مظهر بقية التطبيق.
          </p>
          <label className="settings-field">
            <span>{t("settings_reading_size")}</span>
            <input
              type="range"
              name="reading-text-size"
              min={READING_TEXT_MIN_PX}
              max={READING_TEXT_MAX_PX}
              value={draftReadingSize}
              onInput={(e) => setDraftReadingSize(Number(e.currentTarget.value))}
              onPointerUp={(e) => commitReadingSize(Number(e.currentTarget.value))}
              onKeyUp={(e) => commitReadingSize(Number((e.target as HTMLInputElement).value))}
              onBlur={(e) => commitReadingSize(Number(e.currentTarget.value))}
            />
            <strong className="mj-bidi-isolate">{draftReadingSize}px</strong>
          </label>
          <label className="settings-field">
            <span>{t("settings_quran_font_size")}</span>
            <input
              type="range"
              min={QURAN_FONT_MIN_PX}
              max={QURAN_FONT_MAX_PX}
              step={QURAN_FONT_STEP_PX}
              value={draftQuranScale}
              onInput={(e) => setDraftQuranScale(Number(e.currentTarget.value))}
              onPointerUp={(e) => commitQuranScale(Number(e.currentTarget.value))}
              onKeyUp={(e) => commitQuranScale(Number((e.target as HTMLInputElement).value))}
              onBlur={(e) => commitQuranScale(Number(e.currentTarget.value))}
            />
            <strong className="mj-bidi-isolate">{draftQuranScale}px</strong>
          </label>
          <div className="settings-field">
            <FieldLabel htmlFor="settings-quran-font">{t("settings_quran_font")}</FieldLabel>
            <Select
              value={quranPrefs.fontId}
              onValueChange={(v) => setQuranPref("fontId", v as QuranFontId)}
            >
              <SelectTrigger
                id="settings-quran-font"
                className="min-h-11 text-base"
                aria-label={t("settings_quran_font")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uthmani">قرآني (Amiri Quran)</SelectItem>
                <SelectItem value="naskh">الواجهة (IBM Plex Sans Arabic)</SelectItem>
                <SelectItem value="amiri">أميري (Amiri)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="settings-actions">
            <Button type="button" variant="ghost" size="small" className="ds-btn ds-btn--ghost" onClick={() => bumpFont(2)}>
              {t("settings_quran_font_up")}
            </Button>
            <Button type="button" variant="ghost" size="small" className="ds-btn ds-btn--ghost" onClick={() => bumpFont(-2)}>
              {t("settings_quran_font_down")}
            </Button>
          </div>
          <p className="settings-subhead">التلاوة والصوت</p>
          <label className="settings-field">
            <span>القارئ المفضّل</span>
            <select
              value={reciterId}
              onChange={(e) => {
                saveReciterId(e.target.value);
                setReciterIdState(e.target.value);
              }}
            >
              {reciters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr}
                </option>
              ))}
            </select>
          </label>
          <p className="settings-note">يُستخدم في مشغّل التلاوة داخل المصحف</p>
          <label className="settings-field">
            <span>التفسير المفضّل</span>
            <select
              value={tafsirId}
              onChange={(e) => {
                persistTafsirEdition(e.target.value);
                setTafsirIdState(e.target.value);
              }}
            >
              {tafsirs.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.label}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-field">
            <FieldLabel htmlFor="settings-playback-rate">سرعة التشغيل</FieldLabel>
            <Select
              value={String(playbackRate)}
              onValueChange={(v) => {
                const rate = Number(v);
                savePlaybackRate(rate);
                setPlaybackRateState(rate);
              }}
            >
              <SelectTrigger
                id="settings-playback-rate"
                className="min-h-11 text-base"
                aria-label="سرعة التشغيل"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VALID_PLAYBACK_RATES.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    {rate}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ToggleRow
            label="توفير البيانات"
            description="يقلّل إحماء الوسائط الثقيلة عند الاتصال الضعيف"
            checked={preferences.dataSaver}
            onChange={(value) => update("dataSaver", value)}
          />
          <p className="settings-subhead">التنزيلات والتخزين</p>
          <NavigationList
            rows={[
              { id: "vault", title: "مخزن المعرفة دون اتصال", href: "/vault" },
              {
                id: "clear-quran-cache",
                title: t("settings_clear_quran_cache"),
                onClick: () => clearQuranCache(),
              },
            ]}
          />
          <p className="settings-note">
            تنزيل تلاوة السور كاملة للقرّاء المُحقَّقين QA — للاستماع دون اتصال.
          </p>
          <Suspense fallback={<p className="settings-note">تحديث إدارة التنزيلات…</p>}>
            <ReciterDownloadManager />
          </Suspense>
        </LegalSection>
      )}

      {visible(sections[2]!) && (
        <LegalSection title={sections[2]!.title}>
          <NavigationList
            rows={[
              {
                id: "adhan",
                title: "إعدادات الأذان والتنبيهات",
                description: "المؤذن، التنبيه قبل الأذان وبعده، الإقامة، والصلوات المفعّلة",
                value: prayerAlertsOn ? "مفعّلة" : "متوقفة",
                href: "/adhan-settings",
                testId: "settings-adhan-link",
              },
              { id: "prayer-times", title: "مواقيت الصلاة والموقع", href: "/prayer-times" },
              { id: "widget-center", title: "مركز الويدجت", href: "/widget-center" },
            ]}
          />
        </LegalSection>
      )}

      {visible(sections[3]!) && (
        <LegalSection title={sections[3]!.title}>
          <p className="settings-note">
            كل التذكيرات في مكان واحد: الأذكار، ورد القرآن، المراجعة، الجمعة والمناسبات، وساعات الهدوء.
          </p>
          <NavigationList
            rows={[
              {
                id: "notif-hub",
                title: "الإشعارات والتذكيرات",
                description: "الإذن، الفئات، ساعات الهدوء، وصندوق الإشعارات",
                value: contentRemindersOn ? "مفعّلة" : "متوقفة",
                href: "/notification-settings",
                testId: "settings-notifications-link",
              },
            ]}
          />
        </LegalSection>
      )}

      {visible(sections[4]!) && (
        <LegalSection title={sections[4]!.title}>
          <AppCard
            as="section"
            className="settings-account-card"
            data-ss-surface="inset"
          >
            <div className="settings-avatar" aria-hidden="true">
              {(user?.profile?.full_name || user?.email || "م").slice(0, 1)}
            </div>
            <div>
              <p>
                <strong>{t("settings_name")}:</strong>{" "}
                {user?.profile?.full_name || t("settings_guest")}
              </p>
              <p>
                <strong>{t("settings_email")}:</strong>{" "}
                {user?.email || t("settings_not_logged_in")}
              </p>
            </div>
          </AppCard>
          {authLoading ? (
            <p className="settings-auth-pending" aria-busy="true" aria-label="تحديث الحساب">
              …
            </p>
          ) : (
            <NavigationList
              rows={
                isLoggedIn
                  ? [
                      {
                        id: "logout",
                        title: t("settings_logout"),
                        onClick: () => logout(),
                      },
                      {
                        id: "delete-account",
                        title: t("settings_delete_account"),
                        onClick: () => setDeleteDialogOpen(true),
                        danger: true,
                        testId: "settings-delete-account",
                      },
                    ]
                  : [
                      { id: "login", title: t("settings_login"), href: "/login" },
                      { id: "register", title: t("settings_register"), href: "/register" },
                    ]
              }
            />
          )}
          {deleteDialogOpen ? (
            <div
              ref={deleteDialogRef}
              className="settings-delete-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="settings-delete-title"
              aria-describedby="settings-delete-desc"
            >
              <div className="settings-delete-dialog__panel">
                <h2 id="settings-delete-title">تأكيد حذف الحساب</h2>
                <p id="settings-delete-desc">
                  سيُحذف حسابك وبيانات المصادقة وجميع بياناتك الشخصية المرتبطة به نهائيًا
                  ولا يمكن التراجع عن ذلك. المحتوى العلمي العام غير المرتبط بحسابك يبقى متاحًا للجميع.
                </p>
                <div className="settings-delete-dialog__actions">
                  <Link
                    href="/account-deletion?confirm=1"
                    className="page-action-btn page-action-btn--danger"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    المتابعة إلى الحذف النهائي
                  </Link>
                  <Button
                    ref={deleteCancelRef}
                    type="button"
                    variant="secondary"
                    className="page-action-btn page-action-btn--secondary"
                    onClick={closeDeleteDialog}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <p>{t("settings_privacy_desc")}</p>
          <NavigationList
            rows={[
              { id: "privacy-center", title: "مركز الخصوصية", href: "/privacy-center" },
              { id: "privacy-policy", title: "سياسة الخصوصية", href: "/privacy" },
              ...(isLoggedIn
                ? ([
                    {
                      id: "account-deletion",
                      title: "حذف الحساب نهائياً",
                      href: "/account-deletion",
                      danger: true,
                    },
                  ] as const)
                : []),
              {
                id: "download-prefs",
                title: t("settings_download_data"),
                onClick: () => {
                  const blob = new Blob(
                    [JSON.stringify({ preferences, fontPreference }, null, 2)],
                    { type: "application/json" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "majalis-settings.json";
                  a.click();
                  URL.revokeObjectURL(url);
                },
              },
              ...(isLoggedIn
                ? [
                    {
                      id: "export-server",
                      title: "تصدير بيانات الحساب (خادم)",
                      onClick: () => {
                        void (async () => {
                          const {
                            data: { session },
                          } = await supabase.auth.getSession();
                          const token = session?.access_token;
                          if (!token) return;
                          const res = await fetch("/api/account/export", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          const body = await res.json().catch(() => ({}));
                          if (!res.ok) return;
                          const blob = new Blob([JSON.stringify(body, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "ssunnah-data-export.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        })();
                      },
                    },
                  ]
                : []),
              {
                id: "clear-local",
                title: t("settings_clear_local"),
                danger: true,
                onClick: () => {
                  restoreDefaultAppSettings(updatePreferences);
                  clearLocalBookmarks();
                  void clearOfflineReading();
                  void import("@/lib/clear-user-local-data").then(({ clearUserLocalDataAndMedia }) =>
                    clearUserLocalDataAndMedia(),
                  );
                },
              },
            ]}
          />
        </LegalSection>
      )}

      {visible(sections[5]!) && (
        <LegalSection title={sections[5]!.title}>
          <p className="settings-note">
            أعد مشاهدة جولة المزايا لتتعرّف على المصحف والصلاة والأذكار والبحث والتنبيهات.
          </p>
          <NavigationList
            rows={[
              { id: "feature-tour", title: "جولة المزايا", href: "/feature-tour" },
              {
                id: "refresh-version",
                title: cacheRefreshBusy ? "يُحدَّث…" : "تحديث النسخة",
                description: "يمسح كاش الواجهة ويعيد تحميل آخر نسخة منشورة",
                onClick: () => {
                  if (cacheRefreshBusy) return;
                  setCacheRefreshBusy(true);
                  setCacheRefreshNote("يُحدَّث الآن…");
                  void refreshAppAndPurgeCaches()
                    .then((result) => {
                      if (result.shortCommit) setDisplayedAppVersion(result.shortCommit);
                      if (result.ok) {
                        setCacheRefreshNote("تم تحديث النسخة — يُعاد التحميل…");
                      } else {
                        setCacheRefreshBusy(false);
                        setCacheRefreshNote("النسخة محدّثة بالفعل.");
                      }
                    })
                    .catch(() => {
                      setCacheRefreshBusy(false);
                      setCacheRefreshNote(STATUS.loadError);
                    });
                },
                disabled: cacheRefreshBusy,
                testId: "refresh-app-version",
              },
              { id: "about", title: "حول التطبيق", href: "/about" },
              { id: "licenses", title: "المصادر والتراخيص", href: "/data-licenses" },
              { id: "contact", title: "الدعم الفني", href: "/support" },
              { id: "terms", title: "شروط الاستخدام", href: "/terms" },
            ]}
          />
          {displayedAppVersion ? (
            <p className="settings-note" dir="ltr" data-testid="app-version-commit">
              النسخة الحالية: {displayedAppVersion}
            </p>
          ) : null}
          {cacheRefreshNote === STATUS.loadError ? (
            <FieldError id="settings-cache-refresh-error" className="settings-note">
              {cacheRefreshNote}
            </FieldError>
          ) : cacheRefreshNote ? (
            <p className="settings-note" role="status">
              {cacheRefreshNote}
            </p>
          ) : null}
        </LegalSection>
      )}
</LegalPageLayout>
    </UtilityScreen>
  );
}
