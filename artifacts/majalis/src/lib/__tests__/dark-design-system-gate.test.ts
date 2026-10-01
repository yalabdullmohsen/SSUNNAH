/**
 * بوابة: Dark Design System — طبقات أسطح وليست Invert.
 * تشغيل: node --import tsx src/lib/__tests__/dark-design-system-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const theme = read("src/app/styles/theme.css");
assert.match(theme, /--surface-elevated:\s*#24302[Bb]/);
assert.match(theme, /--surface-interactive:/);
assert.match(theme, /--text-primary:/);
assert.match(theme, /--icon-primary:/);

const ds = read("src/styles/dark-design-system.css");
assert.match(ds, /Dark Design System/);
assert.match(ds, /--surface-elevated/);
assert.match(ds, /\.an-row/);
assert.match(ds, /\.twh-hub-card/);
assert.match(ds, /\.mk-topic-card/);
assert.match(ds, /\.sh-bab/);
assert.match(ds, /\.seerah-panel/);
assert.match(ds, /\.tarikh-card/);
assert.match(ds, /\.update-available-sheet/);
assert.doesNotMatch(ds, /filter:\s*invert/);

const ensure = read("src/lib/ensure-dark-layers.ts");
assert.match(ensure, /dark-design-system\.css/);
assert.match(
  ensure,
  /Promise\.all\(\[[\s\S]*?import\("\.\.\/styles\/dark-mode-surfaces\.css"\)/,
  "محمّل واحد يستورد surfaces (بعد recovery الاختياري)",
);
assert.match(ensure, /dark-mode-recovery\.css/, "recovery داخل محمّل الليل");

const main = read("src/main.tsx");
assert.match(main, /dark-design-system\.css/);
assert.match(main, /ensureDarkLayersForBoot/, "إقلاع داكن عبر ensure");

const sheet = read("src/styles/components/app-bottom-sheet.css");
assert.doesNotMatch(sheet, /background:\s*#0f2f28/);
assert.match(sheet, /--surface-elevated/);

const provider = read("src/components/ThemePreferenceProvider.tsx");
assert.match(provider, /ensureDarkLayersForThemeSwitch/, "تبديل ليلي عبر ensure");

assert.match(ds, /--soft-card-bg:\s*var\(--surface-elevated\)/);

const aliases = read("src/styles/theme-aliases.css");
assert.match(aliases, /--soft-card-bg:/);
assert.match(read("src/styles/ssunnah-ux-polish.css"), /\.ss-app-card/);

const html = read("index.html");
assert.match(html, /mj-dark-elevated-boot/);
assert.match(html, /--soft-card-bg:#24302b/);

console.log("dark-design-system-gate.test.ts: ok");
