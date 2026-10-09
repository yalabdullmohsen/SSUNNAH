/**
 * إبر انتقاء ci:local: استبعاد اسم package.json لا يُضعف التغطية.
 * Run: node --import tsx src/lib/__tests__/ci-local-needles.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { selectionNeedles } from "../../../../../scripts/ci-local-plan.mjs";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const needles = selectionNeedles as (files: string[], pkgDiff?: string) => string[];
const legacy = (files: string[]) =>
  files.filter((f) => /\.(tsx?|css|mjs|json)$/.test(f)).flatMap((f) => [f, basename(f).replace(/\.[^.]+$/, "")]).filter((n) => n.length >= 6);
const same = (a: string[], b: string[], msg: string) => assert.deepEqual([...new Set(a)].sort(), [...new Set(b)].sort(), msg);

// 1) كل ملف في src وscripts غير package.json: الإبر مطابقة للمعادلة السابقة حرفيًا (منفردًا ومجتمعًا)
// من القرص لا من git: خطاف الدفع يضبط GIT_DIR فيتجاهل git ls-files المجلد الحالي
const tracked = ["src", "scripts"].flatMap((d) =>
  (readdirSync(resolve(APP, d), { recursive: true }) as string[]).map((f) => `${d}/${f}`).filter((f) => !f.includes("node_modules")),
);
assert.ok(tracked.length > 500, "عيّنة الملفات");
for (const f of tracked) same(needles([f]), legacy([f]), `إبر ${f} تغيّرت`);
same(needles(tracked), legacy(tracked), "إبر المجموعة تغيّرت");

// 2) package.json وحده بلا فرق: لا إبرة عامة («package»/«package.json») تختار كل اختبار يقرؤه
assert.deepEqual(needles(["package.json"]), []);
assert.ok(!needles(["package.json", "src/lib/a-module.ts"]).some((n) => /^package/.test(n)));

// 3) package.json مع فرق: إبر ما تغيّر فعلًا — السكربت والمسار واسم الملف والاعتمادية
const diff = [
  "diff --git a/artifacts/majalis/package.json b/artifacts/majalis/package.json",
  "--- a/artifacts/majalis/package.json",
  "+++ b/artifacts/majalis/package.json",
  "@@ -10 +10 @@",
  '-    "test:tasmee": "node --import tsx src/lib/__tests__/tasmee-old.test.ts",',
  '+    "test:tasmee": "node --import tsx src/lib/__tests__/tasmee-old.test.ts && node scripts/test-new-gate.mjs",',
  '+    "some-lib": "^2.0.0",',
].join("\n");
const n = needles(["package.json"], diff);
for (const want of ["test:tasmee", "src/lib/__tests__/tasmee-old.test.ts", "tasmee-old.test", "scripts/test-new-gate.mjs", "test-new-gate", "some-lib"]) {
  assert.ok(n.includes(want), `إبرة مفقودة: ${want}`);
}
assert.ok(!n.some((x) => x.includes("package")), "رؤوس الفرق لا تُنتج إبرًا");

// 4) خطة حقيقية: بوابات السقوف تعمل دائمًا مهما كانت الإبر
const plan = JSON.parse(execFileSync("node", ["scripts/ci-local.mjs", "--plan", "--base", "HEAD"], { cwd: resolve(APP, "../.."), encoding: "utf8" }));
assert.ok(Array.isArray(plan.always) && plan.always.length > 0, "بوابات always");

console.log(`ci-local-needles: ok (${tracked.length} ملفًا بإبر مطابقة، package.json بلا إبرة عامة)`);
