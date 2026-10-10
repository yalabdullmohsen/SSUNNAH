#!/usr/bin/env node
/**
 * debt-codemod-verify — يقارن بناءين (قبل/بعد) على الصفحات الحرجة فاتحًا وداكنًا:
 *   1) فرق لقطة الشاشة (نسبة البكسلات المختلفة) ≤ MAX_SCREENSHOT_DIFF لكل صفحة×وضع.
 *   2) computed-style لعناصر الصفحة (color/background/border) — عدد العناصر المختلفة.
 * الاستخدام: node scripts/debt-codemod-verify.mjs <distBefore> <distAfter> [--out report.json]
 * يخرج 1 إن تجاوزت أي صفحة الحد (تُطبَّع بـ --skip على الملفات المسؤولة).
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

// الحد مسجَّل في الأداة نفسها (لا استيراد: debt-codemod ينفّذ عند الاستيراد)
const MAX_SCREENSHOT_DIFF = Number(readFileSync(new URL("./debt-codemod.mjs", import.meta.url), "utf8").match(/MAX_SCREENSHOT_DIFF = ([\d.]+)/)[1]);

const [distBefore, distAfter] = process.argv.slice(2);
const outIdx = process.argv.indexOf("--out");
const outFile = outIdx > 0 ? process.argv[outIdx + 1] : null;
export const PAGES = ["/", "/prayer-times", "/prayer-ranks", "/adhan-settings", "/lessons", "/settings", "/more", "/quran", "/prayer-countdown"];
const MODES = ["light", "dark"];
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".webp": "image/webp", ".ico": "image/x-icon" };

function serve(dir) {
  return new Promise((res) => {
    const s = createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let f = join(dir, p);
      if (!existsSync(f) || statSync(f).isDirectory()) f = join(dir, "index.html");
      rsp.writeHead(200, { "content-type": MIME[extname(f)] ?? "application/octet-stream" });
      rsp.end(readFileSync(f));
    }).listen(0, () => res(s));
  });
}

async function shoot(browser, base, path, mode) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: mode, reducedMotion: "reduce", locale: "ar" });
  await ctx.addInitScript((m) => { try { localStorage.setItem("theme", m); localStorage.setItem("mj-theme", m); } catch {} }, mode);
  await ctx.clock.setFixedTime(new Date("2026-10-10T09:00:00Z")); // يثبّت الوقت: عدّادات الصلاة تغيّر البكسلات بين التشغيلين
  await ctx.route(/^(?!http:\/\/127\.0\.0\.1).*/, (r) => r.abort()); // لا شبكة خارجية → حتمية
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: "*{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  const png = await page.screenshot({ fullPage: false });
  const styles = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const c = getComputedStyle(el);
      out.push(`${c.color}|${c.backgroundColor}|${c.borderTopColor}|${c.fill}`);
      if (out.length > 3000) break;
    }
    return out;
  });
  await ctx.close();
  return { png, styles };
}

async function diff(a, b) {
  const [ra, rb] = await Promise.all([a, b].map((x) => sharp(x).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return 1;
  let n = 0;
  for (let i = 0; i < ra.data.length; i += 4) {
    if (Math.abs(ra.data[i] - rb.data[i]) + Math.abs(ra.data[i + 1] - rb.data[i + 1]) + Math.abs(ra.data[i + 2] - rb.data[i + 2]) > 6) n++;
  }
  return n / (ra.data.length / 4);
}

const sb = await serve(distBefore), sa = await serve(distAfter);
const browser = await chromium.launch();
const results = [];
let fail = 0;
for (const mode of MODES) for (const path of PAGES) {
  const A = await shoot(browser, `http://127.0.0.1:${sb.address().port}`, path, mode);
  const B = await shoot(browser, `http://127.0.0.1:${sa.address().port}`, path, mode);
  const d = await diff(A.png, B.png);
  let styleDiff = 0;
  const len = Math.min(A.styles.length, B.styles.length);
  for (let i = 0; i < len; i++) if (A.styles[i] !== B.styles[i]) styleDiff++;
  const ok = d <= MAX_SCREENSHOT_DIFF;
  if (!ok) fail++;
  results.push({ path, mode, pixelDiff: Number(d.toFixed(5)), styleDiff, styleTotal: len, ok });
  console.log(`${ok ? "✓" : "✗"} ${mode} ${path} px=${(d * 100).toFixed(3)}% style=${styleDiff}/${len}`);
}
await browser.close();
sb.close(); sa.close();
if (outFile) writeFileSync(outFile, JSON.stringify({ limit: MAX_SCREENSHOT_DIFF, results }, null, 1));
console.log(fail ? `✗ ${fail} صفحة تتجاوز الحد ${MAX_SCREENSHOT_DIFF * 100}%` : `✓ كل الصفحات ضمن الحد ${MAX_SCREENSHOT_DIFF * 100}%`);
process.exit(fail ? 1 : 0);
