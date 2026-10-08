#!/usr/bin/env node
/**
 * بوابة axe-core (WCAG 2.1 A/AA) للصفحات الرئيسية — Playwright Chromium على مقاس الجوال.
 *
 * سياسة خط الأساس: المخالفات القائمة مسجّلة في config/a11y-axe-baseline.json ولا تُفشل الفحص.
 * يفشل الفحص فقط عند الأسوأ:
 *   - قاعدة axe جديدة لم تكن في خط الأساس لتلك الصفحة/الوضع، أو
 *   - زيادة عدد العناصر المخالفة لقاعدة قائمة بأكثر من NODE_TOLERANCE.
 * التحسّن يُطبع كتنبيه لتضييق خط الأساس (--update).
 *
 * axe-core من الشجرة القائمة (عبر eslint-plugin-jsx-a11y) — نفس نمط audit-route-partial-closure.mjs.
 *
 * تشغيل (على build معاينة):
 *   pnpm exec vite preview --port 24216 &
 *   BASE=http://127.0.0.1:24216 node scripts/a11y-axe-gate.mjs            # فحص
 *   BASE=http://127.0.0.1:24216 node scripts/a11y-axe-gate.mjs --update   # إعادة كتابة خط الأساس
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = resolve(majalisRoot, "config/a11y-axe-baseline.json");
const REPORT_PATH = resolve(majalisRoot, "test-results/a11y-axe/report.json");
const require = createRequire(import.meta.url);
const axePath = createRequire(
  require.resolve("eslint-plugin-jsx-a11y/package.json"),
).resolve("axe-core/axe.min.js");
const axeSrc = readFileSync(axePath, "utf8");
const axeVersion = JSON.parse(
  readFileSync(resolve(dirname(axePath), "package.json"), "utf8"),
).version;

const BASE = (process.env.BASE || "http://127.0.0.1:24216").replace(/\/$/, "");
const UPDATE = process.argv.includes("--update");
const NODE_TOLERANCE = 2;

export const ROUTES = [
  "/",
  "/quran",
  "/hadith",
  "/sections",
  "/search",
  "/adhkar",
  "/prayer-times",
  "/login",
];
const THEMES = ["light", "dark"];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// CHROME_PATH اختياري (مثل lhci-home) — وإلا متصفح Playwright المثبّت
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);

async function scan(route, theme) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "ar-KW",
    timezoneId: "Asia/Kuwait",
    serviceWorkers: "block",
    // حتمية: بلا حركة → لا يقرأ axe ألوانًا وسيطة أثناء انتقال الثيم
    reducedMotion: "reduce",
  });
  // لا اتصال بخلفية Supabase أثناء الفحص — الصفحات تعرض حالة الزائر (حتمية)
  await ctx.route(/supabase\.co/, (r) => r.abort());
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("majalis-theme", t);
    } catch {
      /* ignore */
    }
  }, theme);
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(3500);
    // انتظار فعلي: الثيم المطلوب مُطبَّق على الجذر، ثم تعطيل الانتقالات وانتهاء الرسوم المحدودة
    await page.waitForFunction(
      (t) => document.documentElement.dataset.theme === t,
      theme,
      { timeout: 15_000 },
    );
    await page.addStyleTag({
      content:
        "*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important}",
    });
    await page.waitForFunction(
      () =>
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState === "finished" ||
              a.effect?.getComputedTiming().iterations === Infinity,
          ),
      undefined,
      { timeout: 15_000 },
    );
    await page.addScriptTag({ content: axeSrc });
    const violations = await page.evaluate(async (tags) => {
      const r = await window.axe.run(document, {
        runOnly: { type: "tag", values: tags },
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        sample: v.nodes[0]?.target.join(" "),
      }));
    }, AXE_TAGS);
    return violations.sort((a, b) => a.id.localeCompare(b.id));
  } finally {
    await ctx.close();
  }
}

const current = {};
for (const route of ROUTES) {
  current[route] = {};
  for (const theme of THEMES) {
    current[route][theme] = await scan(route, theme);
  }
}
await browser.close();

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(
  REPORT_PATH,
  JSON.stringify({ axeVersion, base: BASE, current }, null, 2) + "\n",
);

const toCounts = (violations) =>
  Object.fromEntries(violations.map((v) => [v.id, v.nodes]));

if (UPDATE) {
  const pages = {};
  for (const route of ROUTES) {
    pages[route] = {};
    for (const theme of THEMES)
      pages[route][theme] = toCounts(current[route][theme]);
  }
  const out = {
    $comment:
      "خط أساس axe — مخالفات قائمة لا تُفشل الفحص. يُولَّد بـ: node scripts/a11y-axe-gate.mjs --update",
    axeVersion,
    tags: AXE_TAGS,
    viewport: "390x844 mobile",
    nodeTolerance: NODE_TOLERANCE,
    pages,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`خط الأساس كُتب: ${BASELINE_PATH}`);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(`لا خط أساس في ${BASELINE_PATH} — شغّل مع --update`);
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));

const regressions = [];
const improvements = [];
let totalNodes = 0;
let totalRules = 0;
const rows = [];
for (const route of ROUTES) {
  for (const theme of THEMES) {
    const base = baseline.pages?.[route]?.[theme] ?? {};
    const now = toCounts(current[route][theme]);
    const nodes = Object.values(now).reduce((s, n) => s + n, 0);
    totalNodes += nodes;
    totalRules += Object.keys(now).length;
    rows.push(
      `| ${route} | ${theme} | ${Object.keys(now).length} | ${nodes} | ${Object.keys(now).join(", ") || "—"} |`,
    );
    for (const [id, n] of Object.entries(now)) {
      const sample = current[route][theme].find((v) => v.id === id)?.sample;
      if (!(id in base))
        regressions.push(
          `${route} [${theme}] قاعدة جديدة ${id} (${n} عنصر) مثال: ${sample}`,
        );
      else if (n > base[id] + NODE_TOLERANCE)
        regressions.push(
          `${route} [${theme}] ${id}: ${base[id]} → ${n} عنصر مثال: ${sample}`,
        );
    }
    for (const [id, n] of Object.entries(base)) {
      const m = now[id] ?? 0;
      if (m < n) improvements.push(`${route} [${theme}] ${id}: ${n} → ${m}`);
    }
  }
}

const summary = [
  `### axe-core ${axeVersion} — WCAG 2.1 A/AA (390×844، فاتح/داكن)`,
  "",
  "| الصفحة | الوضع | قواعد مخالَفة | عناصر | القواعد |",
  "|---|---|---|---|---|",
  ...rows,
  "",
  `**الإجمالي:** ${totalRules} مخالفة قاعدة · ${totalNodes} عنصر — ${regressions.length} تراجع عن خط الأساس.`,
  ...(regressions.length
    ? ["", "**تراجعات (تُفشل الفحص):**", ...regressions.map((r) => `- ${r}`)]
    : []),
  ...(improvements.length
    ? [
        "",
        "**تحسّنات (حدّث خط الأساس بـ --update لتثبيتها):**",
        ...improvements.map((r) => `- ${r}`),
      ]
    : []),
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n", { flag: "a" });

if (regressions.length) {
  console.error(
    `\n✗ ${regressions.length} تراجع في إمكانية الوصول عن خط الأساس.`,
  );
  process.exit(1);
}
console.log("\n✓ لا تراجع عن خط أساس axe.");
