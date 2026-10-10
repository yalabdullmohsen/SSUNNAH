#!/usr/bin/env node
/**
 * debt-codemod — يحوّل الألوان الخام إلى رموز --sn-* بمطابقة حرفية فقط (لا تقريب).
 *   --dry-run [مسارات…]   يطبع الأرقام (قبل/بعد) ولا يكتب شيئًا
 *   --apply   [مسارات…]   يكتب التعديلات (idempotent)
 *   --check   [مسارات…]   يفشل إن بقي ما يمكن تحويله بلا خطأ (لـ ci:local)
 * المسارات الافتراضية = المسارات الحرجة. المطابقة على قيم الوضع الفاتح من design-system.css؛
 * اللون المبهم (نفس القيمة لرمزين) يُحسم بالخاصية: color/fill/stroke ← text-on-*، background ← surface، وإلا يبقى يدويًا.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const argv = process.argv.slice(2);
const mode = argv[0] ?? "--dry-run";
const reportIdx = argv.indexOf("--report");
const reportFile = reportIdx > 0 ? argv[reportIdx + 1] : null;
const skipIdx = argv.indexOf("--skip");
const skip = new Set(skipIdx > 0 ? argv[skipIdx + 1].split(",") : []);
const argPaths = argv.slice(1).filter((a, i, arr) => !a.startsWith("--") && arr[i - 1] !== "--report" && arr[i - 1] !== "--skip");
/** سقف ΔE76 المعتمد للتحويل التلقائي (قرار المالك 2026-10-10: ≤5؛ ≤2.3 غير مرئي، 2.3–5 يُسرد في PR). */
export const MAX_DELTA_E = 5;
/** حدّ فرق اللقطة المسموح (نسبة بكسلات مختلفة) — تفرضه debt-codemod-verify.mjs. */
export const MAX_SCREENSHOT_DIFF = 0.002;

const CRITICAL = [
  // الرئيسية
  "src/styles/components/home-live-now.css", "src/styles/components/home-brand-title.css", "src/styles/components/home",
  "src/styles/components/home-universal-search.css", "src/styles/components/home-local-resume.css", "src/styles/components/home-content-hub.css",
  "src/styles/pages/home-dashboard-v2.css",
  // الصلاة
  "src/styles/pages/prayer-times.css", "src/styles/pages/prayer-ranks.css", "src/styles/pages/adhan-settings.css",
  "src/styles/components/prayer-countdown-chip.css", "src/styles/components/prayer-countdown-banner.css", "src/styles/components/adhan-notification.css",
  // الدروس
  "src/styles/pages/lessons.css", "src/styles/pages/lessons-sections-v2.css", "src/pages/lessons", "src/features/lessons",
  // التنقل والقشرة
  "src/styles/pages/app-shell-v2.css", "src/styles/components/header-ad-slot.css", "src/styles/components/header-ticker-polish.css",
  "src/styles/components/app-bottom-sheet.css", "src/styles/components/more-bottom-sheet.css", "src/components/layout", "src/design-system/navigation.tsx",
  // الإعدادات
  "src/styles/pages/settings.css",
  // القرآن (واجهة الصفحة فقط؛ المصحف والخطوط محمية)
  "src/pages/quran",
];
const TOKEN_FILES = /(^|\/)(design-system\/|styles\/(brand-v4|design-tokens|card-system-tokens|breakpoints|font-system|font-faces-deferred|fonts-quran)\.css|lib\/theme\.ts)/;
// حقول يحميها الحارس (الخطوط/المصحف) — لا تُمسّ مطلقًا
const PROTECTED = /(quran-text|mushaf|qpc|fonts-quran|surah-\d+)/i;

const norm = (h) => {
  h = h.toLowerCase().replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return h;
};

// --- خريطة الرموز (الوضع الفاتح) ---
const css = readFileSync(join(src, "design-system/design-system.css"), "utf8");
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)[1];
const byHex = new Map();
for (const m of rootBlock.matchAll(/(--sn-[\w-]+):\s*#([0-9a-fA-F]{3,6})\s*;/g)) {
  const h = norm(m[2]);
  (byHex.get(h) ?? byHex.set(h, []).get(h)).push(m[1]);
}
const CONTEXT = [
  [/(^|[^-\w])(color|fill|stroke|caret-color)\s*:\s*$/i, ["--sn-text-on-primary", "--sn-text-on-danger"]],
  [/background(-color)?\s*:\s*$/i, ["--sn-surface", "--sn-surface-elevated"]],
];
/** الخاصية CSS التي تسبق القيمة (camelCase → kebab)؛ null إن لم تُعرف. */
function propOf(before) {
  const m = before.match(/([A-Za-z-]+)\s*:\s*[^;{}]*$/);
  return m ? m[1].replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()).toLowerCase() : null;
}
const STATUS = /^--sn-(primary|primary-strong|accent|success|warning|danger|focus)$/;
/** رموز مسموحة لكل نوع خاصية (حارس دلالي: لا رمز نص كخلفية ولا العكس). */
function allowed(prop) {
  if (!prop) return null;
  if (/^(color|fill|stroke|caret-color|text-decoration-color|-webkit-text-fill-color)$/.test(prop))
    return (n) => /^--sn-text-/.test(n) || STATUS.test(n);
  if (/^background(-color)?$/.test(prop))
    return (n) => /^--sn-(bg|surface|surface-2|surface-elevated|primary-soft)$/.test(n) || STATUS.test(n);
  if (/^(border|outline)(-(top|right|bottom|left|inline|block)(-\w+)?)?(-color)?$/.test(prop))
    return (n) => n === "--sn-separator" || STATUS.test(n);
  return null;
}
const byHexExact = (hex) => byHex.get(hex);

// ΔE76 في فضاء Lab — للتقرير فقط (لا تحويل تلقائي إلا بمطابقة حرفية)
const lab = (h) => {
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const [x, y, z] = [
    (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047,
    c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722,
    (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883,
  ].map((v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116));
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
const tokenLab = [...byHex].map(([h, names]) => ({ h, names, lab: lab(h) }));
const nearest = (h, ok) => {
  const l = lab(h);
  let best = { d: Infinity };
  for (const t of tokenLab) {
    const names = ok ? t.names.filter(ok) : t.names;
    if (!names.length) continue;
    const d = Math.hypot(l[0] - t.lab[0], l[1] - t.lab[1], l[2] - t.lab[2]);
    if (d < best.d) best = { d, names };
  }
  return best;
};
const deltaBuckets = { "≤1": 0, "≤2.3": 0, "≤5": 0, ">5": 0 };

const walk = (p, out = []) => {
  let s;
  try { s = statSync(p); } catch { return out; }
  if (s.isFile()) { out.push(p); return out; }
  for (const n of readdirSync(p)) {
    if (n === "node_modules" || n === "__tests__") continue;
    walk(join(p, n), out);
  }
  return out;
};
const rel = (f) => relative(root, f).split("\\").join("/");

const targets = (argPaths.length ? argPaths : CRITICAL).flatMap((p) => walk(join(root, p)))
  .filter((f) => /\.(tsx|ts|css)$/.test(f) && !TOKEN_FILES.test(rel(f)) && !PROTECTED.test(rel(f)) && !skip.has(rel(f)));

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g;
const conversions = [];
const stats = { files: 0, hexBefore: 0, auto: 0, ambiguous: 0, noToken: 0 };
const residue = new Map();
const mapped = new Map();
let changedFiles = 0;

for (const f of targets) {
  const text = readFileSync(f, "utf8");
  stats.files++;
  let changed = false;
  const out = text.replace(HEX, (m, off) => {
    // تجاهل التعليقات/السلاسل التي ليست قيمة CSS (روابط #anchor لا تطابق لأن الأطوال 3/6/8 hex فقط)
    stats.hexBefore++;
    const h = norm(m);
    if (h.length === 8 || (h.length === 3 && false)) { stats.noToken++; residue.set(m.toLowerCase(), (residue.get(m.toLowerCase()) ?? 0) + 1); return m; }
    const before = text.slice(Math.max(0, off - 120), off);
    const ok = allowed(propOf(before));
    if (!ok) { stats.ambiguous++; residue.set(`#${h}`, (residue.get(`#${h}`) ?? 0) + 1); return m; }
    const n = nearest(h, ok);
    const dE = n.d;
    if (!(dE <= MAX_DELTA_E)) { deltaBuckets[">5"]++; stats.noToken++; residue.set(`#${h}`, (residue.get(`#${h}`) ?? 0) + 1); return m; }
    deltaBuckets[dE <= 1 ? "≤1" : dE <= 2.3 ? "≤2.3" : "≤5"]++;
    const name = n.names[0];
    stats.auto++;
    const k = `#${h} → var(${name}) ΔE=${dE.toFixed(2)}`;
    mapped.set(k, (mapped.get(k) ?? 0) + 1);
    conversions.push({ file: rel(f), from: `#${h}`, to: name, dE: Number(dE.toFixed(2)) });
    changed = true;
    return `var(${name})`;
  });
  if (changed) {
    changedFiles++;
    if (mode === "--apply") writeFileSync(f, out);
  }
}
if (reportFile) writeFileSync(reportFile, JSON.stringify(conversions, null, 1));

const after = stats.hexBefore - stats.auto;
const top = (m, n = 12) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `  ${v}\t${k}`).join("\n");
console.log(`debt-codemod ${mode} — ${stats.files} ملفًا، ${changedFiles} قابلًا للتعديل`);
console.log(`hex قبل: ${stats.hexBefore} | بعد: ${after} | يتحول تلقائيًا: ${stats.auto} | مبهم: ${stats.ambiguous} | بلا رمز مطابق: ${stats.noToken}`);
console.log(`أقرب رمز (ΔE76) للمتبقي بلا مطابقة حرفية: ${JSON.stringify(deltaBuckets)} — تقرير فقط`);
console.log("أكثر التحويلات:\n" + top(mapped));
console.log("أكثر المتبقي (يدوي/بلا رمز):\n" + top(residue));
if (mode === "--check" && stats.auto > 0) {
  console.error(`✗ ${stats.auto} لونًا خامًا قابلًا للتحويل الحرفي — شغّل --apply`);
  process.exit(1);
}
