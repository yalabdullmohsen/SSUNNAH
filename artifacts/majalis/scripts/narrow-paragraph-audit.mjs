#!/usr/bin/env node
/**
 * يقيس أضيق فقرة داخل كل بطاقة مفتوحة في أعلى الصفحات (390×844، فاتح وداكن).
 * يفشل إن قلّ عرض الفقرة عن MIN_RATIO من عرض الشاشة (بعد استبعاد عناصر الأيقونات).
 * BASE_URL=http://localhost:4599 node scripts/narrow-paragraph-audit.mjs [--report]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "https://www.ssunnah.com";
const MIN_RATIO = Number(process.env.MIN_RATIO || 0.45);
const REPORT_ONLY = process.argv.includes("--report");
const PAGES = ["/", "/quran", "/lessons", "/adhkar", "/settings", "/glossary", "/seerah", "/hadith-science"];
const OPENERS = [".hs-card__header", ".gl-term__head", "[aria-expanded='false']"];

const b = await chromium.launch();
const rows = [];
for (const scheme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  for (const path of PAGES) {
    const p = await ctx.newPage();
    try {
      await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
      await p.waitForTimeout(2500);
      for (const sel of OPENERS) {
        const n = Math.min(await p.locator(sel).count(), 3);
        for (let i = 0; i < n; i++) await p.locator(sel).nth(i).evaluate((e) => e.click()).catch(() => {});
      }
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const vw = innerWidth;
        let min = null;
        for (const el of document.querySelectorAll("main p, main li, [class*='card'] p, [class*='term'] p")) {
          const t = (el.textContent || "").trim();
          if (t.length < 40) continue;
          const bb = el.getBoundingClientRect();
          if (!bb.width || !bb.height || getComputedStyle(el).display === "none") continue;
          if (!min || bb.width < min.w) min = { w: Math.round(bb.width), cls: String(el.className).slice(0, 40) || el.tagName };
        }
        return { vw, min };
      });
      rows.push({ scheme, path, ...r });
    } catch (e) {
      rows.push({ scheme, path, error: String(e).slice(0, 80) });
    }
    await p.close();
  }
  await ctx.close();
}
await b.close();

let bad = 0;
for (const r of rows) {
  if (r.error) { console.log(`${r.scheme}\t${r.path}\tERR ${r.error}`); continue; }
  const ok = !r.min || r.min.w / r.vw >= MIN_RATIO;
  if (!ok) bad++;
  console.log(`${r.scheme}\t${r.path}\t${r.min ? r.min.w + "px" : "-"}\t${r.min ? r.min.cls : ""}\t${ok ? "ok" : "NARROW"}`);
}
if (bad && !REPORT_ONLY) { console.error(`narrow-paragraph-audit: ${bad} narrow`); process.exit(1); }
console.log("narrow-paragraph-audit: done");
