/**
 * Floating Layer Manager — المالك التشغيلي الوحيد لإزاحات الطبقات العائمة.
 * لا يرسم UI؛ يوحّد قراءة --z-* و --inset-* وارتفاع الشريط/المشغّل/الكيبورد/النوافذ.
 * السياسة: docs/design/FLOATING_CONTROLS_POLICY.md
 */

export type FloatingSlotId =
  | "scroll-to-top"
  | "floating-back"
  | "assistant-fab"
  | "mini-player"
  | "prayer-controls"
  | "mushaf-controls"
  | "sticky-form-actions"
  | "dialog-actions"
  | "sheet-actions";

const SLOT_Z: Record<FloatingSlotId, string> = {
  "scroll-to-top": "var(--z-fab, 220)",
  "floating-back": "var(--z-fab, 220)",
  "assistant-fab": "var(--z-fab, 220)",
  "mini-player": "var(--z-audio-mini, 210)",
  "prayer-controls": "var(--z-fab, 220)",
  "mushaf-controls": "var(--z-chrome, 150)",
  "sticky-form-actions": "var(--z-sticky, 100)",
  "dialog-actions": "var(--z-overlay-dialog, 10050)",
  "sheet-actions": "var(--z-sheet, 10040)",
};

function readCssPx(varName: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function isMiniPlayerOpen(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  const v = root.getAttribute("data-quran-mini-player");
  return (
    v === "mini" ||
    v === "expanded" ||
    root.classList.contains("audio-dock-open") ||
    root.getAttribute("data-audio-dock") === "1"
  );
}

/** ارتفاع الكيبورد من VisualViewport bridge (--keyboard-inset) */
export function getKeyboardInset(): number {
  return Math.max(0, readCssPx("--keyboard-inset", 0));
}

/** Dialog / Sheet / alert-dialog مفتوح — يُخفى خلفية FABs */
export function isModalLayerOpen(): boolean {
  if (typeof document === "undefined") return false;
  if (
    document.body.classList.contains("app-sheet-open") ||
    document.body.classList.contains("filter-sheet-open") ||
    document.body.classList.contains("assistant-panel-open")
  ) {
    return true;
  }
  if (document.documentElement.getAttribute("data-mushaf-bookmark-editor") === "1") {
    return true;
  }
  return Boolean(
    document.querySelector(
      [
        '[role="dialog"][data-state="open"]',
        '[data-state="open"][data-radix-dialog-content]',
        '[data-state="open"][data-radix-alert-dialog-content]',
        '[aria-modal="true"]',
        '[data-rb-editor-shell="1"]',
      ].join(","),
    ),
  );
}

/** إخفاء طبقات الخلفية العائمة أثناء modal/sheet/كيبورد كبير */
export function shouldSuppressBackgroundFloating(): boolean {
  if (isModalLayerOpen()) return true;
  /* كيبورد يغطي معظم الشاشة — أخفِ FAB حتى لا يغطي حقول الإدخال */
  if (typeof window !== "undefined" && getKeyboardInset() > Math.min(160, window.innerHeight * 0.22)) {
    return true;
  }
  return false;
}

function miniPlayerExtra(): number {
  if (!isMiniPlayerOpen()) return 0;
  return (
    readCssPx("--quran-mini-player-offset", 0) ||
    readCssPx("--audio-dock-h", 72) ||
    72
  );
}

/** إزاحة أسفل موحّدة فوق Bottom Nav + safe-area + مشغّل + كيبورد */
export function getFloatingBottomOffset(slot: FloatingSlotId): number {
  const safe = readCssPx("--inset-bottom", 0) || readCssPx("--safe-area-inset-bottom", 0);
  const nav = readCssPx("--bottom-nav-height", 64) || readCssPx("--bottom-nav-h", 64) || 64;
  const keyboard = getKeyboardInset();

  if (slot === "mini-player") {
    return safe + keyboard;
  }
  if (slot === "dialog-actions" || slot === "sheet-actions") {
    return safe + keyboard;
  }
  if (slot === "mushaf-controls") {
    return safe + keyboard + (isMiniPlayerOpen() ? miniPlayerExtra() : 0);
  }

  let extra = 12;
  extra += miniPlayerExtra();
  if (keyboard > 0) {
    /* عند فتح الكيبورد: ارفع فوقه بدل الشريط السفلي المخفي غالبًا */
    extra += keyboard;
  }
  if (slot === "floating-back") {
    extra += 8;
  }
  if (slot === "scroll-to-top") {
    extra += 56; // فوق زر الرجوع إن وُجد
  }
  if (slot === "assistant-fab") {
    extra += 4;
  }
  if (slot === "sticky-form-actions") {
    return nav + safe + keyboard + 8;
  }
  return nav + safe + extra;
}

export function getFloatingZIndex(slot: FloatingSlotId): string {
  return SLOT_Z[slot];
}

/** يُستدعى من المكوّنات العائمة لمزامنة CSS vars المشتركة */
export function applyFloatingLayerCssVars(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const back = getFloatingBottomOffset("floating-back");
  root.style.setProperty("--floating-back-bottom", `${back}px`);
  root.style.setProperty("--global-back-bottom", `${back}px`);
  root.style.setProperty(
    "--scroll-to-top-bottom",
    `${getFloatingBottomOffset("scroll-to-top")}px`,
  );
  root.style.setProperty(
    "--assistant-fab-bottom",
    `${getFloatingBottomOffset("assistant-fab")}px`,
  );
  root.style.setProperty(
    "--floating-suppress",
    shouldSuppressBackgroundFloating() ? "1" : "0",
  );
  if (shouldSuppressBackgroundFloating()) {
    root.setAttribute("data-floating-suppress", "1");
  } else {
    root.removeAttribute("data-floating-suppress");
  }
}

let syncInstalled = false;
let syncCleanup: (() => void) | null = null;

/**
 * مستمع واحد لـ resize / VisualViewport / MutationObserver —
 * يمنع تكرار المستمعين عبر ScrollToTop و FloatingBack و Assistant.
 */
export function installFloatingLayerSync(): () => void {
  if (typeof window === "undefined") return () => {};
  if (syncInstalled && syncCleanup) return syncCleanup;

  const sync = () => applyFloatingLayerCssVars();
  sync();

  window.addEventListener("resize", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);

  const mo = new MutationObserver(sync);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      "class",
      "data-audio-dock",
      "data-quran-mini-player",
      "data-theme",
      "style",
    ],
  });
  /* childList على body فقط (portals) + attributes للـmodal بدون مسح subtree كامل للعقد */
  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-state", "aria-modal", "open"],
    childList: true,
  });
  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-state", "aria-modal", "open", "data-rb-editor-shell"],
    subtree: true,
    childList: false,
  });

  syncInstalled = true;
  syncCleanup = () => {
    window.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("scroll", sync);
    mo.disconnect();
    syncInstalled = false;
    syncCleanup = null;
  };
  return syncCleanup;
}
