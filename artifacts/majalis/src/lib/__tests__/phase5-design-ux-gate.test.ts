/**
 * Phase 5 — Design / UX / A11y authority gate.
 * Run: node --import tsx src/lib/__tests__/phase5-design-ux-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (p: string) => readFileSync(resolve(majalisRoot, p), "utf8");
const readRepo = (p: string) => readFileSync(resolve(repoRoot, p), "utf8");

console.log("=== وثائق Phase 5 ===");
for (const doc of [
  "docs/design/DESIGN_TOKEN_AUTHORITY.md",
  "docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md",
  "docs/qa/PHASE_5_REAL_DEVICE_MATRIX.md",
  "docs/remediation/PHASE_5_DESIGN_UX_BASELINE.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, doc)), doc);
}

const authority = readRepo("docs/design/DESIGN_TOKEN_AUTHORITY.md");
assert.match(authority, /--sf2-/);
assert.match(authority, /--z-/);
assert.match(authority, /CANONICAL|COMPATIBILITY|LEGACY/);

console.log("=== طبقات z-index + motion مؤجّلة من main ===");
const main = read("src/main.tsx");
assert.match(main, /import\("\.\/styles\/z-index-layers\.css"\)/);
assert.match(main, /import\("\.\/styles\/motion-policy\.css"\)/);
assert.doesNotMatch(main, /^import "\.\/styles\/z-index-layers\.css";$/m);
assert.doesNotMatch(main, /^import "\.\/styles\/motion-policy\.css";$/m);

const zLayers = read("src/styles/z-index-layers.css");
for (const token of [
  "--z-base",
  "--z-sticky",
  "--z-chrome",
  "--z-sheet",
  "--z-dropdown",
  "--z-critical-dialog",
  "--z-toast",
  "--z-skip-link",
]) {
  assert.match(zLayers, new RegExp(token.replace(/-/g, "\\-")));
}

const motion = read("src/styles/motion-policy.css");
assert.match(motion, /prefers-reduced-motion:\s*reduce/);
assert.match(motion, /--motion-duration-base/);
assert.doesNotMatch(motion, /framer-motion/i);

console.log("=== مكوّنات الحالات + PageContainer ===");
const index = read("src/components/design-system/index.ts");
assert.match(index, /OfflineStateV2/);
assert.match(index, /PageContainer/);
assert.match(index, /EmptyStateV2/);
assert.match(index, /ErrorStateV2/);
assert.match(index, /LoadingStateV2/);

const shell = read("src/components/design-system/screens/ScreenShell.tsx");
assert.match(shell, /OfflineStateV2/);
assert.match(shell, /LoadingStateV2/);
assert.match(shell, /EmptyStateV2/);
assert.match(shell, /ErrorStateV2/);
assert.match(shell, /status === "offline"/);

const foundation = read("src/styles/sunnah-foundation-tokens.css");
assert.match(foundation, /--sf-content-narrow:\s*40rem/);
assert.match(foundation, /--sf-content-default:\s*48rem/);
assert.match(foundation, /--sf-content-wide:\s*72rem/);

const pageCss = read("src/styles/page-container.css");
assert.match(pageCss, /var\(--sf-content-narrow/);
assert.match(pageCss, /var\(--sf-content-default/);
assert.match(pageCss, /var\(--sf-content-wide/);
assert.match(pageCss, /--inset-(top|bottom|left|right)/);
assert.match(pageCss, /bottom-nav-height/);
assert.doesNotMatch(pageCss, /env\(\s*safe-area-inset-/);
assert.doesNotMatch(pageCss, /--sf-content-narrow:\s*/);

const offline = read("src/components/design-system/OfflineStateV2.tsx");
assert.match(offline, /SectionTitle/);
assert.match(offline, /role="status"/);
assert.doesNotMatch(offline, /#[0-9A-Fa-f]{3,8}/);

const pageContainer = read("src/components/design-system/PageContainer.tsx");
assert.doesNotMatch(pageContainer, /#[0-9A-Fa-f]{3,8}/);
assert.match(pageContainer, /dir="rtl"/);

const error = read("src/components/design-system/ErrorStateV2.tsx");
assert.match(error, /correlationId/);
assert.match(error, /role="alert"/);
assert.match(error, /SectionTitle/);

const empty = read("src/components/design-system/EmptyStateV2.tsx");
assert.match(empty, /SectionTitle/);

console.log("=== معرض DEV فقط ===");
const routes = read("src/AppRoutes.tsx");
assert.match(routes, /import\.meta\.env\.DEV/);
assert.match(routes, /\/dev\/design-system/);
assert.match(routes, /pages\/dev\/DesignSystemGalleryPage/);
assert.match(routes, /lazyWithRetry/);
assert.ok(existsSync(resolve(majalisRoot, "src/pages/dev/DesignSystemGalleryPage.tsx")));

const gallery = read("src/pages/dev/DesignSystemGalleryPage.tsx");
assert.match(gallery, /import\.meta\.env\.DEV/);
assert.doesNotMatch(gallery, /#[0-9A-Fa-f]{3,8}/);

console.log("=== لا Framer Motion في تبعيات majalis ===");
const pkg = JSON.parse(read("package.json")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
assert.equal(pkg.dependencies?.["framer-motion"], undefined);
assert.equal(pkg.devDependencies?.["framer-motion"], undefined);

console.log("=== ملفات DS الجديدة بلا hex عشوائي ===");
const dsNew = [
  "src/components/design-system/OfflineStateV2.tsx",
  "src/components/design-system/PageContainer.tsx",
  "src/pages/dev/DesignSystemGalleryPage.tsx",
];
for (const file of dsNew) {
  assert.doesNotMatch(read(file), /#[0-9A-Fa-f]{3,8}/, `${file} بلا hex`);
}

console.log("=== طبقات CSS القديمة مصنّفة (وجود الملفات) ===");
for (const legacy of [
  "src/styles/brand-v4.css",
  "src/styles/final-release.css",
  "src/styles/design-system.css",
  "src/styles/sunnah-foundation-v2.css",
  "src/styles/sunnah-foundation-tokens.css",
]) {
  assert.ok(existsSync(resolve(majalisRoot, legacy)), legacy);
}

console.log("=== اختبارات visual/a11y موجودة ===");
const testsDir = resolve(majalisRoot, "tests");
const testNames = readdirSync(testsDir);
assert.ok(testNames.includes("font-stability.spec.ts"));
assert.ok(testNames.includes("responsive-overflow.spec.ts"));
assert.ok(testNames.some((n) => n.includes("mushaf-visual")));

console.log("phase5-design-ux-gate.test.ts: ok");
