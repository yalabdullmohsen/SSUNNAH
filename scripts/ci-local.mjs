#!/usr/bin/env node
/**
 * ci:local — نسخة محلية سريعة من بوابات CI الحاسمة على الملفات المتغيّرة فقط.
 *  - دائمًا: ui-ratchet + design-system-shell + الاختبار التعاقدي لأسماء المكوّنات.
 *  - اختبارات الوحدة/البوابات (src/lib/__tests__ و scripts/test-*.mjs) التي تقرأ ملفًا متغيّرًا.
 *  - إن تغيّر src/design-system/** أو ui-ratchet: كل اختبار يذكر design-system.
 * الفشل يوقف الدفع. لا يعطّل أي بوابة؛ التغطية الكاملة تبقى في verify:ci وCI.
 *  - دائمًا أيضًا: كل بوابات السقوف/العدّادات (--check، budget، ratchet) المأخوذة حرفيًا من repo-gates في ci.yml،
 *    فلا يفشل فحص سقف في CI دون أن يُرى محليًا (مثل visual-system-debt-budget).
 *  - دائمًا: generate-seo.mjs ثم git diff --exit-code على seo-prerender (كما في build).
 *  - --full: كل الأوامر الورقية في repo-gates (مطابق لـ CI، بطيء). --plan: يطبع الخطة JSON بلا تشغيل.
 * الاستعمال: pnpm run ci:local [-- --base origin/main] [-- --all] [-- --full] [-- --plan]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { repoGatesLeaves, isBudgetGate, selectionNeedles, seoPrerenderDrift } from "./ci-local-plan.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APP = resolve(ROOT, "artifacts/majalis");
const argv = process.argv.slice(2);
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "origin/main";
const gitRaw = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" });
const git = (...a) => gitRaw(...a).trim();

let changed;
try {
  const mb = git("merge-base", base, "HEAD");
  changed = [...new Set([...git("diff", "--name-only", mb, "HEAD").split("\n"), ...git("diff", "--name-only", "HEAD").split("\n")])].filter(Boolean);
} catch {
  console.error(`ci:local: تعذّر حساب الفرق مع ${base} — شغّل git fetch origin main`);
  process.exit(2);
}
const appFiles = changed.filter((f) => f.startsWith("artifacts/majalis/")).map((f) => f.slice("artifacts/majalis/".length));
const dsTouched = argv.includes("--all") || appFiles.some((f) => /^src\/design-system\/|^scripts\/ui-(ratchet|legacy)/.test(f));

const testDirs = [["src/lib/__tests__", /\.test\.ts$/], ["src/features", /\.test\.tsx?$/], ["scripts", /^test-.*\.mjs$/]];
const walk = (dir, re, out = []) => {
  for (const e of readdirSync(resolve(APP, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (e.name !== "node_modules") walk(p, re, out); }
    else if (re.test(e.name)) out.push(p);
  }
  return out;
};
let pkgDiff = "";
if (appFiles.includes("package.json")) {
  const p = "artifacts/majalis/package.json";
  pkgDiff = gitRaw("diff", "-U0", git("merge-base", base, "HEAD"), "HEAD", "--", p) + gitRaw("diff", "-U0", "HEAD", "--", p);
}
const needles = selectionNeedles(appFiles, pkgDiff);
const selected = new Set(["src/lib/__tests__/no-source-pinned-component-names.test.ts"]);
for (const [dir, re] of testDirs) {
  for (const t of walk(dir, re)) {
    const text = readFileSync(resolve(APP, t), "utf8");
    if (appFiles.includes(t) || needles.some((n) => text.includes(n)) || (dsTouched && /design-system|ui-ratchet/.test(text))) selected.add(t);
  }
}

const run = (label, cmd, args, cwd = APP) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env: process.env, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(`✗ ${label}\n${(r.stdout + r.stderr).split("\n").slice(-14).join("\n")}`);
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
};

const leaves = [...new Map(repoGatesLeaves().filter((l) => !l.optional).map((l) => [`${l.cwd}::${l.cmd}`, l])).values()];
const budget = leaves.filter(isBudgetGate);
if (argv.includes("--plan")) {
  console.log(JSON.stringify({ full: leaves.map((l) => `${l.cwd}::${l.cmd}`), always: budget.map((l) => `${l.cwd}::${l.cmd}`), selected: [...selected] }, null, 1));
  process.exit(0);
}
const runShell = (l) => run(l.cmd, "bash", ["-c", l.cmd], resolve(ROOT, l.cwd));

const dirtyBefore = new Set(gitRaw("status", "--porcelain").split("\n"));
let ok = true;
for (const l of argv.includes("--full") ? leaves : budget) ok = runShell(l) && ok;
const seo = seoPrerenderDrift(APP);
if (seo.ok) console.log("✓ seo-prerender مطابق لـ generate-seo.mjs (git diff --exit-code)");
else {
  ok = false;
  console.error(`✗ seo-prerender لا يطابق generate-seo.mjs — أودِع الصفحات المعاد توليدها:\n${seo.error ?? seo.files.join("\n")}`);
}
// معلنة في known-broken-tests.json (بوابة مراقبة الانتهاء في lib-tests-all-wired) — تفشل على main نفسه
const today = new Date().toISOString().slice(0, 10);
const knownBroken = new Set(JSON.parse(readFileSync(resolve(APP, "scripts/known-broken-tests.json"), "utf8")).filter((e) => e.expires >= today).map((e) => e.file));
// تحتاج مخرجات vite build (لا يعمل على ماك)؛ تبقى إلزامية في CI
const needsDist = new Set(["scripts/test-bundle-budget.mjs"]);
for (const t of [...selected].sort()) {
  if (knownBroken.has(t.split("/").pop())) { console.log(`↷ ${t} (معلن في known-broken-tests.json)`); continue; }
  if (needsDist.has(t) && !existsSync(resolve(APP, "dist/assets"))) { console.log(`↷ ${t} (يحتاج dist — يعمل في CI)`); continue; }
  ok = run(t, "node", t.endsWith(".mjs") ? [t] : ["--import", "tsx", t]) && ok;
}
// الاختبارات تعيد كتابة تقارير مولَّدة؛ أعدها لحالتها قبل التشغيل
const stray = gitRaw("status", "--porcelain").split("\n").filter((l) => l && !dirtyBefore.has(l) && /^ M .*(reports\/|docs\/)/.test(l)).map((l) => l.slice(3));
if (stray.length) execFileSync("git", ["checkout", "--", ...stray], { cwd: ROOT });
console.log(ok ? `ci:local OK (${selected.size} اختبارًا + ${argv.includes("--full") ? leaves.length : budget.length} بوابة سقوف)` : "ci:local FAILED — لا تدفع");
process.exit(ok ? 0 : 1);
