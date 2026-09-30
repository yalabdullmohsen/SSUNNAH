/**
 * Measure Amiri vs MajlisAmiriFallback metrics; pick size-adjust minimizing width delta.
 * Usage (from artifacts/majalis): node scripts/measure-ui-fallback-metrics.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const samples = [
  "بسم الله الرحمن الرحيم",
  "سُنّة — منصة علمية",
  "الصلاة · الدروس · القرآن",
  "دخول",
  "الرئيسية",
];
const fontSizePx = 17;
const candidates = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

const amiriB64 = readFileSync(resolve(root, "public/fonts/ui/amiri-400-ar.woff2")).toString("base64");
const amiriDataUrl = `data:font/woff2;base64,${amiriB64}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("about:blank");

const result = await page.evaluate(
  async ({ amiriDataUrl, samples, fontSizePx, candidates }) => {
    const face = new FontFace("AmiriMeasure", `url(${amiriDataUrl})`, { style: "normal", weight: "400" });
    await face.load();
    document.fonts.add(face);

    const measure = (fontFamily, text) => {
      const el = document.createElement("span");
      el.textContent = text;
      el.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;font-size:${fontSizePx}px;line-height:1.7;font-family:${fontFamily};font-weight:400;`;
      document.body.appendChild(el);
      const r = el.getBoundingClientRect();
      el.remove();
      return { w: r.width, h: r.height };
    };

    const amiri = {};
    for (const t of samples) amiri[t] = measure('"AmiriMeasure"', t);

    const byAdjust = {};
    for (const adj of candidates) {
      const name = `Fb${adj}`;
      const style = document.createElement("style");
      style.textContent = `@font-face{font-family:"${name}";src:local("Noto Naskh Arabic"),local("Geeza Pro"),local("Traditional Arabic"),local("Arial");size-adjust:${adj}%;ascent-override:95%;descent-override:25%;line-gap-override:0%;}`;
      document.head.appendChild(style);
      await document.fonts.ready;
      const rows = {};
      let sumAbs = 0;
      for (const t of samples) {
        const m = measure(`"${name}"`, t);
        rows[t] = m;
        sumAbs += Math.abs(m.w - amiri[t].w);
      }
      byAdjust[adj] = { rows, sumAbsWidthDelta: sumAbs };
    }

    let best = candidates[0];
    let bestScore = Infinity;
    for (const adj of candidates) {
      const s = byAdjust[adj].sumAbsWidthDelta;
      if (s < bestScore) {
        bestScore = s;
        best = adj;
      }
    }

    return {
      fontSizePx,
      amiriAvailable: document.fonts.check(`400 ${fontSizePx}px AmiriMeasure`),
      amiri,
      byAdjust,
      bestSizeAdjustPercent: best,
      bestSumAbsWidthDelta: bestScore,
      baseline105: byAdjust[105]?.sumAbsWidthDelta ?? null,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
  },
  { amiriDataUrl, samples, fontSizePx, candidates },
);

await browser.close();

const out = {
  measuredAt: new Date().toISOString(),
  ...result,
  recommendation: {
    sizeAdjustPercent: result.bestSizeAdjustPercent,
    note: `Prefer ${result.bestSizeAdjustPercent}% over 105% (lower width delta)`,
  },
};

mkdirSync(resolve(root, "reports"), { recursive: true });
const outPath = resolve(root, "reports/ui-fallback-metrics.json");
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify({ outPath, best: out.bestSizeAdjustPercent, delta: out.bestSumAbsWidthDelta, baseline105: out.baseline105 }, null, 2));
