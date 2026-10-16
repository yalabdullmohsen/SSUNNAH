import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// عقد: أي ملف يقرأ surah-%03d (نص Tanzil الخام) يجب أن يمرّره عبر QuranDisplayText.clean قبل العرض.
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../../artifacts/majalis/ios/App/SunnahNative/Sources");
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".swift") ? [p] : []; });

test("كل قارئ لـsurah-%03d يستعمل QuranDisplayText.clean", () => {
  const readers = walk(SRC).filter((f) => readFileSync(f, "utf8").includes("surah-%03d"));
  assert.ok(readers.length >= 4, `وُجد ${readers.length} قارئ فقط — تغيّر نمط التسمية؟`);
  const bad = readers.filter((f) => !/QuranDisplayText\.clean\(/.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad.map((f) => f.slice(SRC.length)), [], "قارئ نص Tanzil دون clean");
});
