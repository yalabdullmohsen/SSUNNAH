/**
 * حارس تركيب React: إن لم يُركَّب التطبيق خلال مهلة قصيرة لا يُترك المستخدم أمام
 * HTML المُسبَق التوليد الخام (نص بلا تنسيق) — تظهر شاشة تحميل واضحة بزر «إعادة المحاولة»،
 * وإن استمر الفشل تُجرى إعادة تحميل تلقائية واحدة فقط. ملفات ويب فقط، بلا CSS خارجي (أنماط مضمّنة).
 */
export const MOUNT_WATCHDOG_RELOAD_KEY = "mj_mount_watchdog_reload";
export const MOUNT_WATCHDOG_OVERLAY_ID = "mj-mount-watchdog";

export type MountWatchdogOptions = {
  /** مهلة إظهار الشاشة (افتراضي 3000ms) */
  showAfterMs?: number;
  /** مهلة إضافية بعد الإظهار قبل إعادة التحميل التلقائية الوحيدة */
  reloadAfterMs?: number;
  doc?: Document;
  reload?: () => void;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
};

let mounted = false;

function safeStorage(): MountWatchdogOptions["storage"] {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function removeMountWatchdogOverlay(doc: Document = document): void {
  doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID)?.remove();
}

/** تستدعيها شارة التركيب بعد أول commit لـReact. */
export function markAppMounted(doc: Document = document, storage = safeStorage()): void {
  mounted = true;
  removeMountWatchdogOverlay(doc);
  try {
    storage?.removeItem(MOUNT_WATCHDOG_RELOAD_KEY);
  } catch {
    /* التخزين غير متاح */
  }
}

export function isAppMounted(): boolean {
  return mounted;
}

export function __resetMountWatchdogForTests(): void {
  mounted = false;
}

export function showMountWatchdogOverlay(doc: Document, onRetry: () => void): void {
  if (doc.getElementById(MOUNT_WATCHDOG_OVERLAY_ID)) return;
  const wrap = doc.createElement("div");
  wrap.id = MOUNT_WATCHDOG_OVERLAY_ID;
  wrap.setAttribute("role", "alert");
  wrap.dir = "rtl";
  wrap.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:1.5rem;text-align:center;background:Canvas;color:CanvasText;font:600 1.125rem/1.8 system-ui,sans-serif";
  const msg = doc.createElement("p");
  msg.textContent = "يستغرق فتح التطبيق وقتًا أطول من المعتاد. اضغط «إعادة المحاولة».";
  msg.style.margin = "0";
  const btn = doc.createElement("button");
  btn.type = "button";
  btn.textContent = "إعادة المحاولة";
  btn.style.cssText = "min-height:3rem;padding:0 1.75rem;border-radius:0.75rem;border:1px solid currentColor;background:ButtonFace;color:ButtonText;font:inherit;cursor:pointer";
  btn.addEventListener("click", onRetry);
  wrap.append(msg, btn);
  doc.body.append(wrap);
}

export function installMountWatchdog(opts: MountWatchdogOptions = {}): () => void {
  const doc = opts.doc ?? document;
  const showAfter = opts.showAfterMs ?? 3000;
  const reloadAfter = opts.reloadAfterMs ?? 6000;
  const storage = opts.storage === undefined ? safeStorage() : opts.storage;
  const reload = opts.reload ?? (() => window.location.reload());
  const timers: ReturnType<typeof setTimeout>[] = [];

  timers.push(
    setTimeout(() => {
      if (mounted) return;
      showMountWatchdogOverlay(doc, reload);
      timers.push(
        setTimeout(() => {
          if (mounted) return;
          let already: boolean;
          try {
            already = storage?.getItem(MOUNT_WATCHDOG_RELOAD_KEY) === "1";
            if (!already) storage?.setItem(MOUNT_WATCHDOG_RELOAD_KEY, "1");
          } catch {
            already = true; // بلا تخزين لا نخاطر بحلقة إعادة تحميل
          }
          if (!already) reload();
        }, reloadAfter),
      );
    }, showAfter),
  );

  return () => timers.forEach((t) => clearTimeout(t));
}
