/**
 * لقطات بعد إعادة التصميم — شغّل مع خادم محلي على :24216
 * من جذر المستودع:
 *   cd artifacts/majalis && HOME_URL=http://127.0.0.1:24216/ node ../../docs/ux/homepage-redesign/capture.mjs
 */
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const majalisPkg = resolve(here, "../../../artifacts/majalis/package.json");
const require = createRequire(majalisPkg);
const { chromium } = require("playwright");

const outDir = here;
mkdirSync(outDir, { recursive: true });
const base = process.env.HOME_URL || "http://127.0.0.1:24216/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  locale: "ar-SA",
});
await page.goto(base, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1200);
await page.screenshot({
  path: resolve(outDir, "after-above-fold.png"),
  fullPage: false,
});
await page.evaluate(() => window.scrollBy(0, 520));
await page.waitForTimeout(400);
await page.screenshot({
  path: resolve(outDir, "after-daily-sections.png"),
  fullPage: false,
});
await browser.close();
console.log("screenshots written to", outDir);
