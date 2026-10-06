/**
 * تسخين خطوط واجهة اختيارية في الخلفية بعد INTERACTIVE.
 * لا Toast · لا remount · لا يحجب الإقلاع.
 */
import { isInteractive, subscribeAppStartup } from "@/lib/app-startup-controller";

let scheduled = false;

function warmOptionalUiFonts(): void {
  try {
    if (typeof document === "undefined" || !document.fonts) return;
    // Sunnah UI 400/600 وSunnah Text 400 مُحمَّلة عند الإقلاع؛ هنا الأوزان المتبقية بهدوء
    for (const face of ['500 16px "Sunnah UI"', '700 16px "Sunnah UI"', '700 16px "Sunnah Text"']) {
      void document.fonts.load(face).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

/** يُستدعى مرة من main بعد mount — ينتظر INTERACTIVE ثم يسخّن بهدوء. */
export function scheduleBackgroundUiFontWarm(): void {
  if (scheduled) return;
  scheduled = true;

  const run = () => {
    warmOptionalUiFonts();
  };

  if (isInteractive()) {
    run();
    return;
  }

  const unsub = subscribeAppStartup((next) => {
    if (next === "INTERACTIVE" || next === "BACKGROUND_REFRESH") {
      unsub();
      run();
    }
  });
}
