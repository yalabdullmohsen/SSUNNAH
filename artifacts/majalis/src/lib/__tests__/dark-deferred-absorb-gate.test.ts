/**
 * FINAL Program Phase 3 — Dark deferred absorb.
 * تشغيل: node --import tsx src/lib/__tests__/dark-deferred-absorb-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

assert.equal(
  existsSync(resolve(root, "src/lib/ensure-dark-layers.ts")),
  true,
  "محمّل الليل الواحد موجود",
);

const ensure = read("src/lib/ensure-dark-layers.ts");
assert.match(ensure, /ensureDarkCoreLayers/);
assert.match(ensure, /ensureDarkLayersForBoot/);
assert.match(ensure, /ensureDarkLayersForThemeSwitch/);
assert.match(ensure, /ensureDarkLuxuryBundle/);
assert.match(ensure, /isDarkCoreLoadStarted/);
assert.match(ensure, /dark-mode-surfaces\.css/);
assert.match(ensure, /dark-design-system\.css/);
assert.match(ensure, /premium-dark-refine\.css/);
assert.match(ensure, /luxury-night-v2\.css/);
assert.match(ensure, /sunnah-identity-luxury-night\.css/);
assert.doesNotMatch(ensure, /filter:\s*invert/);

const main = read("src/main.tsx");
assert.match(main, /ensureDarkLayersForBoot/);
assert.match(main, /ensureDarkCoreLayers/);
assert.match(main, /isDarkCoreLoadStarted/);
/* لا استيراد مباشر مكرّر للطبقات الليلية داخل loadNonCriticalCss */
const deferredFn = main.match(/function loadNonCriticalCss\(\) \{[\s\S]*?\n\}/);
assert.ok(deferredFn, "loadNonCriticalCss موجودة");
assert.doesNotMatch(
  deferredFn[0],
  /import\("\.\/styles\/dark-mode-surfaces\.css"\)/,
  "لا import مباشر لـ surfaces داخل idle",
);
assert.doesNotMatch(
  deferredFn[0],
  /import\("\.\/styles\/interaction-states\.css"\)/,
  "لا إعادة تحميل interaction-states في idle",
);
assert.match(
  deferredFn[0],
  /isDarkCoreLoadStarted\(\)/,
  "idle يتخطى إن حُمِّل الأساسي عند الإقلاع",
);

const provider = read("src/components/ThemePreferenceProvider.tsx");
assert.match(provider, /ensureDarkLayersForThemeSwitch/);
assert.doesNotMatch(
  provider,
  /import\("@\/styles\/dark-mode-surfaces\.css"\)/,
  "المزوّد لا يستورد surfaces مباشرة",
);

const app = read("src/App.tsx");
assert.match(app, /ensureDarkLuxuryBundle/);
assert.doesNotMatch(
  app,
  /import\("@\/styles\/pages\/luxury-night-v2\.css"\)/,
  "App لا يستورد luxury مباشرة",
);

/* recovery يبقى متزامنًا — بلا مسار reload-to-win */
assert.match(main, /import\s+["']\.\/styles\/dark-mode-recovery\.css["']/);
assert.doesNotMatch(
  main,
  /final-release[\s\S]{0,800}import\("\.\/styles\/dark-mode-recovery\.css"\)/,
  "لا إعادة recovery بعد final-release",
);

console.log("dark-deferred-absorb-gate.test.ts: ok");
