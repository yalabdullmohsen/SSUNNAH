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
const [mode = "--dry-run", ...argPaths] = process.argv.slice(2);

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
function pick(hex, before) {
  const names = byHex.get(hex);
  if (!names) return null;
  if (names.length === 1) return { name: names[0], how: "unique" };
  for (const [re, prefer] of CONTEXT) {
    if (re.test(before)) {
      const hit = names.find((n) => prefer.includes(n));
      if (hit) return { name: hit, how: "context" };
    }
  }
  return { name: null, how: "ambiguous" };
}

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
const nearest = (h) => {
  const l = lab(h);
  let best = { d: Infinity };
  for (const t of tokenLab) {
    const d = Math.hypot(l[0] - t.lab[0], l[1] - t.lab[1], l[2] - t.lab[2]);
    if (d < best.d) best = { d, name: t.names[0] };
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
  .filter((f) => /\.(tsx|ts|css)$/.test(f) && !TOKEN_FILES.test(rel(f)) && !PROTECTED.test(rel(f)));

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g;
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
    if (h.length === 8) { stats.noToken++; residue.set(m.toLowerCase(), (residue.get(m.toLowerCase()) ?? 0) + 1); return m; }
    const before = text.slice(Math.max(0, off - 40), off);
    const r = pick(h, before);
    if (!r) { const d = nearest(h).d; deltaBuckets[d <= 1 ? "≤1" : d <= 2.3 ? "≤2.3" : d <= 5 ? "≤5" : ">5"]++; stats.noToken++; residue.set(`#${h}`, (residue.get(`#${h}`) ?? 0) + 1); return m; }
    if (!r.name) { stats.ambiguous++; residue.set(`#${h}`, (residue.get(`#${h}`) ?? 0) + 1); return m; }
    stats.auto++;
    const k = `#${h} → var(${r.name})`;
    mapped.set(k, (mapped.get(k) ?? 0) + 1);
    changed = true;
    return `var(${r.name})`;
  });
  if (changed) {
    changedFiles++;
    if (mode === "--apply") writeFileSync(f, out);
  }
}

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
