/**
 * ملفات «تعريف رموز» صِرفة: كل لون خام فيها يقع داخل تصريح متغيّر (--name: #hex).
 * تُستثنى من عدّ hexOutsideTokens في ui-ratchet.mjs لأن التصريح تعريف لا استعمال.
 * الحارس: src/lib/__tests__/ui-token-definition-files.test.ts يفشل إن ظهر في أي منها
 * لون خام خارج تصريح متغيّر — فلا يجوز إدخال ملف يحوي استعمالًا خامًا هنا.
 */
export const TOKEN_DEFINITION_FILES = [
  "src/styles/prophets-semantic-tokens.css",
  "src/styles/semantic-layer-tokens.css",
  "src/styles/sunnah-foundation-v2.css",
  "src/styles/modern-islamic-editorial-tokens.css",
  "src/styles/sunnah-foundation-tokens.css",
  "src/styles/ssunnah-semantic-tokens.css",
  "src/styles/visual-redesign-v2-tokens.css",
  "src/styles/ssunnah-ds-canonical.css",
];

/** يعيد عدد الألوان الخام خارج تصريحات المتغيّرات في نص CSS (بعد حذف التعليقات). */
export const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g;
export function hexOutsideDeclarations(cssText) {
  const t = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const all = (t.match(HEX_RE) || []).length;
  let inDecl = 0;
  for (const m of t.matchAll(/(^|[;{\s])(--[\w-]+)\s*:\s*([^;}]*)/g)) inDecl += (m[3].match(HEX_RE) || []).length;
  return all - inDecl;
}
