import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlayerState } from "@/core/audio/AudioEngine";
import {
  ensureMushafAudioSession,
  getMushafAudioSessionOrNull,
  isMushafAudioSessionReady,
} from "./mushaf-audio-session";
import { MUSHAF_BOOT_STAGES } from "./mushaf-staged-boot";
import { getSurahMeta, savePagePosition } from "@/lib/quran-api";
import {
  getReciter,
  listAyahAudioUrls,
  loadReciterId,
  saveReciterId,
} from "@/lib/quran-audio";
import {
  getCachedMushafPage,
  loadMushafPage,
  prefetchMushafPage,
  type MushafPageLayout,
  type QpcWord,
} from "@/lib/quran-data/qpc-page-data";
import { haptics } from "@/lib/haptics";
import {
  beginPowerSaverSession,
  endPowerSaverSession,
  getPowerSaverState,
  scheduleNonCriticalWork,
} from "@/lib/power-saver-engine";
import { clampMushafPage, MUSHAF_PAGE_MAX } from "@/lib/quran-last-page";
import {
  isMushafReaderV2Enabled,
  migrateMushafUserData,
  MushafReaderController,
  MushafPageRepository,
  QuranSettingsRepository,
} from "@/lib/mushaf-v2";
import { useMediaSession } from "@/hooks/useMediaSession";
import { STATUS } from "@/lib/ui-copy";
import { MushafPager } from "./MushafPager";
import {
  setMushafAudioClock,
  useMushafAudioClock,
} from "@/features/mushaf-shared/mushaf-audio-clock-store";
import {
  setMushafAyahSearchHighlight,
  setMushafAyahSyncKeys,
  setNavigationHighlightedAyahId,
  useMushafAyahNavigationKey,
} from "@/features/mushaf-shared/mushaf-ayah-sync-store";
import {
  clearPendingNavigationHighlight,
  peekPendingNavigationHighlight,
} from "@/lib/quran-navigation";
import { toArabicDigits } from "@/lib/utils";
import {
  findMushafPageForAyah,
  parseVerseKey,
  resolveRecitationLoop,
  uniqueVerseKeysFromRows,
  type RecitationRange,
} from "@/features/mushaf-shared/mushaf-page-for-ayah";
import {
  ensureQpcPageFont,
  isQpcPageFontReady,
  useQpcPageFont,
} from "@/features/mushaf-shared/useQpcPageFont";
import { useMushafResourceGate } from "@/features/mushaf-shared/useMushafResourceGate";
import { MUSHAF_CHROME_HIDE_MS } from "@/features/mushaf-shared/layout-bands";
import { MushafPage } from "./MushafPage";
import { MushafControlsLayer, MushafVerseMenu } from "./MushafControlsLayer";
import { MushafPageArrows } from "./MushafPageArrows";
import { MushafPageScrubber } from "./MushafPageScrubber";
import { isMushafNavCapabilityEnabled } from "./mushaf-reader-nav-contract";
import {
  loadPageArrowsEnabled,
  savePageArrowsEnabled,
  saveFocusReadingModePreference,
} from "./mushaf-page-arrows-prefs";
import { useStableMushafLayout } from "./useStableMushafLayout";
import {
  getCachedPageRenderModel,
  putPageRenderModel,
  setMushafGeometryKey,
  getMushafGeometryKey,
} from "./mushaf-page-render-cache";
import {
  enableMushafTurnTelemetry,
  mushafTurnInc,
  mushafTurnMark,
  mushafTurnFlush,
  mushafTurnResetSession,
  mushafPerfInc,
  mushafPerfSnapshot,
} from "./mushaf-turn-telemetry";
import {
  resolvePageTurnPhase,
  type MushafPageTurnPhase,
} from "./mushaf-page-turn-phase";
import { mushafExperienceMark } from "./mushaf-experience-perf";
import {
  clearAyahSelection,
  selectAyah,
} from "./mushaf-selection-controller";
import {
  bumpTafsirGeneration,
  createTafsirOpenIntent,
  isValidTafsirOpenIntent,
  type TafsirOpenIntent,
} from "./tafsir-open-intent";
import { migrateLegacyMushafReaderPrefs } from "./sunnah-mushaf-classic-preset";
import { migrateToSunnahMushafSignature } from "./sunnah-mushaf-signature-preset";
import "./mushaf-reader.css";
import "@/styles/ayah-nav-selection.css";
/*
 * CSS archived reader — مطلوب حاليًا لفئات mm-* في القشرة الحية.
 * BLOCKED: إزالة كاملة حتى استخراج shell CSS إلى mushaf-shared (انظر PHASE_1 docs).
 * الشيتات (تفسير/بحث) تبقى lazy من mushaf-madinah فقط.
 */
import "@/features/mushaf-madinah/mushaf-madinah.css";
/* صقل Chrome الخروج/الأسهم — بعد mushaf-reader حتى يفوز بدون لمس Geometry */
import "@/styles/reader-page-chrome.css";

const MushafBookmarkComposer = lazy(() =>
  import("@/features/mushaf-bookmarks").then((m) => ({
    default: m.MushafBookmarkComposer,
  })),
);
const MushafBookmarkMarkers = lazy(() =>
  import("@/features/mushaf-bookmarks").then((m) => ({
    default: m.MushafBookmarkMarkers,
  })),
);
const MushafPageBookmarkSheet = lazy(() =>
  import("@/features/mushaf-bookmarks").then((m) => ({
    default: m.MushafPageBookmarkSheet,
  })),
);

const MushafTafsirSheet = lazy(() =>
  import("@/features/mushaf-madinah/MushafTafsirSheet").then((m) => ({
    default: m.MushafTafsirSheet,
  })),
);
const MushafSearchSheet = lazy(() =>
  import("@/features/mushaf-madinah/MushafSearchSheet").then((m) => ({
    default: m.MushafSearchSheet,
  })),
);
const QuranAudioPlayer = lazy(() =>
  import("@/components/quran/QuranAudioPlayer").then((m) => ({
    default: m.QuranAudioPlayer,
  })),
);

void MUSHAF_BOOT_STAGES; /* عقد المراحل — يُقفَل عبر بوابة staged-loading */

type Props = {
  pageNumber: number;
  onPageChange: (page: number) => void;
  onExit: () => void;
  onIndex: () => void;
};

/**
 * NewMushafReader — واجهة مصحف جديدة من الصفر.
 * البيانات/التلاوة/التفسير من المصادر المعتمدة؛ العرض بصري جديد بالكامل.
 */
export function NewMushafReader({ pageNumber, onPageChange, onExit, onIndex: _onIndex }: Props) {
  const page = clampMushafPage(pageNumber);
  useEffect(() => {
    enableMushafTurnTelemetry(true);
  }, []);

  useEffect(() => {
    mushafPerfInc("readerMount");
    mushafExperienceMark("mushaf:reader-mounted");
  }, []);
  useEffect(() => {
    migrateLegacyMushafReaderPrefs();
    migrateToSunnahMushafSignature();
  }, []);
  const v2Enabled = isMushafReaderV2Enabled();
  const readerControllerRef = useRef<MushafReaderController | null>(null);
  if (v2Enabled && readerControllerRef.current == null) {
    readerControllerRef.current = new MushafReaderController(page);
  }
  const [layout, setLayout] = useState<MushafPageLayout | null>(() => getCachedMushafPage(page));
  const [error, setError] = useState<string | null>(null);
  /** حالة مركزية وحيدة لـ Reader Chrome — لا تُكرَّر لكل صفحة */
  const [readerChromeVisible, setReaderChromeVisible] = useState(false);
  const chromeOpen = readerChromeVisible;
  const setChromeOpen = setReaderChromeVisible;
  /** وضع قراءة كامل — لا يُفرض عند أول فتح؛ يُحفظ بعد اختيار صريح فقط */
  const [focusReadingMode, setFocusReadingMode] = useState(false);
  const [pageArrowsEnabled, setPageArrowsEnabled] = useState(() => loadPageArrowsEnabled());
  /** مظهر المصحف المحلول — مربوط بـ React على .nm-root (لا يعتمد فقط على setAttribute أمرّي) */
  const [mushafAppearanceResolved, setMushafAppearanceResolved] = useState(() =>
    QuranSettingsRepository.resolveAppearance(),
  );
  const [controlsMoreOpen, setControlsMoreOpen] = useState(false);
  const focusReadingModeRef = useRef(false);
  focusReadingModeRef.current = focusReadingMode;
  const [gotoOpen, setGotoOpen] = useState(false);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [bookmarkComposerOpen, setBookmarkComposerOpen] = useState(false);
  const [pageBookmarkSheetOpen, setPageBookmarkSheetOpen] = useState(false);
  const [bookmarkEpoch, setBookmarkEpoch] = useState(0);
  const [tafsirOpen, setTafsirOpen] = useState(false);
  /** آية التفسير معزولة عن التحديد وعن آية الصوت */
  const [tafsirVerseKey, setTafsirVerseKey] = useState<string | null>(null);
  const tafsirIntentRef = useRef<TafsirOpenIntent | null>(null);
  const tafsirOpenRef = useRef(false);
  /** حالة Chrome قبل فتح التفسير — تُستعاد عند الإغلاق دون فرض عشوائي */
  const chromeBeforeTafsirRef = useRef(false);
  useEffect(() => {
    tafsirOpenRef.current = tafsirOpen;
  }, [tafsirOpen]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [reciterId, setReciterId] = useState(() => loadReciterId());
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [audioDockOpen, setAudioDockOpen] = useState(false);
  const [audioDockMini, setAudioDockMini] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<string | null>(null);
  const [iosAudioHint, setIosAudioHint] = useState<string | null>(null);

  const { fontFamily, ready: fontReady } = useQpcPageFont(page);
  /** لا نعرض صفحة برقم مختلف عن الهدف — يمنع خلط خط جديد مع بيانات قديمة */
  const layoutMatchesPage = Boolean(layout && layout.pageNumber === page);
  const { canMountPage, allowOffscreenPrefetch: _allowOffscreenPrefetch } = useMushafResourceGate(
    fontReady,
    layoutMatchesPage && !error,
    page,
  );

  /**
   * آخر صفحة جاهزة تبقى معروضة حتى تكتمل التالية — يمنع placeholder→QPC
   * (سبب الإحساس بتكبير/تصغير النص عند القلب).
   */
  const [stableView, setStableView] = useState<{
    layout: MushafPageLayout;
    fontFamily: string;
    page: number;
  } | null>(() => {
    const cached = getCachedMushafPage(page);
    return cached ? { layout: cached, fontFamily: `"qpc-v2-p${page}"`, page } : null;
  });

  useLayoutEffect(() => {
    if (error || !canMountPage || !layout || layout.pageNumber !== page || !fontReady) return;
    setStableView((prev) => {
      if (
        prev &&
        prev.page === page &&
        prev.layout === layout &&
        prev.fontFamily === fontFamily
      ) {
        return prev;
      }
      const hadModel = Boolean(getCachedPageRenderModel(page));
      putPageRenderModel(page, layout, fontFamily);
      mushafTurnInc(hadModel ? "cacheHit" : "cacheMiss");
      mushafTurnMark("layoutComplete", page);
      return { layout, fontFamily, page };
    });
  }, [error, canMountPage, layout, page, fontReady, fontFamily]);

  const metricsRootRef = useRef<HTMLDivElement | null>(null);
  /** مصدر القياس الوحيد — لا يُعاد حساب الخط أثناء قلب الصفحة */
  useStableMushafLayout(metricsRootRef, true);
  useLayoutEffect(() => {
    const root = metricsRootRef.current;
    if (!root) return;
    /* لا يُربط برقم الصفحة — تغيير الصفحة لا يُعيد مفتاح الهندسة ولا يُفرّغ كاش الرسم */
    if (root.getAttribute("data-pager-settled") === "0") return;
    const w = root.style.getPropertyValue("--mushaf-page-width").trim();
    const h = root.style.getPropertyValue("--mushaf-page-height").trim();
    const fs = root.style.getPropertyValue("--mushaf-font-size").trim();
    if (w && h && fs) setMushafGeometryKey(`${w}x${h}@${fs}`);
  }, [fontReady]);

  const hideTimer = useRef<number | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;
  const suppressPageSyncRef = useRef(false);
  const pendingSelectRef = useRef<string | null>(null);
  /** Intent تنقّل طُبّق كشفًا — إن غادر المستخدم صفحته يُلغى */
  const revealedNavIntentRef = useRef<string | null>(null);
  const actionsOpenRef = useRef(false);
  actionsOpenRef.current = actionsOpen;
  const [audioArmed, setAudioArmed] = useState(false);
  const audioSessionRef = useRef<Awaited<ReturnType<typeof ensureMushafAudioSession>> | null>(null);

  const armAudioSession = useCallback(async () => {
    const s = await ensureMushafAudioSession();
    audioSessionRef.current = s;
    setAudioArmed(true);
    return s;
  }, []);

  useEffect(() => {
    beginPowerSaverSession();
    if (isMushafReaderV2Enabled()) migrateMushafUserData();

    const syncAppearance = () => {
      const appearance = QuranSettingsRepository.getAppearanceMode();
      QuranSettingsRepository.applyAppearance(appearance);
      setMushafAppearanceResolved(QuranSettingsRepository.resolveAppearance(appearance));
      return appearance;
    };

    let appearance = syncAppearance();
    let mq: MediaQueryList | null = null;
    const onScheme = () => {
      if (QuranSettingsRepository.getAppearanceMode() === "SYSTEM") {
        QuranSettingsRepository.applyAppearance("SYSTEM");
        setMushafAppearanceResolved(QuranSettingsRepository.resolveAppearance("SYSTEM"));
      }
    };
    const bindSystem = () => {
      mq?.removeEventListener?.("change", onScheme);
      mq =
        QuranSettingsRepository.getAppearanceMode() === "SYSTEM" && typeof window !== "undefined"
          ? window.matchMedia("(prefers-color-scheme: dark)")
          : null;
      mq?.addEventListener?.("change", onScheme);
    };
    bindSystem();

    const onPrefChange = () => {
      appearance = syncAppearance();
      bindSystem();
      void appearance;
    };
    window.addEventListener("ssunnah:mushaf-appearance-change", onPrefChange);

    return () => {
      mq?.removeEventListener?.("change", onScheme);
      window.removeEventListener("ssunnah:mushaf-appearance-change", onPrefChange);
      endPowerSaverSession();
      readerControllerRef.current?.dispose();
      readerControllerRef.current = null;
      getMushafAudioSessionOrNull()?.recitation.stop();
      const resolved =
        document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      void import("@/lib/apply-page-chrome").then(({ reapplyPageChromeFromLocation }) =>
        reapplyPageChromeFromLocation(resolved),
      );
    };
  }, []);

  useLayoutEffect(() => {
    /* قبل أول paint: طبّق كاش الصفحة الجديدة حتى لا يُرسم خط الصفحة الجديدة على بيانات قديمة */
    const cached = getCachedMushafPage(page);
    if (cached) setLayout(cached);
  }, [page]);

  /**
   * عرض الصفحة الحالية من الكاش+الخط الجاهز في نفس إطار الرسم —
   * حتى عند reset المسار بعد القلب لا تظهر الصفحة القديمة.
   */
  const displayView = useMemo(() => {
    if (error) return null;
    const cached = getCachedMushafPage(page);
    if (cached && (fontReady || isQpcPageFontReady(page))) {
      return {
        layout: cached,
        fontFamily: fontFamily || `"qpc-v2-p${page}"`,
        page,
      };
    }
    if (stableView) return stableView;
    return null;
  }, [error, page, fontReady, fontFamily, stableView, layout]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    /* لا نفرّغ layout عند غياب الكاش — إبقاء الصفحة السابقة يمنع قفزة النص للأعلى */
    const cached = getCachedMushafPage(page);
    if (cached) setLayout(cached);
    void loadMushafPage(page)
      .then((data) => {
        if (!cancelled) setLayout(data);
      })
      .catch(() => {
        if (!cancelled) setError(STATUS.loadError);
      });
    const saver = getPowerSaverState();
    if (saver.mode !== "aggressive") {
      if (saver.throttleBackground) {
        scheduleNonCriticalWork(() => {
          if (!cancelled) prefetchMushafPage(page + 1);
        });
      } else {
        prefetchMushafPage(page - 1);
        prefetchMushafPage(page + 1);
        prefetchMushafPage(page - 2);
        prefetchMushafPage(page + 2);
        scheduleNonCriticalWork(() => {
          if (cancelled || !isMushafAudioSessionReady()) return;
          void import("@/features/mushaf-shared/prefetch-adjacent-audio").then((m) =>
            m.prefetchAdjacentPageAudio(page, loadReciterId()),
          );
        });
      }
    }
    if (v2Enabled && readerControllerRef.current) {
      readerControllerRef.current.syncExternalPage(page);
      MushafPageRepository.prefetchAdjacent(page);
    } else {
      savePagePosition(page);
    }
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const pending = pendingSelectRef.current;
    pendingSelectRef.current = null;
    let clearTimer: number | undefined;
    if (pending) {
      /* تمييز بحث — بلا قائمة آية / بلا تفسير / بلا صوت */
      setMushafAyahSearchHighlight(pending);
      clearAyahSelection();
      setSelectedVerseKey(null);
      setActionsOpen(false);
      setTafsirOpen(false);
      setStatus(null);
      setChromeOpen(false);
      clearTimer = window.setTimeout(() => setMushafAyahSearchHighlight(null), 4000);
    } else {
      /* المسح يتم في onNavigateStart/go قبل القلب — لا نغيّر الحجز هنا لتجنّب قفزة الارتفاع */
      suppressPageSyncRef.current = false;
    }
    return () => {
      if (clearTimer != null) window.clearTimeout(clearTimer);
    };
  }, [page]);

  const chromeHoldRef = useRef(false);
  const bumpChrome = useCallback(() => {
    setChromeOpen(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);


  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    chromeHoldRef.current = Boolean(
      searchOpen ||
        indexOpen ||
        tafsirOpen ||
        gotoOpen ||
        controlsMoreOpen ||
        actionsOpen ||
        bookmarkComposerOpen ||
        pageBookmarkSheetOpen ||
        (audioDockOpen && !audioDockMini),
    );
    if (chromeHoldRef.current) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      return;
    }
    if (!chromeOpen) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setChromeOpen(false), MUSHAF_CHROME_HIDE_MS);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [
    actionsOpen,
    bookmarkComposerOpen,
    pageBookmarkSheetOpen,
    audioDockMini,
    audioDockOpen,
    chromeOpen,
    controlsMoreOpen,
    gotoOpen,
    indexOpen,
    searchOpen,
    tafsirOpen,
  ]);


  useEffect(() => {
    setMushafAyahSyncKeys(selectedVerseKey, playingVerseKey);
  }, [selectedVerseKey, playingVerseKey]);

  /** تمييز تنقّل سياقي — بلا تفسير/أدوات/صوت؛ يبقى حتى إلغاء يدوي أو مغادرة صفحة الهدف */
  useEffect(() => {
    const applyPendingNav = () => {
      const pending = peekPendingNavigationHighlight();
      if (!pending) {
        if (revealedNavIntentRef.current) {
          setNavigationHighlightedAyahId(null);
          revealedNavIntentRef.current = null;
        }
        return;
      }
      if (pending.pageNumber !== pageRef.current) {
        const intentId = pending.navigationIntentId ?? `compat-${pending.verseKey}`;
        /* لا تمسح الـintent أثناء الانتقال نحو الهدف — فقط بعد كشف ناجح ثم مغادرة */
        if (revealedNavIntentRef.current === intentId) {
          clearPendingNavigationHighlight();
          setNavigationHighlightedAyahId(null);
          revealedNavIntentRef.current = null;
        } else {
          setNavigationHighlightedAyahId(null);
        }
        return;
      }
      setTafsirOpen(false);
      setTafsirVerseKey(null);
      tafsirIntentRef.current = null;
      setActionsOpen(false);
      setChromeOpen(false);
      setAudioDockOpen(false);
      setNavigationHighlightedAyahId(pending.verseKey);
      revealedNavIntentRef.current = pending.navigationIntentId ?? `compat-${pending.verseKey}`;
    };

    applyPendingNav();
    const onNavEvent = () => applyPendingNav();
    window.addEventListener("ssunnah:quran-nav-pending", onNavEvent);
    return () => {
      window.removeEventListener("ssunnah:quran-nav-pending", onNavEvent);
    };
  }, [page]);

  useEffect(() => {
    return () => setNavigationHighlightedAyahId(null);
  }, []);

  useEffect(() => {
    if (!audioArmed) return;
    let cancelled = false;
    let unSnap: (() => void) | undefined;
    let unAyah: (() => void) | undefined;
    void armAudioSession().then((session) => {
      if (cancelled) return;
      const { audio, recitation, QuranRecitationService } = session;
      audio.setReciter(loadReciterId());
      const syncPageIfAllowed = (surah: number, ayah: number) => {
        if (suppressPageSyncRef.current) return;
        if (actionsOpenRef.current) return;
        const targetPage = findMushafPageForAyah(surah, ayah);
        if (targetPage !== pageRef.current) onPageChangeRef.current(targetPage);
      };
      unSnap = audio.onSnapshot((snap) => {
        setPlayerState((prev) => (prev === snap.playerState ? prev : snap.playerState));
        setReciterId((prev) => (prev === snap.reciterId ? prev : snap.reciterId));
        setMushafAudioClock({
          currentTime: snap.currentTime,
          duration: snap.duration,
          playbackRate: snap.playbackRate,
        });
        if (snap.playerState === "error") {
          setAudioError(
            QuranRecitationService.userErrorMessage(snap.errorMessage || "تعذر تشغيل التلاوة الآن"),
          );
          setAudioStatus("تعذر التشغيل");
          if (recitation.getPlaybackState().iosNeedsForeground) {
            setIosAudioHint(QuranRecitationService.IOS_FOREGROUND_HINT);
          }
        } else if (snap.playerState === "loading" || snap.playerState === "buffering") {
          setAudioError(null);
          setIosAudioHint(null);
          setAudioStatus("تجهيز الصوت");
        } else if (snap.playerState === "playing") {
          setAudioError(null);
          setIosAudioHint(null);
          setAudioStatus("يعمل الآن");
        } else if (snap.playerState === "paused") {
          setAudioStatus("متوقف");
        } else if (snap.playerState === "idle") {
          setPlayingVerseKey(null);
          setAudioStatus("جاهز");
        }
        if (snap.surah != null && snap.ayah != null) {
          const key = `${snap.surah}:${snap.ayah}`;
          setPlayingVerseKey(key);
        }
      });
      unAyah = audio.onAyahChange(({ surah, ayah }) => {
        const key = `${surah}:${ayah}`;
        setPlayingVerseKey(key);
        if (!suppressPageSyncRef.current) syncPageIfAllowed(surah, ayah);
      });
    });
    return () => {
      cancelled = true;
      unSnap?.();
      unAyah?.();
    };
  }, [audioArmed, armAudioSession]);

  const [pagerSettled, setPagerSettled] = useState(true);
  /** تجميد حجز الأسفل أثناء القلب حتى لا يتغيّر ارتفاع شبكة الآيات لحظةً */
  const [bottomStackFrozen, setBottomStackFrozen] = useState(false);
  const [freezeStackMode, setFreezeStackMode] = useState<"none" | "ayah" | "audio">("none");
  const pageTurnLockRef = useRef(false);
  const pageTurnSafetyTimerRef = useRef<number | null>(null);
  /** الصفحة المستهدفة بعد beginPageTurn — لا تُزلّ التجميد قبل وصولها */
  const pendingPageRef = useRef<number | null>(null);
  /** نية تقليب واحدة كحد أقصى أثناء انتظار font/layout بعد استقرار الصفحة */
  const queuedPageRef = useRef<number | null>(null);
  const goRef = useRef<(next: number) => void>(() => undefined);
  const [pageTurnPhase, setPageTurnPhase] = useState<MushafPageTurnPhase>("IDLE");
  const [pageTurnRecovering, setPageTurnRecovering] = useState(false);

  const clearPageChrome = useCallback(() => {
    bumpTafsirGeneration();
    tafsirIntentRef.current = null;
    tafsirOpenRef.current = false;
    setActionsOpen(false);
    clearAyahSelection();
    setSelectedVerseKey(null);
    setTafsirOpen(false);
    setTafsirVerseKey(null);
    setStatus(null);
    setControlsMoreOpen(false);
    setChromeOpen(false);
  }, []);

  const toggleFocusReadingMode = useCallback(() => {
    setFocusReadingMode((prev) => {
      const next = !prev;
      saveFocusReadingModePreference(next);
      if (next) {
        setControlsMoreOpen(false);
        setChromeOpen(false);
      } else {
        setChromeOpen(true);
        bumpChrome();
      }
      return next;
    });
  }, [bumpChrome]);

  const onPageArrowsEnabledChange = useCallback((enabled: boolean) => {
    setPageArrowsEnabled(enabled);
    savePageArrowsEnabled(enabled);
  }, []);

  const beginPageTurn = useCallback(() => {
    mushafTurnMark("transitionStart", pageRef.current);
    if (pageTurnLockRef.current) return;
    pageTurnLockRef.current = true;
    setPageTurnRecovering(false);
    setPageTurnPhase("COMMITTING");
    if (v2Enabled) readerControllerRef.current?.beginNavigation();
    /* جمّد ارتفاع شريط الآية إن كان مفتوحًا — يمنع قفزة الشبكة عند المسح أثناء القلب */
    const ayahWasOpen = actionsOpenRef.current;
    const dockWasVisible =
      !ayahWasOpen &&
      audioDockOpen &&
      (chromeOpen ||
        playerState === "playing" ||
        playerState === "buffering" ||
        playerState === "loading" ||
        playerState === "error");
    /* إن كان الرصيف مخفيًا خلف قائمة الآية، لا تكشفه بعد clearPageChrome */
    const dockRemainsAfterClear = dockWasVisible;
    if (!dockWasVisible && audioDockOpen) {
      setAudioDockOpen(false);
    }
    setFreezeStackMode(dockRemainsAfterClear ? "audio" : ayahWasOpen ? "ayah" : "none");
    setBottomStackFrozen(true);
    setPagerSettled(false);
    /*
     * أخّر مسح الـChrome إلى الإطار التالي حتى يُرسَم التزام الصفحة أولًا
     * (يقلّل عاصفة setState على نفس الإطار مع go).
     */
    window.requestAnimationFrame(() => {
      if (!pageTurnLockRef.current) return;
      clearPageChrome();
    });
    /* صمام أمان: إن تعذّر finishPageTurn لا يبقى المصحف مقفولًا إلى الأبد */
    if (pageTurnSafetyTimerRef.current != null) {
      window.clearTimeout(pageTurnSafetyTimerRef.current);
    }
    pageTurnSafetyTimerRef.current = window.setTimeout(() => {
      pageTurnSafetyTimerRef.current = null;
      if (!pageTurnLockRef.current) return;
      if (pendingPageRef.current != null && pendingPageRef.current !== pageRef.current) return;
      setPageTurnRecovering(true);
      setPageTurnPhase("RECOVERING");
      pageTurnLockRef.current = false;
      pendingPageRef.current = null;
      queuedPageRef.current = null;
      setPagerSettled(true);
      setBottomStackFrozen(false);
      setFreezeStackMode("none");
      setPageTurnPhase("READY");
      setPageTurnRecovering(false);
    }, 2800);
  }, [audioDockOpen, chromeOpen, clearPageChrome, playerState, v2Enabled]);

  const finishPageTurn = useCallback(() => {
    mushafTurnMark("activePageCommit", pageRef.current);
    mushafTurnMark("transitionSettled", pageRef.current);
    mushafTurnFlush();
    if (pageTurnSafetyTimerRef.current != null) {
      window.clearTimeout(pageTurnSafetyTimerRef.current);
      pageTurnSafetyTimerRef.current = null;
    }
    setPagerSettled(true);
    setBottomStackFrozen(false);
    setFreezeStackMode("none");
    pageTurnLockRef.current = false;
    pendingPageRef.current = null;
    setPageTurnPhase("READY");
    setPageTurnRecovering(false);
    if (v2Enabled) readerControllerRef.current?.endNavigation(pageRef.current);
    const queued = queuedPageRef.current;
    queuedPageRef.current = null;
    if (queued != null && queued !== pageRef.current) {
      window.requestAnimationFrame(() => {
        goRef.current(queued);
      });
    }
  }, [v2Enabled]);

  const go = useCallback(
    (next: number) => {
      const clamped = clampMushafPage(next);
      if (clamped === pageRef.current && pendingPageRef.current == null) return;
      /*
       * قفل القفزة المزدوجة فقط بعد تعيين هدف معلّق.
       * لا تُرجع مبكرًا عند pageTurnLock وحده: onNavigateStart يستدعي beginPageTurn
       * ثم onPageChange→go؛ إرجاع مبكر هنا كان يجمّد التقليب نهائيًا.
       * WAVE6: نية واحدة آمنة بعد وصول React للصفحة المستهدفة (انتظار font/layout).
       */
      if (pageTurnLockRef.current && pendingPageRef.current != null) {
        if (
          pageRef.current === pendingPageRef.current &&
          clamped !== pendingPageRef.current
        ) {
          queuedPageRef.current = clamped;
          return;
        }
        mushafTurnInc("rejectedGesture");
        return;
      }
      /* قلب يدوي: لا نوقف التلاوة — نمنع مزامنة الصفحة من الصوت حتى لا تُرجع المستخدم */
      suppressPageSyncRef.current = true;
      if (!pageTurnLockRef.current) beginPageTurn();
      pendingPageRef.current = clamped;
      const commitNav = () => onPageChange(clamped);
      /* إن كان الخط جاهزًا (prefetch) — حدّث الصفحة في نفس الإطار بلا انتظار */
      if (isQpcPageFontReady(clamped)) {
        mushafTurnMark("fontReady", clamped);
        commitNav();
        return;
      }
      setPageTurnPhase("WAITING_FOR_FONT");
      void ensureQpcPageFont(clamped).finally(() => {
        mushafTurnMark("fontReady", clamped);
        commitNav();
      });
    },
    [beginPageTurn, onPageChange],
  );
  goRef.current = go;

  /** ارتفاع الحاوية ثابت أثناء القلب — لا تُزلّ التجميد قبل جاهزية الخط+بيانات الصفحة */
  useLayoutEffect(() => {
    const pending = pendingPageRef.current;
    if (pending == null) return;
    if (page !== pending) {
      setPageTurnPhase("COMMITTING");
      return;
    }
    if (!fontReady) {
      setPageTurnPhase("WAITING_FOR_FONT");
      return;
    }
    if (!layoutMatchesPage || !displayView || displayView.page !== page) {
      setPageTurnPhase("WAITING_FOR_LAYOUT");
      return;
    }

    const shell = metricsRootRef.current?.querySelector<HTMLElement>(
      '[data-pane="current"] .nm-shell, [data-pane="current"] .mm-page-shell',
    );
    /* overflow مخفي — أعد الموضع فقط إن خرج عن الصفر (بلا قفزة بصرية) */
    if (shell && shell.scrollTop !== 0) shell.scrollTop = 0;

    finishPageTurn();
  }, [page, fontReady, layoutMatchesPage, displayView, finishPageTurn]);

  useEffect(() => {
    if (pageTurnLockRef.current) return;
    setPageTurnPhase(
      resolvePageTurnPhase({
        productLocked: false,
        pendingPage: null,
        currentPage: page,
        fontReady,
        layoutReady: layoutMatchesPage && Boolean(displayView),
        recovering: pageTurnRecovering,
      }),
    );
  }, [page, fontReady, layoutMatchesPage, displayView, pageTurnRecovering]);

  useEffect(() => {
    return () => {
      mushafTurnResetSession();
      if (pageTurnSafetyTimerRef.current != null) {
        window.clearTimeout(pageTurnSafetyTimerRef.current);
        pageTurnSafetyTimerRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (error && (bottomStackFrozen || !pagerSettled)) finishPageTurn();
  }, [error, bottomStackFrozen, pagerSettled, finishPageTurn]);

  const cancelPageTurnFreeze = useCallback(() => {
    if (pendingPageRef.current != null) return;
    finishPageTurn();
  }, [finishPageTurn]);

  const versePreview = useCallback(
    (verseKey: string): string => {
      if (!layout) return verseKey;
      const words: QpcWord[] = [];
      for (const row of layout.rows) {
        if (row.kind !== "line") continue;
        for (const w of row.words) {
          if (w.verseKey === verseKey && w.charType !== "end") words.push(w);
        }
      }
      words.sort((a, b) => a.position - b.position);
      return words.map((w) => w.textQpcHafs || w.textUthmani).join(" ").trim() || verseKey;
    },
    [layout],
  );

  const clearSelection = useCallback(() => {
    mushafExperienceMark("mushaf:selection-complete");
    clearAyahSelection();
    setSelectedVerseKey(null);
    setActionsOpen(false);
  }, []);

  const applyVerseSelection = useCallback((verseKey: string, openActions: boolean) => {
    const parsed = parseVerseKey(verseKey);
    if (!parsed) return;
    mushafExperienceMark("mushaf:selection-start");
    selectAyah({
      surahNumber: parsed.surah,
      ayahNumber: parsed.ayah,
      pageNumber: pageRef.current,
    });
    setSelectedVerseKey(verseKey);
    setActionsOpen(openActions);
    setChromeOpen(false);
    setStatus(null);
    setAudioError(null);
    if (typeof document !== "undefined") {
      const ae = document.activeElement;
      if (
        ae instanceof HTMLElement &&
        ae.closest?.('[data-testid="mushaf-ayah-hit"], .nm-word[role="button"]')
      ) {
        ae.blur();
      }
    }
    mushafExperienceMark("mushaf:selection-complete");
  }, []);

  const onSelectVerse = useCallback(
    (verseKey: string) => {
      if (selectedVerseKey === verseKey && actionsOpen) {
        setActionsOpen(false);
        return;
      }
      haptics.selection();
      applyVerseSelection(verseKey, true);
    },
    [actionsOpen, applyVerseSelection, selectedVerseKey],
  );

  const onLongPressVerse = useCallback(
    (verseKey: string) => {
      /* Long press = تحديد + قائمة فقط — ممنوع فتح التفسير بدون Intent صريح */
      if (typeof document !== "undefined" && document.querySelector('[data-mushaf-panning="1"]')) {
        return;
      }
      haptics.selection();
      applyVerseSelection(verseKey, true);
    },
    [applyVerseSelection],
  );

  const openTafsir = useCallback(() => {
    if (!selectedVerseKey) return;
    const intent = createTafsirOpenIntent({
      source: "userTappedTafsirAction",
      verseKey: selectedVerseKey,
      pageNumber: pageRef.current,
    });
    if (!isValidTafsirOpenIntent(intent)) return;
    chromeBeforeTafsirRef.current = chromeOpen;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    tafsirIntentRef.current = intent;
    tafsirOpenRef.current = true;
    setTafsirVerseKey(intent.verseKey);
    setActionsOpen(false);
    setTafsirOpen(true);
  }, [chromeOpen, selectedVerseKey]);

  const closeTafsir = useCallback(() => {
    bumpTafsirGeneration();
    tafsirIntentRef.current = null;
    tafsirOpenRef.current = false;
    setTafsirOpen(false);
    setTafsirVerseKey(null);
    setChromeOpen(chromeBeforeTafsirRef.current);
    /* إغلاق التفسير يمسح التحديد دائمًا — بلا حجب أثناء التلاوة */
    clearAyahSelection();
    setSelectedVerseKey(null);
    setActionsOpen(false);
  }, []);

  const closeActions = useCallback(() => setActionsOpen(false), []);

  const playSelected = useCallback(async () => {
    if (!selectedVerseKey) {
      setStatus("اختر آية أولاً");
      return;
    }
    const parsed = parseVerseKey(selectedVerseKey);
    if (!parsed) return;
    const ayahKey = `${parsed.surah}:${parsed.ayah}`;
    const { recitation, unlockAudioOnUserGesture } = await armAudioSession();
    unlockAudioOnUserGesture();
    setAudioError(null);
    setIosAudioHint(null);
    setActionsOpen(false);
    setAudioDockOpen(true);
    bumpChrome();
    suppressPageSyncRef.current = true;

    const same = playingVerseKey === ayahKey;
    if (
      same &&
      (playerState === "playing" || playerState === "paused" || playerState === "buffering")
    ) {
      await recitation.togglePlay(parsed.surah, parsed.ayah);
      return;
    }

    listAyahAudioUrls(parsed.surah, parsed.ayah, reciterId);
    setAudioStatus("تجهيز التلاوة…");
    setStatus("جاري التلاوة…");
    await recitation.playAyah(parsed.surah, parsed.ayah, reciterId);
  }, [armAudioSession, bumpChrome, playerState, playingVerseKey, reciterId, selectedVerseKey]);

  const togglePlay = useCallback(async () => {
    const key = selectedVerseKey ?? playingVerseKey;
    if (!key) return;
    const parsed = parseVerseKey(key);
    if (!parsed) return;
    const { recitation, unlockAudioOnUserGesture } = await armAudioSession();
    unlockAudioOnUserGesture();
    suppressPageSyncRef.current = true;
    await recitation.togglePlay(parsed.surah, parsed.ayah);
  }, [armAudioSession, playingVerseKey, selectedVerseKey]);

  const pageVerseKeys = useMemo(
    () => (layout ? uniqueVerseKeysFromRows(layout.rows) : []),
    [layout],
  );

  const playRange = useCallback(
    async (range: RecitationRange, repeatCount: number, delayMs = 0) => {
      const key = selectedVerseKey ?? playingVerseKey;
      if (!key) {
        setAudioError("اختر آية أولاً");
        return;
      }
      const parsed = parseVerseKey(key);
      if (!parsed) {
        setAudioError("اختر آية أولاً");
        return;
      }
      const loop = resolveRecitationLoop(
        range,
        parsed,
        pageVerseKeys,
        getSurahMeta(parsed.surah).ayahs,
      );
      const repeat = repeatCount <= 0 ? Number.POSITIVE_INFINITY : repeatCount;
      const { audio } = await armAudioSession();
      setAudioError(null);
      setAudioDockOpen(true);
      setAudioDockMini(false);
      bumpChrome();
      suppressPageSyncRef.current = true;
      audio.setLoopConfig(loop.surah, {
        startAyah: loop.startAyah,
        endAyah: loop.endAyah,
        repeatCount: repeat,
        delayMs: Math.max(0, delayMs),
      });
      const start = range === "page" || range === "surah" ? loop.startAyah : parsed.ayah;
      setAudioStatus("تجهيز التلاوة…");
      await audio.playAyah(loop.surah, start, reciterId);
    },
    [armAudioSession, bumpChrome, pageVerseKeys, playingVerseKey, reciterId, selectedVerseKey],
  );

  const playPage = useCallback(async () => {
    if (pageVerseKeys.length === 0) {
      setAudioError("لا توجد آيات على هذه الصفحة");
      return;
    }
    const { recitation, unlockAudioOnUserGesture } = await armAudioSession();
    unlockAudioOnUserGesture();
    setAudioError(null);
    setIosAudioHint(null);
    setActionsOpen(false);
    setAudioDockOpen(true);
    bumpChrome();
    suppressPageSyncRef.current = true;
    setAudioStatus("جاري تشغيل الصفحة…");
    await recitation.playPage(pageVerseKeys, reciterId);
  }, [armAudioSession, bumpChrome, pageVerseKeys, reciterId]);

  const retryPlayback = useCallback(async () => {
    const key = playingVerseKey ?? selectedVerseKey;
    if (!key) return;
    const parsed = parseVerseKey(key);
    if (!parsed) return;
    const { recitation, unlockAudioOnUserGesture } = await armAudioSession();
    unlockAudioOnUserGesture();
    setAudioError(null);
    setIosAudioHint(null);
    await recitation.playAyah(parsed.surah, parsed.ayah, reciterId);
  }, [armAudioSession, playingVerseKey, reciterId, selectedVerseKey]);

  const onReciterChange = useCallback(
    async (id: string) => {
      saveReciterId(id);
      setReciterId(id);
      const { recitation } = await armAudioSession();
      await recitation.changeReciter(id);
    },
    [armAudioSession],
  );

  const onPlayReciter = useCallback(
    async (id: string) => {
      saveReciterId(id);
      setReciterId(id);
      const key = selectedVerseKey ?? playingVerseKey;
      if (!key) {
        setAudioError("اختر آية أولاً");
        return;
      }
      const parsed = parseVerseKey(key);
      if (!parsed) {
        setAudioError("اختر آية أولاً");
        return;
      }
      const { recitation, unlockAudioOnUserGesture } = await armAudioSession();
      unlockAudioOnUserGesture();
      setAudioError(null);
      setIosAudioHint(null);
      setActionsOpen(false);
      setAudioDockOpen(true);
      suppressPageSyncRef.current = true;
      setAudioStatus("تجهيز التلاوة…");
      await recitation.playAyah(parsed.surah, parsed.ayah, id);
    },
    [armAudioSession, playingVerseKey, selectedVerseKey],
  );

  const onCopy = useCallback(async () => {
    if (!selectedVerseKey) return;
    const parsed = parseVerseKey(selectedVerseKey);
    const body = versePreview(selectedVerseKey);
    const label = parsed
      ? `${getSurahMeta(parsed.surah).name} ${parsed.ayah}\n${body}`
      : body;
    try {
      await navigator.clipboard.writeText(label);
      setStatus("تم النسخ");
    } catch {
      setStatus(STATUS.loadError);
    }
  }, [selectedVerseKey, versePreview]);

  const onBookmark = useCallback(() => {
    if (!selectedVerseKey) return;
    if (!isMushafNavCapabilityEnabled("bookmark")) return;
    setActionsOpen(false);
    setBookmarkComposerOpen(true);
    setChromeOpen(false);
  }, [selectedVerseKey]);

  const closeBookmarkComposer = useCallback(() => {
    setBookmarkComposerOpen(false);
  }, []);

  const openPageBookmarkSheet = useCallback(() => {
    if (!isMushafNavCapabilityEnabled("bookmark")) return;
    setActionsOpen(false);
    setBookmarkComposerOpen(false);
    setPageBookmarkSheetOpen(true);
    setChromeOpen(true);
  }, []);

  const closePageBookmarkSheet = useCallback(() => {
    setPageBookmarkSheetOpen(false);
  }, []);

  const onBookmarkSaved = useCallback((message: string) => {
    setStatus(message);
    setBookmarkEpoch((n) => n + 1);
  }, []);

  const verseLabel = useMemo(() => {
    const key = playingVerseKey ?? selectedVerseKey;
    if (!key) return "التلاوة";
    const parsed = parseVerseKey(key);
    if (!parsed) return key;
    return `${getSurahMeta(parsed.surah).name} · ${parsed.ayah}`;
  }, [playingVerseKey, selectedVerseKey]);

  const mediaPlaying =
    playerState === "playing" || playerState === "buffering" || playerState === "loading";

  /** ±1 فوري · ±2 على idle — يمنع تنافس أول طلاء مع prefetch بعيد */
  const [neighborEpoch, setNeighborEpoch] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | null = null;
    let idleTimer: number | null = null;
    const near: Promise<unknown>[] = [];
    if (page < MUSHAF_PAGE_MAX) {
      near.push(ensureQpcPageFont(page + 1));
      near.push(loadMushafPage(page + 1).catch(() => null));
    }
    if (page > 1) {
      near.push(ensureQpcPageFont(page - 1));
      near.push(loadMushafPage(page - 1).catch(() => null));
    }
    void Promise.all(near).then(() => {
      if (!cancelled) setNeighborEpoch((n) => n + 1);
    });
    const prefetchFar = () => {
      if (cancelled) return;
      const far: Promise<unknown>[] = [];
      if (page < MUSHAF_PAGE_MAX - 1) {
        far.push(ensureQpcPageFont(page + 2));
        far.push(loadMushafPage(page + 2).catch(() => null));
      }
      if (page > 2) {
        far.push(ensureQpcPageFont(page - 2));
        far.push(loadMushafPage(page - 2).catch(() => null));
      }
      if (far.length === 0) return;
      void Promise.all(far).then(() => {
        if (!cancelled) setNeighborEpoch((n) => n + 1);
      });
    };
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      idleHandle = ric(prefetchFar, { timeout: 1400 });
    } else {
      idleTimer = window.setTimeout(prefetchFar, 220);
    }
    return () => {
      cancelled = true;
      if (idleHandle != null) {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(idleHandle);
      }
      if (idleTimer != null) window.clearTimeout(idleTimer);
    };
  }, [page]);
  void neighborEpoch; /* يعيد تقييم الجيران عند اكتمال التحميل */
  const neighborsReady =
    (page >= MUSHAF_PAGE_MAX ||
      (isQpcPageFontReady(page + 1) && Boolean(getCachedMushafPage(page + 1)))) &&
    (page <= 1 ||
      (isQpcPageFontReady(page - 1) && Boolean(getCachedMushafPage(page - 1))));

  /* شيتات فقط تعطّل السحب — الجيران يُجهَّزان في الخلفية بلا قطع اللمس */
  const edgesDisabled =
    tafsirOpen || searchOpen || indexOpen || bookmarkComposerOpen || pageBookmarkSheetOpen;
  /* إخفاء الرصيف عند فتح قائمة الآية لتفادي تعارض أزرار التشغيل */

  const onPageNumberPressCurrent = useCallback(() => {
    setGotoOpen(true);
    setActionsOpen(false);
    setControlsMoreOpen(false);
    /* لا تعتمد على إخفاء الكروم: وضع التركيز يخفي .nm-controls عند data-chrome=0 */
    setChromeOpen(true);
  }, []);

  /*
   * لا يعتمد على `page` — role==="current" يكفي؛ يقلّل هوية renderPage
   * أثناء التزام الصفحة (settled=false) فيُعاد استخدام ألواح ±1 بلا إعادة رسم زائدة.
   */
  const renderPage = useCallback(
    (pageNumber: number, role: "next" | "current" | "prev") => (
      <PrefetchPage
        pageNumber={pageNumber}
        active={role === "current"}
        selectionEnabled={pagerSettled && role === "current"}
        onSelectVerse={role === "current" && pagerSettled ? onSelectVerse : undefined}
        onLongPressVerse={role === "current" && pagerSettled ? onLongPressVerse : undefined}
        onPageNumberPress={role === "current" ? onPageNumberPressCurrent : undefined}
        error={role === "current" ? error : null}
        showBookmarkMarkers={role === "current" && pagerSettled}
        bookmarkEpoch={bookmarkEpoch}
        onBookmarkMarkerOpen={
          role === "current"
            ? (ayahKey) => {
                applyVerseSelection(ayahKey, true);
              }
            : undefined
        }
      />
    ),
    [
      pagerSettled,
      onSelectVerse,
      onLongPressVerse,
      onPageNumberPressCurrent,
      applyVerseSelection,
      error,
      bookmarkEpoch,
    ],
  );

  const onScrubberGoto = useCallback(
    (n: number) => {
      if (edgesDisabled || !pagerSettled || !neighborsReady) return;
      go(n);
      bumpChrome();
    },
    [edgesDisabled, pagerSettled, neighborsReady, go, bumpChrome],
  );

  const onControlsMoreOpenChange = useCallback(
    (open: boolean) => {
      setControlsMoreOpen(open);
      if (open) {
        setGotoOpen(false);
        bumpChrome();
      }
    },
    [bumpChrome],
  );

  const onControlsGotoOpenChange = useCallback((open: boolean) => {
    setGotoOpen(open);
    if (open) {
      setControlsMoreOpen(false);
      setChromeOpen(true);
    }
  }, []);

  const onControlsGoto = useCallback(
    (n: number) => {
      go(n);
      setGotoOpen(false);
      setControlsMoreOpen(false);
    },
    [go],
  );

  const onControlsExit = useCallback(() => {
    setMushafAyahSearchHighlight(null);
    setSearchOpen(false);
    setIndexOpen(false);
    setTafsirOpen(false);
    setTafsirVerseKey(null);
    setActionsOpen(false);
    setBookmarkComposerOpen(false);
    clearAyahSelection();
    setSelectedVerseKey(null);
    setControlsMoreOpen(false);
    setGotoOpen(false);
    setAudioDockOpen(false);
    getMushafAudioSessionOrNull()?.recitation.stop();
    onExit();
  }, [onExit]);

  const onControlsIndex = useCallback(() => {
    setIndexOpen(true);
    setSearchOpen(false);
    setGotoOpen(false);
    setControlsMoreOpen(false);
    bumpChrome();
  }, [bumpChrome]);

  const onControlsSearch = useCallback(() => {
    setSearchOpen(true);
    setIndexOpen(false);
    setGotoOpen(false);
    setControlsMoreOpen(false);
    bumpChrome();
  }, [bumpChrome]);
  
  const onControlsPlayPage = useCallback(() => {
    void playPage();
  }, [playPage]);

  const onControlsTafsir = useCallback(() => {
    if (!selectedVerseKey) {
      setStatus("اختر آية للتفسير");
      bumpChrome();
      return;
    }
    openTafsir();
  }, [bumpChrome, openTafsir, selectedVerseKey]);

  const onControlsNotes = useCallback(() => {
    if (selectedVerseKey && isMushafNavCapabilityEnabled("bookmark")) {
      setActionsOpen(false);
      setBookmarkComposerOpen(true);
      setControlsMoreOpen(false);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.assign("/mushaf/bookmarks");
    }
  }, [selectedVerseKey]);

  const mushafPageShareUrl = useCallback(() => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://www.ssunnah.com";
    return `${origin}/mushaf?page=${page}`;
  }, [page]);

  const onControlsCopyLink = useCallback(() => {
    const url = mushafPageShareUrl();
    void navigator.clipboard.writeText(url).then(
      () => setStatus("تم نسخ رابط الصفحة"),
      () => setStatus(STATUS.loadError),
    );
  }, [mushafPageShareUrl]);

  const onControlsSharePage = useCallback(() => {
    const url = mushafPageShareUrl();
    const title = `المصحف — صفحة ${page}`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      void navigator.share({ title, url }).catch(() => {
        void navigator.clipboard.writeText(url).then(
          () => setStatus("تم نسخ رابط الصفحة"),
          () => setStatus(STATUS.loadError),
        );
      });
      return;
    }
    void navigator.clipboard.writeText(url).then(
      () => setStatus("تم نسخ رابط الصفحة"),
      () => setStatus(STATUS.loadError),
    );
  }, [mushafPageShareUrl, page]);

  const audioDockVisible =
    !actionsOpen &&
    audioDockOpen &&
    (chromeOpen ||
      playerState === "playing" ||
      playerState === "buffering" ||
      playerState === "loading" ||
      playerState === "error");

  return (
    <MushafPager
      ref={metricsRootRef}
      page={page}
      onPageChange={go}
      disabled={edgesDisabled}
      onNavigateStart={() => {
        /* يُستدعى عند الالتزام فقط (go) — ليس عند أول بكسل سحب */
        mushafTurnMark("transitionStart", page);
        beginPageTurn();
      }}
      onPanVisualStart={() => {
        /* telemetry أولاً؛ إغلاق التفسير + مسح التحديد إن كان مفتوحًا */
        mushafTurnMark("firstPageMovement", page);
        if (tafsirOpenRef.current) {
          bumpTafsirGeneration();
          tafsirIntentRef.current = null;
          tafsirOpenRef.current = false;
          setTafsirOpen(false);
          setTafsirVerseKey(null);
          clearAyahSelection();
          setSelectedVerseKey(null);
          setActionsOpen(false);
        }
      }}
      onGestureArm={() => {
        mushafTurnMark("touchStart", page);
      }}
      onNavigateCancel={cancelPageTurnFreeze}
      /* WAVE6: النص قابل للسحب عبر panSlopFor(onAyah) — لا تُتجاهل .nm-word / ayah-hit */
      ignoreSelector=".nm-controls, .nm-verse-menu, .nm-page-arrows, .nm-page-arrow, .nm-page-scrubber, .mm-audio-dock, .mm-ayah-bar, .ayah-action-sheet, .mm-search-sheet, .rb-composer, .rb-page-sheet, .rb-editor-shell, .rb-markers, .nm-nav-highlight-chip, input, textarea, select, button"
      onTapEmpty={() => {
        if (actionsOpen) {
          closeActions();
          return;
        }
        if (selectedVerseKey) {
          clearSelection();
          return;
        }
        if (tafsirOpenRef.current) return;
        /* نقرة واحدة تبدّل Chrome — ألغِ أي auto-hide سابق؛ useEffect يعيد الجدولة عند الظهور */
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        setChromeOpen((v) => !v);
      }}
      className="nm-root mm-viewport mushaf-shell"
      data-chrome={chromeOpen ? "1" : "0"}
      data-goto={gotoOpen ? "1" : "0"}
      data-ayah-bar={actionsOpen ? "1" : "0"}
      data-audio-dock={audioDockVisible ? "1" : "0"}
      data-audio-mini={audioDockVisible && audioDockMini ? "1" : "0"}
      data-pager-settled={pagerSettled ? "1" : "0"}
      data-page-turn-phase={pageTurnPhase}
      data-ultra-smooth="1"
      data-bottom-freeze={bottomStackFrozen ? "1" : "0"}
      data-freeze-stack={freezeStackMode}
      data-testid="mushaf-viewport"
      data-reader-chrome={chromeOpen ? "1" : "0"}
      data-tafsir-open={tafsirOpen ? "1" : "0"}
      /* مصدر واحد: تفضيل التركيز الصريح فقط — عقد الإخفاء عبر data-chrome */
      data-focus-reading={focusReadingMode ? "1" : "0"}
      data-page-arrows={pageArrowsEnabled ? "1" : "0"}
      data-mushaf-appearance={mushafAppearanceResolved}
      data-mushaf-accent="gold"
      data-signature-preset={import.meta.env.DEV ? "sunnah-mushaf-signature-v1" : undefined}
      dir="rtl"
      renderPage={renderPage}
    >
      <h1 className="sr-only">المصحف الشريف</h1>
      <div className="sr-only" aria-live="polite" data-testid="mushaf-page-live">
        {`الصفحة ${page}`}
      </div>
      <NavigationHighlightChip
        onDismiss={() => {
          clearPendingNavigationHighlight();
          setNavigationHighlightedAyahId(null);
          revealedNavIntentRef.current = null;
        }}
      />
      {import.meta.env.DEV ? (
        <div
          aria-hidden
          data-testid="mushaf-appearance-diag"
          data-selected-theme="GOLD"
          data-provider-theme="GOLD"
          data-root-accent="gold"
          data-persisted-theme=""
          data-page-layout={page === 1 ? "opening" : page === 2 ? "lead" : "regular"}
          style={{
            position: "fixed",
            insetInlineEnd: 8,
            insetBlockStart: 8,
            zIndex: 9998,
            pointerEvents: "none",
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            lineHeight: 1.35,
            padding: "4px 6px",
            borderRadius: 6,
            background: "color-mix(in srgb, canvas 82%, transparent)",
            color: "CanvasText",
            maxWidth: "42vw",
            whiteSpace: "pre-wrap",
          }}
        >
          {`theme=GOLD\nattr=gold\npage=${page}`}
        </div>
      ) : null}
      {import.meta.env.DEV ? (
        <div
          aria-hidden
          data-testid="mushaf-turn-debug"
          style={{
            position: "fixed",
            insetInlineStart: 8,
            insetBlockStart: 8,
            zIndex: 9999,
            pointerEvents: "none",
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            lineHeight: 1.35,
            padding: "4px 6px",
            borderRadius: 6,
            background: "color-mix(in srgb, canvas 82%, transparent)",
            color: "CanvasText",
            maxWidth: "46vw",
            whiteSpace: "pre-wrap",
          }}
        >
          {(() => { const L = mushafPerfSnapshot(); return `p=${page} settled=${pagerSettled ? 1 : 0} nbr=${neighborsReady ? 1 : 0}\ngeo=${getMushafGeometryKey()}\nrM=${L.readerMountCount} pM=${L.pagerMountCount} fL=${L.fontLoadCount} gC=${L.geometryChangeCount}`; })()}
        </div>
      ) : null}
      {audioArmed ? (
        <MediaBridge
          active={Boolean(playingVerseKey || playerState === "paused" || mediaPlaying)}
          title={verseLabel}
          artist={getReciter(reciterId).nameAr}
          playing={mediaPlaying}
          onPlay={() => void togglePlay()}
          onPause={() => getMushafAudioSessionOrNull()?.audio.pause()}
          onStop={() => getMushafAudioSessionOrNull()?.audio.stop()}
          onNext={() => {
            suppressPageSyncRef.current = false;
            const a = getMushafAudioSessionOrNull()?.audio;
            if (!a) return;
            a.setReciter(reciterId);
            void a.skipNext();
          }}
          onPrevious={() => {
            suppressPageSyncRef.current = false;
            const a = getMushafAudioSessionOrNull()?.audio;
            if (!a) return;
            a.setReciter(reciterId);
            void a.skipPrev();
          }}
        />
      ) : null}

      {audioDockOpen || audioArmed ? (
        <Suspense fallback={null}>
          <QuranAudioPlayer
            open={audioDockVisible}
            verseLabel={verseLabel}
            playerState={playerState}
            reciterId={reciterId}
            audioError={audioError}
            audioStatus={audioStatus}
            iosHint={iosAudioHint}
            mini={audioDockMini}
            onMiniChange={setAudioDockMini}
            onTogglePlay={() => void togglePlay()}
            onPrev={() => {
              suppressPageSyncRef.current = false;
              void getMushafAudioSessionOrNull()?.recitation.previousAyah();
            }}
            onNext={() => {
              suppressPageSyncRef.current = false;
              void getMushafAudioSessionOrNull()?.recitation.nextAyah();
            }}
            onReciterChange={(id) => void onReciterChange(id)}
            onPlayReciter={(id) => void onPlayReciter(id)}
            onRetry={() => void retryPlayback()}
            onSeek={(seconds) => getMushafAudioSessionOrNull()?.audio.seek(seconds)}
            onSpeed={(rate) => getMushafAudioSessionOrNull()?.audio.setPlaybackRate(rate)}
            onPlayRange={(range, repeat, delayMs) => void playRange(range, repeat, delayMs)}
            onClose={() => {
              setAudioDockOpen(false);
              setAudioDockMini(true);
              getMushafAudioSessionOrNull()?.recitation.stop();
            }}
            onStop={() => {
              getMushafAudioSessionOrNull()?.recitation.stop();
            }}
          />
        </Suspense>
      ) : null}
      <MushafPageArrows
        page={page}
        /* التفعيل مستقل عن Chrome — الإخفاء فقط عند الشيتات/القوائم المتداخلة */
        visible={
          !actionsOpen &&
          !gotoOpen &&
          !tafsirOpen &&
          !searchOpen &&
          !indexOpen &&
          !controlsMoreOpen
        }
        enabled={pageArrowsEnabled}
        /* busy يخفّف التفاعل دون إخفاء السهم (كان :disabled يصفّر opacity) */
        busy={edgesDisabled || !pagerSettled}
        go={(n) => {
          if (edgesDisabled || !pagerSettled || !neighborsReady) return;
          go(n);
        }}
      />

      {isMushafNavCapabilityEnabled("pageScrubber") ? (
        <MushafPageScrubber
          page={page}
          juzNumber={
            displayView?.layout.juzNumber ??
            getCachedMushafPage(page)?.juzNumber ??
            1
          }
          visible={
            chromeOpen &&
            !actionsOpen &&
            !gotoOpen &&
            !tafsirOpen &&
            !searchOpen &&
            !indexOpen &&
            !controlsMoreOpen
          }
          busy={edgesDisabled || !pagerSettled}
          onGoto={onScrubberGoto}
        />
      ) : null}

      <MushafControlsLayer
        chromeOpen={chromeOpen && !actionsOpen && !gotoOpen}
        pageNumber={page}
        focusReadingMode={focusReadingMode}
        onToggleFocusReadingMode={toggleFocusReadingMode}
        pageArrowsEnabled={pageArrowsEnabled}
        onPageArrowsEnabledChange={onPageArrowsEnabledChange}
        moreOpen={controlsMoreOpen}
        onMoreOpenChange={onControlsMoreOpenChange}
        gotoOpen={gotoOpen}
        onGotoOpenChange={onControlsGotoOpenChange}
        onGoto={onControlsGoto}
        onExit={onControlsExit}
        onPlayPage={onControlsPlayPage}
        onIndex={onControlsIndex}
        onSearch={onControlsSearch}
        onTafsir={onControlsTafsir}
        onNotes={onControlsNotes}
        onSharePage={onControlsSharePage}
        onCopyLink={onControlsCopyLink}
        onBookmarkPage={openPageBookmarkSheet}
      />

      {actionsOpen && selectedVerseKey ? (
        <MushafVerseMenu
          verseKey={selectedVerseKey}
          status={status}
          onPlay={() => void playSelected()}
          onTafsir={openTafsir}
          onCopy={() => void onCopy()}
          onBookmark={onBookmark}
          onClose={closeActions}
          onClearSelection={clearSelection}
        />
      ) : null}

      {pageBookmarkSheetOpen ? (
        <Suspense fallback={null}>
        <MushafPageBookmarkSheet
          page={page}
          ayahKey={selectedVerseKey}
          onClose={closePageBookmarkSheet}
          onSaved={onBookmarkSaved}
        />
        </Suspense>
      ) : null}

      {bookmarkComposerOpen && selectedVerseKey ? (
        <Suspense fallback={null}>
        <MushafBookmarkComposer
          verseKey={selectedVerseKey}
          page={page}
          onClose={closeBookmarkComposer}
          onSaved={onBookmarkSaved}
        />
        </Suspense>
      ) : null}

      {tafsirVerseKey ? (
        <Suspense fallback={null}>
          <MushafTafsirSheet
            open={tafsirOpen}
            verseKey={tafsirVerseKey}
            ayahText={versePreview(tafsirVerseKey)}
            onClose={closeTafsir}
          />
        </Suspense>
      ) : null}

      {searchOpen || indexOpen ? (
        <Suspense fallback={null}>
          <MushafSearchSheet
            open={searchOpen || indexOpen}
            mode={indexOpen ? "index" : "search"}
            onClose={() => {
              setSearchOpen(false);
              setIndexOpen(false);
            }}
            onGotoPage={(n, verseKey) => {
              if (verseKey) pendingSelectRef.current = verseKey;
              go(n);
              if (verseKey && n === page) {
                pendingSelectRef.current = null;
                setMushafAyahSearchHighlight(verseKey);
                clearAyahSelection();
                setSelectedVerseKey(null);
                setActionsOpen(false);
                setTafsirOpen(false);
                setChromeOpen(false);
                window.setTimeout(() => setMushafAyahSearchHighlight(null), 4000);
              }
            }}
          />
        </Suspense>
      ) : null}
    </MushafPager>
  );
}

const PrefetchPage = memo(function PrefetchPage({
  pageNumber,
  active = false,
  selectionEnabled = false,
  onSelectVerse,
  onLongPressVerse,
  onPageNumberPress,
  error = null,
  showBookmarkMarkers = false,
  bookmarkEpoch = 0,
  onBookmarkMarkerOpen,
}: {
  pageNumber: number;
  active?: boolean;
  selectionEnabled?: boolean;
  onSelectVerse?: (verseKey: string) => void;
  onLongPressVerse?: (verseKey: string) => void;
  onPageNumberPress?: () => void;
  error?: string | null;
  showBookmarkMarkers?: boolean;
  bookmarkEpoch?: number;
  onBookmarkMarkerOpen?: (ayahKey: string) => void;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);
  const [layout, setLayout] = useState<MushafPageLayout | null>(() => {
    const model = getCachedPageRenderModel(pageNumber);
    if (model?.layout) return model.layout;
    return getCachedMushafPage(pageNumber);
  });
  const { fontFamily, ready } = useQpcPageFont(pageNumber, { prefetchAdjacent: false });

  useEffect(() => {
    let cancelled = false;
    const model = getCachedPageRenderModel(pageNumber);
    const cached = model?.layout ?? getCachedMushafPage(pageNumber);
    if (cached) {
      setLayout((prev) => (prev === cached ? prev : cached));
    }
    void loadMushafPage(pageNumber).then((data) => {
      if (cancelled) return;
      /* لا تُعد الرسم إن كانت نفس بيانات الكاش */
      setLayout((prev) => (prev === data ? prev : data));
    });
    return () => {
      cancelled = true;
    };
  }, [pageNumber]);

  useEffect(() => {
    if (ready && layout) {
      const had = Boolean(getCachedPageRenderModel(pageNumber));
      putPageRenderModel(pageNumber, layout, fontFamily);
      mushafTurnInc(had ? "cacheHit" : "cacheMiss");
    }
  }, [ready, layout, pageNumber, fontFamily]);

  const canPaint = Boolean(layout) && (ready || isQpcPageFontReady(pageNumber));

  return (
    <div
      ref={(el) => {
        shellRef.current = el;
        setShellEl(el);
      }}
      className="nm-shell mm-page-shell mushaf-page-frame"
      data-testid={active ? "mushaf-page-shell" : undefined}
      data-page-pane={active ? "active" : "prefetch"}
    >
      {active && error ? <div className="nm-status">{error}</div> : null}
      {!canPaint || !layout ? (
        <div
          className="nm-page-placeholder nm-page-placeholder--frame"
          aria-hidden={active ? undefined : true}
          role={active ? "status" : undefined}
          aria-label={active ? "سُنّة" : undefined}
          aria-busy={active ? true : undefined}
        />
      ) : (
        <MushafPage
          layout={layout}
          fontFamily={fontFamily || `"qpc-v2-p${pageNumber}"`}
          displayPageNumber={pageNumber}
          onSelectVerse={selectionEnabled ? onSelectVerse : undefined}
          onLongPressVerse={selectionEnabled ? onLongPressVerse : undefined}
          selectionEnabled={selectionEnabled}
          onPageNumberPress={onPageNumberPress}
        />
      )}
      {showBookmarkMarkers && canPaint ? (
        <Suspense fallback={null}>
          <MushafBookmarkMarkers
            key={bookmarkEpoch}
            page={pageNumber}
            container={shellEl}
            enabled={selectionEnabled}
            onOpenAyah={onBookmarkMarkerOpen}
          />
        </Suspense>
      ) : null}
    </div>
  );
});


function NavigationHighlightChip({ onDismiss }: { onDismiss: () => void }) {
  const navigationKey = useMushafAyahNavigationKey();
  if (!navigationKey) return null;
  const [surahRaw, ayahRaw] = navigationKey.split(":");
  const surahId = Number.parseInt(surahRaw || "", 10);
  const ayahId = Number.parseInt(ayahRaw || "", 10);
  if (!Number.isFinite(surahId) || !Number.isFinite(ayahId)) return null;
  const surahName = getSurahMeta(surahId)?.name ?? String(surahId);
  const label = `${surahName}، آية ${toArabicDigits(ayahId)}`;
  return (
    <div
      className="nm-nav-highlight-chip"
      role="status"
      data-testid="mushaf-nav-highlight-chip"
      dir="rtl"
    >
      <span className="nm-nav-highlight-chip__label">{label}</span>
      <button
        type="button"
        className="nm-nav-highlight-chip__dismiss"
        onClick={onDismiss}
        aria-label="إلغاء التحديد"
      >
        إلغاء التحديد
      </button>
    </div>
  );
}

function MediaBridge({
  active,
  title,
  artist,
  playing,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
}: {
  active: boolean;
  title: string;
  artist: string;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const clock = useMushafAudioClock();
  useMediaSession(
    active
      ? {
          title,
          artist,
          album: "تلاوة القرآن — سُنّة",
          playing,
          position: clock.currentTime,
          duration: clock.duration,
          playbackRate: clock.playbackRate,
          onPlay,
          onPause,
          onStop,
          onNext,
          onPrevious,
        }
      : null,
  );
  return null;
}

export { NewMushafReader as MushafViewport };
