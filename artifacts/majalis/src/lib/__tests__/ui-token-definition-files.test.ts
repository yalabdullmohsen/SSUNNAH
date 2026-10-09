/**
 * حارس: الملفات المستثناة من عدّ hexOutsideTokens (ui-token-definition-files.mjs)
 * يجب أن تحوي لونًا خامًا داخل تصريح متغيّر فقط (--name: #hex)، لا استعمالًا خامًا.
 * تشغيل: node --import tsx src/lib/__tests__/ui-token-definition-files.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error — وحدة mjs
import { TOKEN_DEFINITION_FILES, hexOutsideDeclarations } from "../../../scripts/ui-token-definition-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

assert.ok(TOKEN_DEFINITION_FILES.length > 0);
for (const rel of TOKEN_DEFINITION_FILES as string[]) {
  assert.ok(existsSync(resolve(root, rel)), `ملف غير موجود: ${rel}`);
  const raw = hexOutsideDeclarations(readFileSync(resolve(root, rel), "utf8"));
  assert.equal(raw, 0, `${rel}: ${raw} لون خام خارج تصريح متغيّر — أخرجه من القائمة أو حوّله إلى رمز`);
}

// الكاشف نفسه: يلتقط الاستعمال الخام ولا يعدّ التعريف
assert.equal(hexOutsideDeclarations(".a{color:#fff}"), 1);
assert.equal(hexOutsideDeclarations(":root{--x:#fff;--y:#000}"), 0);
assert.equal(hexOutsideDeclarations(":root{--x:#fff}.a{background:#123456}"), 1);
assert.equal(hexOutsideDeclarations("/* #fff */:root{--x:#fff}"), 0);
console.log("ui-token-definition-files: ok");
