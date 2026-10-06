/**
 * يحقن src/styles/font-system.css (تعريفات @font-face + رموز --font-ui/--font-text/--font-quran)
 * داخل <head> كـ<style> حرج مكان العلامة <!--FONT_SYSTEM_CSS-->.
 * السبب: CSS الدخول مؤجَّل (data-mj-css-defer)، فبدون هذا يرسم أول إطار بخط النظام ثم يبدّل.
 * مصدر وحيد: الملف نفسه — لا نسخة مكررة في index.html (تكرار الوجه يسبب FontFace ثانيًا وتبديلًا مرئيًا).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const FONT_SYSTEM_CSS_PATH = path.resolve(here, "../src/styles/font-system.css");
export const FONT_SYSTEM_MARKER = "<!--FONT_SYSTEM_CSS-->";

export function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

/** يطبّق الحقن على نص index.html (للاختبارات ونصوص البناء). */
export function expandFontSystem(html) {
  if (!html.includes(FONT_SYSTEM_MARKER)) return html;
  const css = minifyCss(readFileSync(FONT_SYSTEM_CSS_PATH, "utf8"));
  return html.replace(FONT_SYSTEM_MARKER, `<style id="mj-font-system">${css}</style>`);
}

export function inlineFontSystemPlugin() {
  return {
    name: "majalis-inline-font-system",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return expandFontSystem(html);
      },
    },
  };
}
