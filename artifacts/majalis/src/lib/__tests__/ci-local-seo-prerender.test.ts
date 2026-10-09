/**
 * ci:local يلتقط seo-prerender غير المحدَّث: يعيد التوليد ثم git diff --exit-code، فيفشل عند وجود فرق.
 * مستودع git مؤقت بمولِّد وهمي يكتب المحتوى المودَع أو غيره.
 * Run: node --import tsx src/lib/__tests__/ci-local-seo-prerender.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { seoPrerenderDrift } from "../../../../../scripts/ci-local-plan.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const dir = mkdtempSync(join(tmpdir(), "ci-local-seo-"));
// داخل خطاف git تُورَّث GIT_DIR/GIT_INDEX_FILE فتصيب المستودع الحقيقي؛ عزل تام للمستودع المؤقت
for (const k of Object.keys(process.env)) if (k.startsWith("GIT_")) delete process.env[k];
try {
  const git = (...a: string[]) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd: dir });
  git("init", "-q");
  mkdirSync(join(dir, "seo-prerender/privacy"), { recursive: true });
  writeFileSync(join(dir, "seo-prerender/privacy/index.html"), "<p>v1</p>\n");
  writeFileSync(join(dir, "gen.mjs"), `import{writeFileSync}from"node:fs";if(process.argv[2]==="fail")process.exit(3);writeFileSync("seo-prerender/privacy/index.html",\`<p>\${process.argv[2]}</p>\\n\`);`);
  git("add", ".");
  git("commit", "-qm", "init");

  assert.deepEqual(seoPrerenderDrift(dir, ["gen.mjs", "v1"]), { ok: true, files: [] }, "التوليد المطابق ينجح");

  const drift = seoPrerenderDrift(dir, ["gen.mjs", "v2"]);
  assert.equal(drift.ok, false, "فرق بعد التوليد يُفشل الخطوة");
  assert.deepEqual(drift.files, ["seo-prerender/privacy/index.html"]);
  assert.equal(readFileSync(join(dir, "seo-prerender/privacy/index.html"), "utf8"), "<p>v2</p>\n", "المخرجات تبقى للإيداع");

  git("checkout", "-q", "--", ".");
  const broken = seoPrerenderDrift(dir, ["gen.mjs", "fail"]);
  assert.equal(broken.ok, false, "فشل المولِّد يُفشل الخطوة");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// موصولة في ci:local على تطبيق majalis
assert.match(readFileSync(resolve(root, "scripts/ci-local.mjs"), "utf8"), /seoPrerenderDrift\(APP\)/);
console.log("ci-local-seo-prerender.test.ts: ok");
