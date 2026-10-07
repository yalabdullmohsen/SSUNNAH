/**
 * device-compat-matrix.spec.ts — مصفوفة توافق الأجهزة (خارج المسار الإلزامي).
 *
 * يفحص كل أقسام التطبيق العامة (مشتقّة من sections.registry.ts) + صفحة تفصيل
 * لكل قسم، على مصفوفة أحجام (من Galaxy Fold 280px حتى 1920px) بالوضعين
 * الفاتح والداكن، وبتكبير نص 200% على 360 و393.
 *
 * التشغيل (بعد build + vite preview):
 *   PLAYWRIGHT_BASE_URL=http://localhost:4231 pnpm exec playwright test \
 *     tests/device-compat-matrix.spec.ts --project=desktop --workers=8 --fully-parallel --retries=0
 *
 * مخرجات تفصيلية JSON في test-results/device-compat/ (أو DEVICE_COMPAT_OUT).
 * يفشل الاختبار فقط على التمرير الأفقي على مستوى الصفحة وعلى الوسائط التي
 * تتجاوز عرض الشاشة؛ بقية الكواشف تُسجَّل للتقرير (docs/qa/DEVICE_COMPAT_MATRIX.md).
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

type Vp = { name: string; width: number; height: number; textScale?: number };

export const DEVICE_MATRIX: Vp[] = [
  { name: "fold-280", width: 280, height: 653 },
  { name: "se1-320", width: 320, height: 568 },
  { name: "android-360", width: 360, height: 800 },
  { name: "iphone8-375", width: 375, height: 667 },
  { name: "iphone15-393", width: 393, height: 852 },
  { name: "promax-430", width: 430, height: 932 },
  { name: "ipad-split-507", width: 507, height: 1024 },
  { name: "ipad-split-678", width: 678, height: 1024 },
  { name: "ipad-768", width: 768, height: 1024 },
  { name: "ipad-land-1024", width: 1024, height: 768 },
  { name: "ipadpro-1024", width: 1024, height: 1366 },
  { name: "phone-land-852", width: 852, height: 393 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

export const TEXT_SCALE_MATRIX: Vp[] = [
  { name: "android-360-text200", width: 360, height: 800, textScale: 2 },
  { name: "iphone15-393-text200", width: 393, height: 852, textScale: 2 },
];

/** صفحات حسابية/قانونية/أدوات لا تُعدّ «أقسامًا» — تُستثنى لتقليل الزمن. */
const EXCLUDED_HUBS = new Set([
  "/privacy", "/terms", "/delete-account", "/data-licenses", "/notification-settings",
  "/adhan-settings", "/settings", "/support", "/stats", "/assistant", "/my-learning",
  "/fatwa-policy", "/sources", "/methodology",
]);

/** صفحة تفصيل واحدة لكل قسم له تفاصيل (مأخوذة من public/sitemap.xml). */
export const DETAIL_ROUTES = [
  "/hadith/sahih",
  "/miracles/quran",
  "/fiqh/usul",
  "/scholars/malik",
  "/lessons/kw-othman-tafsir-nahl-0",
  "/annual-courses/course-ijazah-tahrir-2026",
  "/tarikh-islami/seerah-taif",
  "/tawhid/tawhid-issues",
  "/nations/qawm-nuh",
  "/sins-and-rights/tark-salah",
  "/adhkar/morning",
  "/prophets/tree",
  "/quran/surah-stories",
];

export function deriveHubRoutes(): string[] {
  const file = path.resolve(HERE, "../src/config/sections.registry.ts");
  const src = fs.readFileSync(file, "utf8");
  const routes = new Set<string>();
  for (const m of src.matchAll(/route:\s*"(\/[^"#?]*)"/g)) routes.add(m[1]);
  return [...routes]
    .filter((r) => !EXCLUDED_HUBS.has(r))
    // الأقسام الفرعية العميقة تُمثَّل بصفحات التفصيل؛ نُبقي العمق ≤ 2 مقاطع.
    .filter((r) => r.split("/").filter(Boolean).length <= 1 || r === "/discover-islam/new-muslim")
    .sort();
}

/** عيّنة محلية خفيفة (~12 صفحة) — المصفوفة الكاملة مكانها CI/مرة واحدة قبل الدفع. */
export const SAMPLE_ROUTES = [
  "/", "/sections", "/quran-hub", "/lessons", "/prayer-times", "/hadith", "/fiqh",
  "/prophets", "/search", "/adhkar/morning", "/hadith/sahih", "/lessons/kw-othman-tafsir-nahl-0",
];

const FULL_ROUTES = [...new Set([...deriveHubRoutes(), ...DETAIL_ROUTES])];
export const ALL_ROUTES = process.env.DEVICE_COMPAT_ROUTES === "sample" ? SAMPLE_ROUTES : FULL_ROUTES;

const OUT_DIR = process.env.DEVICE_COMPAT_OUT
  ? path.resolve(process.env.DEVICE_COMPAT_OUT)
  : path.resolve(HERE, "../test-results/device-compat");

export type RouteReport = {
  route: string;
  status: number | null;
  hOverflow: { scrollWidth: number; innerWidth: number; offenders: string[] } | null;
  textOverflow: string[];
  mediaOverflow: string[];
  smallTargets: string[];
  smallInputs: string[];
  chromeOverlap: string[];
};

/* eslint-disable */
async function inspect(page: Page): Promise<Omit<RouteReport, "route" | "status">> {
  return page.evaluate(async () => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const desc = (el: Element) => {
      const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 3).join(".");
      return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""}`;
    };
    const visible = (el: Element) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    /** هل العنصر داخل حاوية تمرير/قص أفقية (شريط تمرير مقصود)؟ */
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
        // قصّ على مستوى التطبيق (عرض الشاشة كاملًا) لا يُعفي: المحتوى المقصوص عنده مفقود فعلًا
        if ((ox === "hidden" || ox === "clip") && p.getBoundingClientRect().width < W - 1) return true;
      }
      return false;
    };
    const all = Array.from(document.body.querySelectorAll("*"));

    // 1) تمرير أفقي على مستوى الصفحة
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    let hOverflow: any = null;
    {
      // يُفحص دائمًا: قصّ overflow-x على مستوى التطبيق يُخفي التمرير لكنه يقصّ المحتوى.
      const offenders: string[] = [];
      for (const root of [document.documentElement, document.body]) {
        const mw = parseFloat(getComputedStyle(root).minWidth);
        if (mw > W) offenders.push(`${desc(root)} min-width=${mw}px`);
      }
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if ((r.right > W + 1 || r.left < -1) && r.width > 0 && !el.closest("[aria-hidden=true]") && visible(el) && !clipped(el)) {
          const parent = el.parentElement;
          const pr = parent?.getBoundingClientRect();
          // نسجّل أول عنصر يتجاوز وأبوه لا يتجاوز (المصدر الجذري)
          if (!pr || (pr.right <= W + 1 && pr.left >= -1)) {
            offenders.push(`${desc(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
          }
        }
        if (offenders.length >= 6) break;
      }
      if (sw > W + 1 || offenders.length) hOverflow = { scrollWidth: sw, innerWidth: W, offenders };
    }

    // 2) نص يتجاوز حاويته دون التفاف/اختصار
    const textOverflow: string[] = [];
    for (const el of all) {
      if (textOverflow.length >= 6) break;
      if (!(el instanceof HTMLElement)) continue;
      const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent || "").trim().length > 1);
      if (!hasText || !visible(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.overflowX !== "visible" || cs.textOverflow === "ellipsis") continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && !clipped(el)) {
        textOverflow.push(`${desc(el)} (${el.scrollWidth}>${el.clientWidth}) «${(el.textContent || "").trim().slice(0, 24)}»`);
      }
    }

    // 5) وسائط/جداول/كود أعرض من الشاشة
    const mediaOverflow: string[] = [];
    for (const el of Array.from(document.querySelectorAll("img,video,iframe,table,pre,canvas"))) {
      const r = el.getBoundingClientRect();
      if (r.width > W + 1 && !clipped(el)) mediaOverflow.push(`${desc(el)} w=${Math.round(r.width)}`);
    }

    // 4) أهداف لمس < 44px في الكروم/التنقل
    const smallTargets: string[] = [];
    const chromeSel = "header a, header button, nav a, nav button, .bottom-nav a, .bottom-nav button, [data-bottom-nav] a, [data-bottom-nav] button, .app-top-chrome a, .app-top-chrome button";
    for (const el of Array.from(document.querySelectorAll(chromeSel))) {
      if (!visible(el) || clipped(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H) continue;
      // روابط مسار التنقل (breadcrumb) نصّية مضمّنة — مستثناة في WCAG 2.5.8
      if (el.closest('nav[aria-label*="مسار"], nav[aria-label*="breadcrumb" i]')) continue;
      // مساحة اللمس الموسّعة بعنصر زائف مطلق (::after/::before) لا تغيّر التخطيط
      let hw = r.width, hh = r.height;
      for (const pseudo of ["::after", "::before"]) {
        const ps = getComputedStyle(el, pseudo);
        if (ps.content === "none" || ps.position !== "absolute") continue;
        hw = Math.max(hw, r.width - (parseFloat(ps.left) || 0) - (parseFloat(ps.right) || 0));
        hh = Math.max(hh, r.height - (parseFloat(ps.top) || 0) - (parseFloat(ps.bottom) || 0));
      }
      if (Math.round(hw) < 44 || Math.round(hh) < 44) {
        // نطاق اللمس قد يتسع بـ ::before/padding للأب؛ نقيس الأب التفاعلي المباشر
        smallTargets.push(`${desc(el)} ${Math.round(hw)}x${Math.round(hh)}`);
      }
      if (smallTargets.length >= 8) break;
    }

    // 8) حقول إدخال < 16px (تكبير iOS التلقائي) — على الجوال فقط
    const smallInputs: string[] = [];
    if (W < 768) {
      for (const el of Array.from(document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),textarea,select"))) {
        if (!visible(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) smallInputs.push(`${desc(el)} ${fs}px`);
      }
    }

    // 3) كروم ثابت يغطي المحتوى: أول عنوان تحت الترويسة، وآخر محتوى فوق الشريط السفلي
    const chromeOverlap: string[] = [];
    const main = document.querySelector("main") || document.getElementById("root");
    const fixedBottom = Array.from(document.querySelectorAll(".bottom-nav, [data-bottom-nav]")).find(visible);
    const header = Array.from(document.querySelectorAll(".app-top-chrome, header")).find((h) => {
      const p = getComputedStyle(h).position;
      return visible(h) && (p === "fixed" || p === "sticky");
    });
    if (main && header) {
      const hb = header.getBoundingClientRect().bottom;
      const h1 = main.querySelector("h1");
      if (h1 && visible(h1) && !header.contains(h1)) {
        const r = h1.getBoundingClientRect();
        if (r.top < hb - 2 && r.bottom > 0) chromeOverlap.push(`h1 تحت الترويسة (${Math.round(r.top)}<${Math.round(hb)})`);
      }
    }
    if (main && fixedBottom && document.scrollingElement!.scrollHeight > H + 4) {
      // في نهاية التمرير: أعمق عنصر ورقي في المحتوى يجب أن ينتهي فوق الشريط السفلي
      const se = document.scrollingElement!;
      const prevY = se.scrollTop;
      // content-visibility:auto يغيّر الارتفاعات بعد القفز؛ نكرر القفز حتى تستقر
      const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120))));
      for (let i = 0; i < 3; i++) { se.scrollTop = se.scrollHeight; await settle(); }
      const nb = fixedBottom.getBoundingClientRect().top;
      const inFixed = (el: Element) => {
        for (let p: Element | null = el; p && p !== main; p = p.parentElement) {
          const pos = getComputedStyle(p).position;
          if (pos === "fixed" || pos === "sticky") return true;
        }
        return false;
      };
      /** الحد السفلي المرئي فعلًا (بعد قصّ الآباء ذوي overflow غير visible). */
      const visBottom = (el: Element) => {
        let b = el.getBoundingClientRect().bottom;
        for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
          if (getComputedStyle(p).overflowY !== "visible") b = Math.min(b, p.getBoundingClientRect().bottom);
        }
        return b;
      };
      let worst: Element | null = null;
      let worstB = 0;
      for (const el of Array.from(main.querySelectorAll("*"))) {
        if (el.children.length || el.getBoundingClientRect().bottom <= Math.max(worstB, nb + 1)) continue;
        if (!visible(el) || inFixed(el)) continue;
        const b = visBottom(el);
        if (b > worstB) { worstB = b; worst = el; }
      }
      if (worst && worstB > nb + 1 && worstB <= H + 1) {
        chromeOverlap.push(`${desc(worst)} تحت الشريط السفلي (${Math.round(worstB)}>${Math.round(nb)})`);
      }
      se.scrollTop = prevY;
    }

    return { hOverflow, textOverflow, mediaOverflow, smallTargets, smallInputs, chromeOverlap };
  });
}
/* eslint-enable */

function setup(vp: Vp, theme: "light" | "dark") {
  return async (page: Page) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.addInitScript(
      ([t, scale]) => {
        try {
          localStorage.setItem("majalis-theme", t as string);
          localStorage.setItem("majalis-onboarding-done", "1");
        } catch {}
        if (scale) {
          document.addEventListener("DOMContentLoaded", () => {
            // يحاكي «نص أكبر» في النظام: تكبير الـrem الجذري (inline يغلب ورقة الأنماط)
            document.documentElement.style.setProperty("font-size", `${Number(scale) * 100}%`, "important");
          });
        }
      },
      [theme, vp.textScale ?? 0] as const,
    );
  };
}

const combos: Array<{ vp: Vp; theme: "light" | "dark" }> = [
  ...DEVICE_MATRIX.flatMap((vp) => (["light", "dark"] as const).map((theme) => ({ vp, theme }))),
  ...TEXT_SCALE_MATRIX.map((vp) => ({ vp, theme: "light" as const })),
];

test.describe("مصفوفة توافق الأجهزة", () => {
  for (const { vp, theme } of combos) {
    test(`${vp.name} ${theme}`, async ({ page }) => {
      test.setTimeout(20 * 60_000);
      await setup(vp, theme)(page);
      const reports: RouteReport[] = [];
      for (const route of ALL_ROUTES) {
        // /mushaf: تحميل فقط (داخلية القارئ خارج النطاق)
        let status: number | null = null;
        try {
          const res = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 30_000 });
          status = res?.status() ?? null;
          await page.waitForFunction(() => !document.getElementById("mj-launch-splash"), null, { timeout: 8_000 }).catch(() => {});
          await page.waitForLoadState("networkidle", { timeout: 2_500 }).catch(() => {});
          await page.waitForTimeout(250);
        } catch {
          reports.push({ route, status: -1, hOverflow: null, textOverflow: [], mediaOverflow: [], smallTargets: [], smallInputs: [], chromeOverlap: [] });
          continue;
        }
        const r = route === "/mushaf"
          ? { hOverflow: null, textOverflow: [], mediaOverflow: [], smallTargets: [], smallInputs: [], chromeOverlap: [] }
          : await inspect(page);
        reports.push({ route, status, ...r });
      }
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(OUT_DIR, `${vp.name}-${theme}.json`),
        JSON.stringify({ viewport: vp, theme, reports }, null, 1),
      );
      const broken = reports.filter((r) => r.status !== 200);
      expect(broken.map((r) => `${r.route} → ${r.status}`), `${vp.name}/${theme}: مسارات لم تُحمَّل`).toEqual([]);
      const hard = reports.filter((r) => r.hOverflow || r.mediaOverflow.length);
      expect(
        hard.map((r) => `${r.route}: ${r.hOverflow ? `scrollWidth ${r.hOverflow.scrollWidth}>${r.hOverflow.innerWidth} ${r.hOverflow.offenders.join(" | ")}` : ""} ${r.mediaOverflow.join(" | ")}`),
        `${vp.name}/${theme}: صفحات بتمرير أفقي أو وسائط أعرض من الشاشة`,
      ).toEqual([]);
    });
  }
});
