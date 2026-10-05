#!/usr/bin/env node
/**
 * أدلة تشغيلية لإغلاق مسارات PARTIAL في ROUTE_DEBT_FULL_CLASSIFICATION (Chromium headless):
 *   - axe-core WCAG 2.1 A/AA نهارًا وليلًا (الحالة الأولى + حالات تبويب/حوار)
 *   - مشي Tab: كل محطة تركيز تُظهر تغيّرًا مرئيًا (outline/shadow/border/bg/underline)
 *   - Reflow: لا تمرير أفقي عند 768px · 640px (zoom 200%) · 320px · نص 200%
 *   - Startup CLS (layout-shift) على 390×844
 * ليست شهادة جهاز: Keyboard/Contrast/StartupCLS/RTL على أجهزة فعلية تبقى DEVICE_REQUIRED.
 *
 * تشغيل (على build معاينة؛ يُفضّل CI):
 *   pnpm exec vite build && pnpm exec vite preview --port 4173 &
 *   BASE=http://127.0.0.1:4173 node scripts/audit-route-partial-closure.mjs
 * يكتب docs/audit/ROUTE_PARTIAL_CLOSURE_EVIDENCE.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(majalisRoot, "../..");
const require = createRequire(import.meta.url);
const axePath = createRequire(require.resolve("eslint-plugin-jsx-a11y/package.json")).resolve(
  "axe-core/axe.min.js",
);
const axeSrc = readFileSync(axePath, "utf8");
const axeVersion = JSON.parse(readFileSync(resolve(dirname(axePath), "package.json"), "utf8")).version;

const BASE = (process.env.BASE || "http://127.0.0.1:4173").replace(/\/$/, "");
export const ROUTES = [
  "/settings",
  "/login",
  "/register",
  "/about",
  "/privacy",
  "/terms",
  "/prophets",
  "/tasbih",
  "/adhan-help",
];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** حالات تفاعلية إضافية تُفحص بـ axe بعد الخطوة */
const STATES = {
  "/prophets": ["الخط الزمني", "أولو العزم", "المعجزات", "مقارنة", "اختبر نفسك"].map((name) => ({
    label: `tab:${name}`,
    run: (p) => p.getByRole("tab", { name }).click(),
  })),
  "/tasbih": [{ label: "delete-confirm", run: (p) => p.locator(".tasbih-actions-grid button").first().click() }],
  "/login": [{ label: "forgot", run: async (p) => {
    // الزر يظهر فقط حين تكون المصادقة مفعّلة (متغيرات Supabase) — بلاها تُفحص حالة الدخول فقط
    const forgot = p.getByRole("button", { name: "نسيت كلمة المرور؟" });
    if (await forgot.count()) await forgot.click();
  } }],
};

const browser = await chromium.launch();

async function open(route, { theme = "light", viewport = { width: 390, height: 844 }, init } = {}) {
  const ctx = await browser.newContext({ viewport, locale: "ar-KW", serviceWorkers: "block" });
  // لا اتصال بخلفية Supabase أثناء الفحص — الصفحات تعرض حالة الزائر
  await ctx.route(/supabase\.co/, (r) => r.abort());
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("majalis-theme", t);
    } catch {
      /* ignore */
    }
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* ignore */
    }
  }, theme);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(3500);
  return { ctx, page };
}

async function axe(page) {
  await page.addScriptTag({ content: axeSrc });
  return page.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags } });
    return r.violations.map((v) => ({ id: v.id, nodes: v.nodes.length, sample: v.nodes[0]?.target.join(" ") }));
  }, AXE_TAGS);
}

async function focusWalk(page) {
  let stops = 0;
  const noVisibleFocus = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab");
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const sig = (e) => {
        const c = getComputedStyle(e);
        return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor, c.textDecorationLine].join("|");
      };
      const focused = sig(el);
      el.blur();
      const blurred = sig(el);
      el.focus({ preventScroll: true });
      const label = `${el.tagName.toLowerCase()}|${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}`;
      return { same: focused === blurred, label };
    });
    if (!r) break;
    stops += 1;
    if (r.same) noVisibleFocus.push(r.label);
  }
  return { stops, noVisibleFocus };
}

async function reflow(route) {
  const out = {};
  const modes = {
    tablet768: { viewport: { width: 768, height: 1024 } },
    zoom200_640: { viewport: { width: 640, height: 400 } },
    reflow320: { viewport: { width: 320, height: 640 } },
    largeText200: {
      viewport: { width: 390, height: 844 },
      init: () =>
        document.addEventListener("DOMContentLoaded", () => {
          const s = document.createElement("style");
          s.textContent = "html{font-size:200% !important}";
          document.head.appendChild(s);
        }),
    },
  };
  for (const [label, opts] of Object.entries(modes)) {
    const { ctx, page } = await open(route, opts);
    out[label] = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await ctx.close();
  }
  return out;
}

const routes = {};
for (const route of ROUTES) {
  const r = { axe: {}, focus: {}, states: {} };
  for (const theme of ["light", "dark"]) {
    const { ctx, page } = await open(route, { theme });
    if (theme === "light") r.startupCls = Number((await page.evaluate(() => window.__cls)).toFixed(4));
    r.axe[theme] = await axe(page);
    await ctx.close();

    const desk = await open(route, { theme, viewport: { width: 1280, height: 900 } });
    r.focus[theme] = await focusWalk(desk.page);
    await desk.ctx.close();

    for (const st of STATES[route] ?? []) {
      const s = await open(route, { theme });
      await st.run(s.page);
      await s.page.waitForTimeout(800);
      r.states[`${theme}:${st.label}`] = await axe(s.page);
      await s.ctx.close();
    }
  }
  r.reflow = await reflow(route);
  routes[route] = r;
  console.error(`audited ${route}`);
}
await browser.close();

let sha = "unknown";
try {
  sha = execSync("git rev-parse --short=12 HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
} catch {
  /* ignore */
}
const out = {
  generatedAt: new Date().toISOString(),
  baseSha: sha,
  base: BASE,
  tool: `scripts/audit-route-partial-closure.mjs · Chromium headless · axe-core ${axeVersion} (${AXE_TAGS.join(",")})`,
  scope: "Repository-side closure of QM a11y/responsive PARTIAL fields. Not a physical-device certification.",
  routes,
};
writeFileSync(resolve(repoRoot, "docs/audit/ROUTE_PARTIAL_CLOSURE_EVIDENCE.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log("wrote docs/audit/ROUTE_PARTIAL_CLOSURE_EVIDENCE.json");
