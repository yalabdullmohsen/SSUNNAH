/**
 * عقد مشترك: ممنوع اختبار مصدري يثبّت اسم مكوّن من النظام القديم.
 * سبب الإنشاء: اختبارات تطابق /AppCard/ على ملفات الاستهلاك كانت تكسر CI عند كل هجرة إلى sn-.
 * القائمة تُستنتج من scripts/ui-legacy-list.mjs (مصدر واحد مشترك مع ui-ratchet).
 * تحقّق من السلوك (render/ARIA/RTL/تباين) أو من هذا العقد، لا من اسم المكوّن.
 * Run: node --import tsx src/lib/__tests__/no-source-pinned-component-names.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { legacyComponentNames } from "../../../scripts/ui-legacy-list.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const majalisRoot = resolve(here, "../../..");
const names = legacyComponentNames();
assert.ok(names.length > 20, `قائمة النظام القديم فارغة تقريبًا (${names.length}) — تعطّل الاستنتاج؟`);
const nameRe = new RegExp(`\\b(?:${names.join("|")})\\b`);

const stripLiterals = (l: string) =>
  l
    .replace(/(?:(?<=[(,]\s*)|^\s*)\/(?:\\.|\[[^\]]*\]|[^/\n\\])+\/[a-z]*/g, "")
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, "");
const regexLiterals = (s: string) => (s.match(/(?:(?<=[(,]\s*)|(?<=^\s*))\/(?:\\.|\[[^\]]*\]|[^/\n\\])+\/[a-z]*/gm) ?? []).join(" ");

const violations: string[] = [];
const files = [
  ...readdirSync(resolve(majalisRoot, "src/lib/__tests__"))
    .filter((f) => f.endsWith(".ts") && f !== "no-source-pinned-component-names.test.ts")
    .map((f) => `src/lib/__tests__/${f}`),
  ...readdirSync(resolve(majalisRoot, "scripts"))
    .filter((f) => /^(test|verify)-.*\.mjs$/.test(f))
    .map((f) => `scripts/${f}`),
];
for (const f of files) {
  const lines = readFileSync(resolve(majalisRoot, f), "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*assert\.(match|ok)\(/.test(lines[i])) continue;
    let depth = 0;
    let j = i;
    for (; j < lines.length; j++) {
      const t = stripLiterals(lines[j]);
      depth += (t.match(/\(/g) ?? []).length - (t.match(/\)/g) ?? []).length;
      if (depth <= 0) break;
    }
    const stmt = lines.slice(i, j + 1).join("\n");
    if (/assert\.ok\(\s*!/.test(stmt)) continue;
    if (nameRe.test(regexLiterals(stmt)) || (/existsSync\(/.test(stmt) && nameRe.test(stmt))) violations.push(`${f}:${i + 1}`);
  }
}

assert.deepEqual(
  violations,
  [],
  `اختبار مصدري يثبّت اسم مكوّن قديم — تحقّق من السلوك أو أزل التثبيت:\n${violations.slice(0, 20).join("\n")}`,
);
console.log(`no-source-pinned-component-names.test.ts: ok (${files.length} ملف، ${names.length} اسمًا قديمًا)`);
