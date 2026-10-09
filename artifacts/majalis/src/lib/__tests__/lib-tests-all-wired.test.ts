/**
 * حارس: كل src/lib/__tests__/*.test.ts يجب أن يُشغَّل في CI — مذكور في package.json، أو في
 * scripts/wired-orphan-tests.json (يشغّله test:lib-orphans)، أو في scripts/known-broken-tests.json
 * (معطوب معروف؛ القائمة لا تكبر أبدًا وتُفرَّغ بالإصلاح).
 * السبب: sidebar-nav-full-labels-gate انكسر على main دون أن تلتقطه أي بوابة لأن لا سكربت يستدعيه.
 * تشغيل: node --import tsx src/lib/__tests__/lib-tests-all-wired.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const scriptsDir = readdirSync(resolve(root, "../../scripts")).filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"));
const wfDir = readdirSync(resolve(root, "../../.github/workflows")).filter((f) => f.endsWith(".yml"));
/* مصادر الاستدعاء: package.json (الجذر والتطبيق) + scripts/ + سير عمل CI */
const pkg = [read("package.json"), read("../../package.json"), ...scriptsDir.map((f) => read(`../../scripts/${f}`)), ...wfDir.map((f) => read(`../../.github/workflows/${f}`))].join("\n");
const wired: string[] = JSON.parse(readFileSync(resolve(root, "scripts/wired-orphan-tests.json"), "utf8"));
const broken: string[] = JSON.parse(readFileSync(resolve(root, "scripts/known-broken-tests.json"), "utf8"));
const MAX_BROKEN = 12;

const files = readdirSync(resolve(root, "src/lib/__tests__")).filter((f) => f.endsWith(".test.ts"));
const missing = files.filter((f) => !pkg.includes(f) && !wired.includes(f) && !broken.includes(f));
assert.deepEqual(missing, [], `اختبارات غير مربوطة بأي سكربت CI (أضفها إلى package.json أو wired-orphan-tests.json):\n${missing.join("\n")}`);

for (const f of [...wired, ...broken]) assert.ok(files.includes(f), `مسجّل لكنه غير موجود: ${f}`);
for (const f of wired) assert.ok(!broken.includes(f), `${f} في القائمتين`);
assert.ok(broken.length <= MAX_BROKEN, `قائمة المعطوب كبرت (${broken.length} > ${MAX_BROKEN}) — لا تُرفَع`);
console.log(`lib-tests-all-wired: ok (${files.length} ملفًا، ${wired.length} مُربوطة بالمشغّل، ${broken.length} معطوبة معروفة)`);
