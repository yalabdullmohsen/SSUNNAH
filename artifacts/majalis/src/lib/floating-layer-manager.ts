/**
 * Floating Layer Manager — مالك تشغيلي واحد لإزاحات الطبقات العائمة.
 * لا يرسم UI؛ يوحّد قراءة --z-* و --inset-* وارتفاع الشريط/المشغّل.
 * السياسة: docs/design/FLOATING_CONTROLS_POLICY.md
 */

export type FloatingSlotId =
  | "scroll-to-top"
  | "floating-back"
  | "assistant-fab"
  | "mini-player"
  | "prayer-controls"
  | "mushaf-controls";

const SLOT_Z: Record<FloatingSlotId, string> = {
  "scroll-to-top": "var(--z-fab, 220)",
  "floating-back": "var(--z-fab, 220)",
  "assistant-fab": "var(--z-fab, 220)",
  "mini-player": "var(--z-audio-mini, 210)",
  "prayer-controls": "var(--z-fab, 220)",
  "mushaf-controls": "var(--z-chrome, 150)",
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

/** إزاحة أسفل موحّدة فوق Bottom Nav + safe-area + مشغّل اختياري */
export function getFloatingBottomOffset(slot: FloatingSlotId): number {
  const safe = readCssPx("--inset-bottom", 0) || readCssPx("--safe-area-inset-bottom", 0);
  const nav = readCssPx("--bottom-nav-height", 64) || readCssPx("--bottom-nav-h", 64) || 64;
  let extra = 12;
  if (slot === "mini-player") {
    return safe;
  }
  if (isMiniPlayerOpen()) {
    extra +=
      readCssPx("--quran-mini-player-offset", 0) ||
      readCssPx("--audio-dock-h", 72) ||
      72;
  }
  if (slot === "floating-back") {
    extra += 8;
  }
  if (slot === "scroll-to-top") {
    extra += 56; // فوق زر الرجوع إن وُجد
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
  root.style.setProperty(
    "--floating-back-bottom",
    `${getFloatingBottomOffset("floating-back")}px`,
  );
  root.style.setProperty(
    "--scroll-to-top-bottom",
    `${getFloatingBottomOffset("scroll-to-top")}px`,
  );
  root.style.setProperty(
    "--assistant-fab-bottom",
    `${getFloatingBottomOffset("assistant-fab")}px`,
  );
}
