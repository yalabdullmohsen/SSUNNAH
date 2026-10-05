import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "wouter";
import { Archive, Bell, CheckCheck, MoonStar, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-common";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";
import { hapticTap, isNative } from "@/lib/capacitor-utils";
import { toArabicDigits } from "@/lib/utils";
import { navigateTo } from "@/lib/navigation-intent";
import {
  loadNotifPrefs,
  saveNotifPrefs,
  updateNotifSection,
  type NotifPrefs,
} from "@/lib/local-notifications";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  type PermissionStatus,
} from "@/lib/prayer-local-notifications";
import { loadAdhanPrefs } from "@/lib/adhan-preferences";
import { loadPrayerAlertPrefs } from "@/lib/prayer-alert-preferences";
import { getPushSupport } from "@/lib/push-notifications";
import { openSystemNotificationSettings } from "@/lib/sunnah-notifications/permission";
import {
  loadHistory,
  markRead,
  markAllRead,
  archiveRecord,
  deleteRecord,
  clearAll,
  searchHistory,
  type NotifRecord,
} from "@/lib/notification-history";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY, STATUS } from "@/lib/ui-copy";
import { PushPrompt } from "@/components/PushPrompt";
import { SunnahChannelsPanel } from "@/components/notifications/SunnahChannelsPanel";
import { fireTestLocalNotification } from "@/lib/notifications/test-trigger";
import "@/styles/pages/notifications.css";
import { UtilityScreen } from "@/components/design-system/screens";
import { SettingsList, SettingsToggleRow } from "@/components/design-system/SettingsList";
import { NOTIF_SECTIONS, type NotifSectionId } from "@/lib/notifications/sections-config";

type HistoryTab = "inbox" | "archived";

function isDevToolsVisible(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (import.meta.env.DEV) return true;
    return new URLSearchParams(window.location.search).get("notifDebug") === "1";
  } catch {
    return false;
  }
}

/** تسمية اليوم بالعربية لرأس التجميع: اليوم / أمس / تاريخ مختصر. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  return d.toLocaleDateString("ar-KW", {
    day: "numeric",
    month: "long",
    year: diffDays > 300 ? "numeric" : undefined,
  });
}

/** تجميع سجل مرتّب تنازليًا حسب اليوم — يحافظ على الترتيب الزمني داخل كل مجموعة. */
function groupByDay(records: NotifRecord[]): { label: string; items: NotifRecord[] }[] {
  const groups: { label: string; items: NotifRecord[] }[] = [];
  for (const rec of records) {
    const label = dayLabel(rec.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(rec);
    else groups.push({ label, items: [rec] });
  }
  return groups;
}

const SWIPE_REVEAL = 76;

function NotifRow({
  rec,
  onRead,
  onArchive,
  onDelete,
}: {
  rec: NotifRecord;
  onRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const timeStr = new Date(rec.createdAt).toLocaleTimeString("ar-KW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const baseX = useRef(0);
  const pointerId = useRef<number | null>(null);
  const revealed = useRef(false);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") return;
    startX.current = e.clientX;
    baseX.current = dragX;
    pointerId.current = e.pointerId;
    revealed.current = dragX <= -SWIPE_REVEAL / 2;
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (startX.current === null || pointerId.current !== e.pointerId) return;
    const next = Math.min(
      0,
      Math.max(baseX.current + (e.clientX - startX.current), -SWIPE_REVEAL - 24),
    );
    setDragging(true);
    setDragX(next);
    const nowRevealed = next <= -SWIPE_REVEAL / 2;
    if (nowRevealed !== revealed.current) {
      revealed.current = nowRevealed;
      void hapticTap("light");
    }
  };
  const endDrag = () => {
    if (startX.current === null) return;
    setDragX(revealed.current ? -SWIPE_REVEAL : 0);
    startX.current = null;
    pointerId.current = null;
    setDragging(false);
  };

  return (
    <div className="nh-row-wrap">
      <IconButton
        type="button"
        className="nh-row__swipe-del"
        onClick={() => {
          setDragX(0);
          onDelete();
        }}
        label={`حذف: ${rec.title}`}
        tabIndex={dragX <= -SWIPE_REVEAL / 2 ? 0 : -1}
      >
        <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <div
        className={`nh-row${rec.isRead ? " nh-row--read" : ""}`}
        style={
          dragX !== 0 || dragging
            ? { transform: `translateX(${dragX}px)`, transition: dragging ? "none" : undefined }
            : undefined
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (dragX === 0) onRead();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onRead();
          }
        }}
      >
        <div className="nh-row__icon" aria-hidden="true">
          <Bell size={16} strokeWidth={1.8} />
        </div>
        <div className="nh-row__body">
          <div className="nh-row__title">{rec.title}</div>
          {rec.body && <div className="nh-row__body-text">{rec.body}</div>}
          <div className="nh-row__meta">{timeStr}</div>
        </div>
        {!rec.isRead && <span className="nh-row__unread" aria-label="غير مقروء" />}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="nh-row__actions" onClick={(e) => e.stopPropagation()}>
          {!rec.isArchived && (
            <IconButton type="button" className="nh-action" onClick={onArchive} label="أرشفة">
              <Archive size={14} strokeWidth={2} aria-hidden="true" />
            </IconButton>
          )}
          <IconButton type="button" className="nh-action nh-action--del" onClick={onDelete} label="حذف">
            <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

/** حالة تنبيهات الصلاة من مصدرها الوحيد (تفضيلات الأذان + تنبيهات الصلاة) — قراءة فقط. */
function readPrayerAlertsOn(): boolean {
  try {
    return Boolean(loadAdhanPrefs().globalEnabled || loadPrayerAlertPrefs().alertsEnabled);
  } catch {
    return false;
  }
}

function PermissionBanner({
  permission,
  onRequest,
  requesting,
}: {
  permission: PermissionStatus;
  onRequest: () => void;
  requesting: boolean;
}) {
  if (permission === "granted") return null;
  if (permission === "unsupported") {
    return (
      <div className="notif-banner notif-banner--warn" role="status">
        {isNative
          ? "هذا الجهاز لا يدعم الإشعارات المحلية."
          : "متصفحك لا يدعم الإشعارات. جرّب تثبيت التطبيق أو متصفحًا آخر."}
      </div>
    );
  }
  if (permission === "denied") {
    return (
      <div className="notif-banner notif-banner--err" role="alert">
        <p className="notif-banner__text">
          {isNative
            ? "الإشعارات محجوبة من إعدادات النظام: الإعدادات ← سُنّة ← الإشعارات."
            : "الإشعارات محجوبة من إعدادات المتصفح لهذا الموقع. فعّلها يدويًا ثم عُد إلى هذه الصفحة."}
        </p>
        {isNative ? (
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="notif-banner__action"
            onClick={() => void openSystemNotificationSettings()}
          >
            فتح إعدادات النظام
          </Button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="notif-banner notif-banner--warn" role="status">
      <p className="notif-banner__text">لم يُمنح إذن الإشعارات بعد — لن يصلك أي تذكير قبل السماح.</p>
      <Button
        type="button"
        variant="primary"
        size="small"
        className="notif-banner__action"
        onClick={onRequest}
        disabled={requesting}
        loading={requesting}
      >
        السماح بالإشعارات
      </Button>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(loadNotifPrefs);
  const [prayerOn, setPrayerOn] = useState(readPrayerAlertsOn);
  const pushSupport = useMemo(() => (isNative ? "unsupported" : getPushSupport()), []);

  useEffect(() => {
    applyPageSeo({
      path: "/notification-settings",
      title: "الإشعارات | سُنّة",
      description: "إدارة إشعارات سُنّة: الصلاة والقرآن والأذكار وطلب العلم والمناسبات.",
      keywords: ["إشعارات", "إعدادات أذان", "تذكيرات"],
      robots: "noindex, follow",
    });
  }, []);

  const [permission, setPermission] = useState<PermissionStatus>("prompt");
  const [requesting, setRequesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const showDevTools = isDevToolsVisible();
  const firstRender = useRef(true);

  /* إعادة فحص الإذن عند العودة من إعدادات النظام/المتصفح */
  useEffect(() => {
    const refresh = () => {
      void getNotificationPermissionStatus().then(setPermission);
      setPrayerOn(readPrayerAlertsOn());
    };
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const [history, setHistory] = useState<NotifRecord[]>(() => loadHistory());
  const [histTab, setHistTab] = useState<HistoryTab>("inbox");
  const [searchQ, setSearchQ] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const refreshHistory = () =>
    setHistory(searchQ ? searchHistory(searchQ, histTab === "archived") : loadHistory());

  useEffect(() => {
    // لا حفظ ولا إعادة جدولة عند أول عرض — فقط بعد تغيير فعلي من المستخدم.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveNotifPrefs(prefs);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    void import("@/lib/smart-local-notifications").then(({ syncSmartLocalNotifications }) => {
      void syncSmartLocalNotifications();
    });
    return () => clearTimeout(t);
  }, [prefs]);

  useEffect(() => {
    refreshHistory();
  }, [searchQ, histTab]);

  /** يطلب الإذن من فعل صريح؛ يعيد true إن صار ممنوحًا. */
  const ensurePermission = async (): Promise<boolean> => {
    if (permission === "granted") return true;
    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      const status = await getNotificationPermissionStatus();
      setPermission(status);
      if (granted) {
        void import("@/lib/notifications/apns-scaffold").then(({ maybeRegisterRemotePush }) => {
          void maybeRegisterRemotePush({ requestPermission: true });
        });
      }
      return granted || status === "granted";
    } finally {
      setRequesting(false);
    }
  };

  const handleEnable = async () => {
    if (await ensurePermission()) setPrefs((p) => ({ ...p, enabled: true }));
  };

  const handleTestTrigger = async () => {
    setTestStatus("يُرسل…");
    const result = await fireTestLocalNotification();
    if (result.ok) {
      setTestStatus(result.platform === "native" ? "سيظهر خلال ثانية ونصف" : "تم الإرسال");
    } else if (result.reason === "permission") {
      setTestStatus("الإذن غير ممنوح");
    } else {
      setTestStatus(STATUS.loadError);
    }
    window.setTimeout(() => setTestStatus(null), 4000);
  };

  const update = (patch: Partial<NotifPrefs>) => setPrefs((p) => ({ ...p, ...patch }));

  /** تفعيل فئة يطلب الإذن عند الحاجة ويشغّل المفتاح العام — فلا تُفعَّل فئة بلا أثر. */
  const toggleSection = async (id: NotifSectionId, on: boolean) => {
    if (on && !(await ensurePermission())) return;
    const next = updateNotifSection(id, { enabled: on });
    setPrefs(on ? { ...next, enabled: true } : next);
  };

  const toggleDhikrPhrase = async (on: boolean) => {
    if (on && !(await ensurePermission())) return;
    update(on ? { dhikrPhraseReminder: true, enabled: true } : { dhikrPhraseReminder: false });
  };

  const isGranted = permission === "granted";
  const isUnsupported = permission === "unsupported";
  const isDenied = permission === "denied";
  const masterOn = prefs.enabled && isGranted;
  const categoriesDisabled = isUnsupported || isDenied || requesting;

  const visibleHistory = history.filter((r) =>
    histTab === "archived" ? r.isArchived : !r.isArchived,
  );
  const unread = history.filter((r) => !r.isRead && !r.isArchived).length;
  const dayGroups = useMemo(() => groupByDay(visibleHistory), [visibleHistory]);

  const handleOpen = (rec: NotifRecord) => {
    markRead(rec.id);
    refreshHistory();
    if (rec.url) navigateTo(rec.url);
  };
  const handleArchive = (id: string) => {
    archiveRecord(id);
    refreshHistory();
  };
  const handleDelete = (id: string) => {
    void hapticTap("medium");
    deleteRecord(id);
    refreshHistory();
  };
  const handleMarkAll = () => {
    void hapticTap("light");
    markAllRead();
    refreshHistory();
  };
  const handleClearAll = () => {
    clearAll();
    setHistory([]);
    setConfirmClear(false);
  };

  return (
    <UtilityScreen compose="mark">
      <div className="page-shell narrow" dir="rtl">
        <PageHeader
          eyebrow="الإعدادات"
          title="الإشعارات"
          subtitle="مكان واحد لكل التذكيرات: الصلاة والقرآن والأذكار وطلب العلم والمناسبات."
        />

        <PermissionBanner
          permission={permission}
          onRequest={() => void handleEnable()}
          requesting={requesting}
        />

        <div className="notif-card">
          <SettingsList
            title="الصلاة والأذان"
            rows={[
              {
                id: "prayer",
                title: "تنبيهات الصلاة والأذان",
                description: "بمواقيت موقعك الحقيقية — الأذان والتنبيه قبله وبعده والإقامة",
                icon: <MoonStar size={18} strokeWidth={1.8} aria-hidden />,
                value: (
                  <span className="nsp-row-status">
                    <span className={`nsp-dot${prayerOn ? " is-on" : ""}`} aria-hidden />
                    {prayerOn ? "مفعّلة" : "متوقفة"}
                  </span>
                ),
                href: "/adhan-settings",
                testId: "notif-prayer-link",
              },
            ]}
          />
        </div>

        <div className="notif-card">
          <SettingsToggleRow
            id="notif-enabled"
            title="تذكيرات المحتوى"
            description={
              isUnsupported
                ? "غير مدعوم على هذا الجهاز"
                : isDenied
                  ? "محجوبة من إعدادات النظام"
                  : masterOn
                    ? "مفعّلة — اختر الفئات أدناه"
                    : "متوقفة — لا يصلك أي تذكير محتوى"
            }
            checked={masterOn}
            onChange={(v) => {
              if (v) void handleEnable();
              else update({ enabled: false });
            }}
            disabled={categoriesDisabled}
          />
        </div>

        <div className="notif-card">
          <h2 className="notif-card__title">فئات التذكير</h2>
          {NOTIF_SECTIONS.map((section) => (
            <div key={section.id} className="nsp-category" data-testid={`notif-section-${section.id}`}>
              <SettingsToggleRow
                id={`sec-${section.id}-enabled`}
                title={section.title}
                description={section.description}
                checked={masterOn && prefs.sections[section.id].enabled}
                onChange={(v) => void toggleSection(section.id, v)}
                disabled={categoriesDisabled}
              />
              {section.id === "adhkar" ? (
                <SettingsToggleRow
                  id="notif-dhikr-phrase"
                  title="تذكير الذكر"
                  description="سبحان الله، الحمد لله، الصلاة على النبي ﷺ، أستغفر الله… كل ساعتين من ٨ ص إلى ٨ م"
                  checked={masterOn && prefs.dhikrPhraseReminder}
                  onChange={(v) => void toggleDhikrPhrase(v)}
                  disabled={categoriesDisabled}
                />
              ) : null}
            </div>
          ))}
        </div>

        <SunnahChannelsPanel
          onStopAll={() => setPrefs(loadNotifPrefs())}
        />

        {!isNative && pushSupport !== "unsupported" && pushSupport !== "no-vapid" && (
          <section className="notif-card" aria-label="إشعارات الدفع عبر الويب">
            <h2 className="notif-card__title">إشعارات الدروس عبر المتصفح</h2>
            <p className="notif-row__sub">
              تصلك من الخادم حتى والموقع مغلق، بعد السماح للمتصفح.
            </p>
            <PushPrompt />
          </section>
        )}

        {isGranted && (
          <div className="notif-card">
            <Button type="button" variant="outline" size="small" className="notif-test-btn" onClick={() => void handleTestTrigger()}>
              إرسال إشعار تجريبي
            </Button>
            {testStatus && (
              <p className="notif-row__sub" role="status">
                {testStatus}
              </p>
            )}
          </div>
        )}

        {showDevTools && (
          <div className="notif-card" aria-label="أدوات مطوّر الإشعارات">
            <h3 className="notif-card__title">تشخيص الإشعارات (مطوّر)</h3>
            <p className="notif-row__sub">
              منصة: {isNative ? "Capacitor أصلي" : "ويب"} · الإذن: {permission} · Push: {pushSupport}
            </p>
          </div>
        )}

        {saved && <div className="notif-saved" role="status">تم حفظ الإعدادات</div>}

        <div className="nh-section">
          <div className="nh-header">
            <h2 className="nh-header__title">
              سجل الإشعارات
              {unread > 0 && <span className="nh-header__badge">{toArabicDigits(unread)}</span>}
            </h2>
            <div className="nh-header__actions">
              {unread > 0 && (
                <Button type="button" variant="ghost" size="small" className="nh-btn nh-btn--mark-all" onClick={handleMarkAll}>
                  <CheckCheck size={14} strokeWidth={2} aria-hidden="true" />
                  تعليم الكل مقروءًا
                </Button>
              )}
              {!confirmClear ? (
                <Button type="button" variant="destructive" size="small" className="nh-btn nh-btn--danger" onClick={() => setConfirmClear(true)}>
                  حذف الكل
                </Button>
              ) : (
                <span className="nsp-confirm-row">
                  <span className="nsp-confirm-label">تأكيد؟</span>
                  <Button type="button" variant="destructive" size="small" className="nh-btn nh-btn--danger" onClick={handleClearAll}>
                    نعم
                  </Button>
                  <Button type="button" variant="ghost" size="small" className="nh-btn" onClick={() => setConfirmClear(false)}>
                    إلغاء
                  </Button>
                </span>
              )}
            </div>
          </div>

          <div className="nh-search-wrap">
            <input
              ref={searchRef}
              className="nh-search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="ابحث في الإشعارات…"
              aria-label="بحث في الإشعارات"
            />
            {searchQ && (
              <IconButton
                type="button"
                label="مسح البحث"
                className="nh-search-clear"
                onClick={() => setSearchQ("")}
              >
                ✕
              </IconButton>
            )}
          </div>

          <div className="nh-tabs" role="tablist" aria-label="تبويبات الإشعارات">
            <Button
              role="tab"
              type="button"
              variant="ghost"
              size="small"
              className={`nh-tab${histTab === "inbox" ? " nh-tab--active" : ""}`}
              onClick={() => setHistTab("inbox")}
              aria-selected={histTab === "inbox"}
            >
              الصندوق {unread > 0 && `(${toArabicDigits(unread)})`}
            </Button>
            <Button
              role="tab"
              type="button"
              variant="ghost"
              size="small"
              className={`nh-tab${histTab === "archived" ? " nh-tab--active" : ""}`}
              onClick={() => setHistTab("archived")}
              aria-selected={histTab === "archived"}
            >
              المؤرشف
            </Button>
          </div>

          <div className="nh-list">
            {visibleHistory.length === 0 ? (
              <div className="nh-empty">
                <div className="nh-empty__ring" aria-hidden="true">
                  <Bell size={26} strokeWidth={1.5} />
                </div>
                <p className="nh-empty__msg">
                  {searchQ
                    ? EMPTY.searchShort
                    : histTab === "archived"
                      ? EMPTY.data
                      : EMPTY.data}
                </p>
              </div>
            ) : (
              dayGroups.map((group) => (
                <div key={group.label} className="nh-day-group">
                  <div className="nh-day-group__label">{group.label}</div>
                  {group.items.map((rec) => (
                    <NotifRow
                      key={rec.id}
                      rec={rec}
                      onRead={() => handleOpen(rec)}
                      onArchive={() => handleArchive(rec.id)}
                      onDelete={() => handleDelete(rec.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <nav className="profile-quick-links nsp-quick-links" aria-label="روابط">
          <Link href="/adhan-settings" className="profile-quick-link">
            إعدادات الأذان
          </Link>
          <Link href="/settings" className="profile-quick-link">
            الإعدادات
          </Link>
        </nav>
      </div>
    </UtilityScreen>
  );
}
