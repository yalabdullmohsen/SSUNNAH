#!/usr/bin/env node
/**
 * ci:local — نسخة محلية سريعة من بوابات CI الحاسمة على الملفات المتغيّرة فقط.
 *  - دائمًا: ui-ratchet + design-system-shell + الاختبار التعاقدي لأسماء المكوّنات.
 *  - اختبارات الوحدة/البوابات (src/lib/__tests__ و scripts/test-*.mjs) التي تقرأ ملفًا متغيّرًا.
 *  - إن تغيّر src/design-system/** أو ui-ratchet: كل اختبار يذكر design-system.
 * الفشل يوقف الدفع. لا يعطّل أي بوابة؛ التغطية الكاملة تبقى في verify:ci وCI.
 * الاستعمال: pnpm run ci:local [-- --base origin/main] [-- --all]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
const needles = appFiles.filter((f) => /\.(tsx?|css|mjs|json)$/.test(f)).flatMap((f) => [f, basename(f).replace(/\.[^.]+$/, "")]).filter((n) => n.length >= 6);
const selected = new Set(["src/lib/__tests__/no-source-pinned-component-names.test.ts"]);
for (const [dir, re] of testDirs) {
  for (const t of walk(dir, re)) {
    const text = readFileSync(resolve(APP, t), "utf8");
    if (appFiles.includes(t) || needles.some((n) => text.includes(n)) || (dsTouched && /design-system|ui-ratchet/.test(text))) selected.add(t);
  }
}

const run = (label, cmd, args, cwd = APP) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env: process.env });
  if (r.status !== 0) {
    console.error(`✗ ${label}\n${(r.stdout + r.stderr).split("\n").slice(-14).join("\n")}`);
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
};

const dirtyBefore = new Set(gitRaw("status", "--porcelain").split("\n"));
let ok = true;
ok = run("ui-ratchet", "node", ["scripts/ui-ratchet.mjs"]) && ok;
for (const t of [...selected].sort()) {
  ok = run(t, "node", t.endsWith(".mjs") ? [t] : ["--import", "tsx", t]) && ok;
}
// الاختبارات تعيد كتابة تقارير مولَّدة؛ أعدها لحالتها قبل التشغيل
const stray = gitRaw("status", "--porcelain").split("\n").filter((l) => l && !dirtyBefore.has(l) && /^ M .*(reports\/|docs\/)/.test(l)).map((l) => l.slice(3));
if (stray.length) execFileSync("git", ["checkout", "--", ...stray], { cwd: ROOT });
console.log(ok ? `ci:local OK (${selected.size} اختبارًا + ratchet)` : "ci:local FAILED — لا تدفع");
process.exit(ok ? 0 : 1);
