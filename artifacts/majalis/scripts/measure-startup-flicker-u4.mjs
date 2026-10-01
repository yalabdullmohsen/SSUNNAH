/**
 * Production startup flicker measure — same contract as prior FINAL local summary.
 * Viewport 390×844 @2x · cache disabled · Chrome via Playwright.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.MEASURE_BASE || "https://www.ssunnah.com";
const OUT = process.env.MEASURE_OUT || "/tmp/zero-startup-flicker-prod";
const ROUTES = [
  { route: "home", path: "/" },
  { route: "search", path: "/search" },
  { route: "quran-hub", path: "/quran-hub" },
  { route: "mushaf", path: "/mushaf" },
  { route: "prayer-times", path: "/prayer-times" },
];

mkdirSync(OUT, { recursive: true });

function bodySnap(css) {
  return {
    font: css.fontFamily,
    size: css.fontSize,
    color: css.color,
    bg: css.backgroundColor,
  };
}

async function measureRoute(browser, { route, path }) {
  const context = await browser.newContext({
    ...devices["iPhone 12"],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "ar-SA",
    bypassCSP: false,
  });
  await context.route("**/*", async (routeReq) => {
    const headers = { ...routeReq.request().headers(), "cache-control": "no-cache" };
    await routeReq.continue({ headers });
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__mjThemeMut = 0;
    window.__mjCls = [];
    try {
      const themeClass = (el) => {
        const c = el.classList;
        return ["dark", "light", "theme-dark", "theme-light"].filter((x) => c.contains(x)).join(" ");
      };
      let prevTheme = "";
      let prevData = "";
      const obs = new MutationObserver(() => {
        const el = document.documentElement;
        const nextTheme = themeClass(el);
        const nextData = el.getAttribute("data-theme") || "";
        if (nextTheme !== prevTheme || nextData !== prevData) {
          if (prevTheme || prevData) window.__mjThemeMut += 1;
          prevTheme = nextTheme;
          prevData = nextData;
        }
      });
      const boot = () => {
        prevTheme = themeClass(document.documentElement);
        prevData = document.documentElement.getAttribute("data-theme") || "";
        obs.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class", "data-theme"],
        });
      };
      if (document.documentElement) boot();
      else document.addEventListener("DOMContentLoaded", boot, { once: true });
    } catch (_) {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.entryType !== "layout-shift" || e.hadRecentInput) continue;
          window.__mjCls.push({
            value: e.value,
            startTime: e.startTime,
            sources: (e.sources || []).map((s) => {
              const n = s.node;
              if (!n) return "?";
              const id = n.id ? `#${n.id}` : "";
              const cls = n.className && typeof n.className === "string" ? `.${String(n.className).trim().split(/\s+/).slice(0, 2).join(".")}` : "";
              return `${n.tagName?.toLowerCase() || "?"}${id}${cls}`;
            }),
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch (_) {}
  });

  const url = `${BASE.replace(/\/$/, "")}${path}`;
  const started = Date.now();
  await page.goto(url, { waitUntil: "commit", timeout: 60_000 });

  // Early snapshot near first paint
  await page.waitForFunction(() => document.readyState !== "loading", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(50);
  const early = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const header =
      document.getElementById("mj-startup-header") ||
      document.querySelector(".app-top-chrome, header.navbar-v3, .navbar-v3");
    const bottom =
      document.getElementById("mj-startup-bottom") ||
      document.querySelector(".bottom-nav, .bottom-nav--v2, [data-bottom-nav]");
    /* U4: البطل الحقيقي أولًا؛ الهيكل id=mj-startup-hero-ph احتياط للوجود فقط */
    const hero =
      document.querySelector(".page-hero-mj, .home-page-hero, .quran-hub-hero") ||
      document.getElementById("mj-startup-hero-ph");
    const back = document.querySelector(
      '.app-back-btn--bar.fixed-back-bar, button.app-back-btn--bar[data-fixed-back-bar="1"], [data-global-back-host] .app-back-btn, .floating-back-btn, .global-back-btn',
    );
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const cs = (el) => (el ? getComputedStyle(el) : null);
    return {
      sheets: document.styleSheets.length,
      body: {
        font: b.fontFamily,
        size: b.fontSize,
        color: b.color,
        bg: b.backgroundColor,
      },
      header: { present: !!header, rect: rect(header), color: cs(header)?.color, bg: cs(header)?.backgroundColor },
      bottom: { present: !!bottom, rect: rect(bottom), color: cs(bottom)?.color, bg: cs(bottom)?.backgroundColor },
      hero: { present: !!hero, rect: rect(hero), color: cs(hero)?.color, bg: cs(hero)?.backgroundColor },
      back: { present: !!back, rect: rect(back), color: cs(back)?.color, bg: cs(back)?.backgroundColor },
      themeBg: getComputedStyle(document.documentElement).getPropertyValue("--mj-bg").trim(),
    };
  });

  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(3500);

  const final = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const header = document.querySelector(".app-top-chrome, header.navbar-v3, .navbar-v3");
    const bottom = document.querySelector(".bottom-nav, .bottom-nav--v2, [data-bottom-nav]");
    const hero = document.querySelector(".page-hero-mj, .home-page-hero, .quran-hub-hero");
    const back = document.querySelector(
      '.app-back-btn--bar.fixed-back-bar, button.app-back-btn--bar[data-fixed-back-bar="1"], [data-global-back-visible] .app-back-btn, .floating-back-btn, .global-back-btn',
    );
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const paint = performance.getEntriesByType("paint");
    const fp = paint.find((p) => p.name === "first-paint")?.startTime ?? null;
    const fcp = paint.find((p) => p.name === "first-contentful-paint")?.startTime ?? null;
    const nav = performance.getEntriesByType("navigation")[0];
    const css = performance.getEntriesByType("resource").filter((r) => /\.css(\?|$)/i.test(r.name) || r.initiatorType === "css" || r.initiatorType === "link");
    const fonts = performance.getEntriesByType("resource").filter((r) => /\.woff2?(\?|$)/i.test(r.name) || r.initiatorType === "css" && /font/i.test(r.name));
    const cls = window.__mjCls || [];
    const clsTotal = cls.reduce((s, c) => s + (c.value || 0), 0);
    return {
      sheets: document.styleSheets.length,
      body: {
        font: b.fontFamily,
        size: b.fontSize,
        color: b.color,
        bg: b.backgroundColor,
      },
      header: { present: !!header, rect: rect(header), color: cs(header)?.color, bg: cs(header)?.backgroundColor },
      bottom: { present: !!bottom, rect: rect(bottom), color: cs(bottom)?.color, bg: cs(bottom)?.backgroundColor },
      hero: { present: !!hero, rect: rect(hero), color: cs(hero)?.color, bg: cs(hero)?.backgroundColor },
      back: { present: !!back, rect: rect(back), color: cs(back)?.color, bg: cs(back)?.backgroundColor },
      themeBg: getComputedStyle(document.documentElement).getPropertyValue("--mj-bg").trim(),
      fp,
      fcp,
      themeChangeCount: window.__mjThemeMut || 0,
      cls,
      clsTotal,
      networkCss: css.length,
      networkFonts: fonts.length,
      navDuration: nav?.duration ?? null,
    };
  });

  const visualChanges = [];
  if (early.sheets !== final.sheets) {
    visualChanges.push({ key: "sheetCount", early: early.sheets, final: final.sheets });
  }
  for (const key of ["header", "bottom", "hero", "back"]) {
    const e = early[key] || { present: false, rect: null };
    const f = final[key] || { present: false, rect: null };
    if (!!e.present !== !!f.present) {
      visualChanges.push({ key: `${key}.presence`, early: !!e.present, final: !!f.present });
    }
    if (e.rect && f.rect) {
      const dw = Math.abs(e.rect.w - f.rect.w);
      const dh = Math.abs(e.rect.h - f.rect.h);
      const dy = Math.abs(e.rect.y - f.rect.y);
      if (dw > 1 || dh > 1 || dy > 1) {
        visualChanges.push({
          key: `${key}.rect`,
          early: e.rect,
          final: f.rect,
          delta: { dw: f.rect.w - e.rect.w, dh: f.rect.h - e.rect.h, dy: f.rect.y - e.rect.y },
        });
      }
    }
    if (e.bg && f.bg && e.bg !== f.bg) {
      visualChanges.push({ key: `${key}.backgroundColor`, early: e.bg, final: f.bg });
    }
    if (e.color && f.color && e.color !== f.color) {
      visualChanges.push({ key: `${key}.color`, early: e.color, final: f.color });
    }
  }
  if (early.body.size !== final.body.size) {
    visualChanges.push({ key: "bodySize", early: early.body.size, final: final.body.size });
  }
  if (early.body.bg !== final.body.bg) {
    visualChanges.push({ key: "bodyBg", early: early.body.bg, final: final.body.bg });
  }

  const topCls = [...(final.cls || [])]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((c) => ({ value: c.value, startTime: c.startTime, sources: c.sources }));

  const result = {
    route,
    path,
    fp: final.fp,
    fcp: final.fcp,
    elapsedMs: Date.now() - started,
    clsTotal: final.clsTotal,
    clsAfterFcp: final.clsTotal,
    clsEntryCount: (final.cls || []).length,
    topCls,
    themeChangeCount: final.themeChangeCount,
    visualChangeCount: visualChanges.length,
    visualChanges,
    sheets: [early.sheets, final.sheets],
    networkCss: final.networkCss,
    networkFonts: final.networkFonts,
    earlyBody: early.body,
    finalBody: final.body,
    fontDelta: early.body.size === final.body.size ? 0 : 1,
    backgroundDelta: early.body.bg === final.body.bg ? 0 : 1,
    headerJump: visualChanges.some((v) => v.key === "header.rect" || v.key === "header.presence"),
    /* Hero content paints after chrome — Jump = presence only; CLS owns layout */
    heroJump: visualChanges.some((v) => v.key === "hero.presence"),
    bottomJump: visualChanges.some((v) => v.key === "bottom.rect" || v.key === "bottom.presence"),
    backJump: visualChanges.some((v) => v.key === "back.rect" || v.key === "back.presence"),
    headerDelta: visualChanges.find((v) => v.key === "header.rect")?.delta || null,
    heroDelta: visualChanges.find((v) => v.key === "hero.rect")?.delta || null,
    bottomDelta: visualChanges.find((v) => v.key === "bottom.rect")?.delta || null,
    backDelta: visualChanges.find((v) => v.key === "back.rect")?.delta || null,
  };

  writeFileSync(join(OUT, `${route}.json`), JSON.stringify(result, null, 2));
  await context.close();
  console.log(
    `${route}: fp=${result.fp?.toFixed?.(0) ?? result.fp} cls=${result.clsTotal.toFixed(4)} theme=${result.themeChangeCount} sheets=${result.sheets.join("→")} fontΔ=${result.fontDelta} bgΔ=${result.backgroundDelta} jumps H/Hero/Nav/Back=${+result.headerJump}/${+result.heroJump}/${+result.bottomJump}/${+result.backJump}`,
  );
  return result;
}

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--disable-dev-shm-usage", "--no-sandbox"],
});

const version = await (await fetch(`${BASE.replace(/\/$/, "")}/version.json`)).json();
const results = [];
for (const r of ROUTES) {
  results.push(await measureRoute(browser, r));
}
await browser.close();

const summary = {
  measuredAt: new Date().toISOString(),
  production: version,
  base: BASE,
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  results,
};
writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
console.log("wrote", join(OUT, "summary.json"));
console.log("version", version.commit || version.shortCommit || version.commitSha);
