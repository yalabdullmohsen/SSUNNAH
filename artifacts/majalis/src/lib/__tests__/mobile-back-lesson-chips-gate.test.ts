/**
 * بوابة: رجوع هيدري + تباين chips الدروس ليلاً (بلا عائم).
 * تشغيل: node --import tsx src/lib/__tests__/mobile-back-lesson-chips-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const appBack = read("src/components/common/AppBackButton.tsx");
assert.doesNotMatch(appBack, /isTabRootPath/);
assert.match(appBack, /رجوع/);

const fab = read("src/components/FloatingBackButton.tsx");
assert.match(fab, /FLOATING_BACK_DISABLED/, "العائم الدائري ملغى");
assert.match(fab, /FIXED_BACK_BAR_ENABLED|variant="bar"/, "شريط ثابت");

const lobby = read("src/components/lobby/SectionLobby.tsx");
assert.match(lobby, /AppBackButton|data-section-back/, "رجوع هيدري في اللوبي");
assert.match(lobby, /data-section-back/);

const polish = read("src/styles/sections-calm-polish.css");
assert.match(polish, /\.floating-back-btn[\s\S]*?display:\s*none/);

/* TOKEN ABSORB: --mj-chip-* SoT = theme-aliases (allowlisted), not dark bridges. */
const aliases = read("src/styles/theme-aliases.css");
assert.match(aliases, /:root\s*\{[\s\S]*?--mj-chip-bg:\s*var\(--mj-surface\)/);
assert.match(aliases, /:root\s*\{[\s\S]*?--mj-chip-fg:\s*var\(--mj-ink\)/);
assert.match(aliases, /:root\s*\{[\s\S]*?--mj-chip-border:\s*var\(--mj-hairline\)/);
assert.match(aliases, /--mj-chip-active-bg:/);
assert.match(aliases, /--mj-chip-active-fg:/);
assert.match(aliases, /html\.dark[\s\S]*?--mj-chip-active-fg:\s*#06231a/i);
/* Dark System Contract warm ink — not pre-absorb cool #f3f7f5 */
assert.match(aliases, /html\.dark[\s\S]*?--mj-ink:\s*#EDE8DF/i);
assert.match(aliases, /html\.dark[\s\S]*?--mj-chip-fg:\s*#EDE8DF/i);
assert.match(aliases, /html\.dark[\s\S]*?--mj-chip-bg:\s*#222c28/i);
assert.match(aliases, /html\.dark[\s\S]*?--mj-chip-border:\s*#35443F/i);
assert.doesNotMatch(
  aliases,
  /html\.dark[\s\S]*?--mj-chip-fg:\s*#f3f7f5/i,
  "لا حبر chip بارد قديم في aliases الليلي",
);

/* Bridges must not redeclare chip tokens (PR2 Dark Token Absorb). */
for (const bridge of [
  "src/styles/premium-dark-refine.css",
  "src/styles/dark-design-system.css",
  "src/styles/dark-mode-recovery.css",
]) {
  assert.doesNotMatch(read(bridge), /--mj-chip-[\w-]+\s*:/, `${bridge}: no --mj-chip-* decls`);
}

/* Contrast AA: chip fg on chip bg (dark contract literals). */
function hexLum(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const ch = (i: number) => {
    const x = parseInt(full.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}
function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [hexLum(a), hexLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
assert.ok(
  contrastRatio("#EDE8DF", "#222c28") >= 4.5,
  "dark chip fg/bg must meet AA ≥ 4.5",
);
assert.ok(
  contrastRatio("#06231a", "#4FB48B") >= 4.5,
  "selected chip ink on brand must meet AA ≥ 4.5",
);

const lessonsCss = read("src/styles/pages/lessons.css");
assert.match(lessonsCss, /--mj-chip-active-fg/);
assert.match(lessonsCss, /color:\s*var\(--mj-chip-fg/);
assert.match(lessonsCss, /background:\s*var\(--mj-chip-bg/);
assert.match(lessonsCss, /border(?:-color)?:\s*[^;]*var\(--mj-chip-border/);
assert.match(lessonsCss, /html\.dark[\s\S]*?\.filter-chips__chip\.is-active[\s\S]*?#06231a/);
assert.match(lessonsCss, /\.lessons-page-v3\s*\{[\s\S]*?padding-bottom:\s*calc\(\s*var\(--bottom-nav-height/);
assert.match(lessonsCss, /\.lesson-filters__chips\s*\{[\s\S]*?overflow-x:\s*auto/);
assert.doesNotMatch(
  lessonsCss.slice(
    lessonsCss.indexOf(".lessons-page-v2 .filter-chips {"),
    lessonsCss.indexOf(".lessons-page-v2 .filter-chips__chip {") + 80,
  ),
  /background:\s*var\(--surface-muted/,
  "فلاتر الدروس بلا صندوق muted ثقيل",
);

const unify = read("src/styles/visual-identity-unify.css");
assert.doesNotMatch(
  unify,
  /\.filter-chips__chip\.is-active[\s\S]{0,120}background:\s*var\(--color-selected\)/,
  "لا خلفية selected شفافة تخفي نص «درس» ليلاً",
);
assert.match(unify, /var\(--mj-chip-fg/);
assert.match(unify, /var\(--mj-chip-bg/);

const contrastFix = read("src/styles/visual-layer-contrast-fix.css");
assert.match(contrastFix, /\.lesson-filters__chips[\s\S]*?background:\s*transparent\s*!important/);
assert.match(contrastFix, /var\(--mj-chip-fg/);

console.log("mobile-back-lesson-chips-gate.test.ts: ok");
