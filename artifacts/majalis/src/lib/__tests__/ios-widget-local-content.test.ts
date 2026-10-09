/**
 * محتوى «آية أو دعاء» المضمَّن في الودجت يجب أن يطابق المصدرين الحاكمين حرفيًا (لا انحراف ولا نص مكتوب يدويًا).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCAL_CONTENT_SWIFT, spliceGenerated, localAyahs, localDuas, DUA_MAX_WORDS } from "../../../scripts/gen-widget-local-content";

const swift = readFileSync(LOCAL_CONTENT_SWIFT, "utf8");
assert.equal(spliceGenerated(swift), swift, "الملف منحرف عن المصدر: node --import tsx scripts/gen-widget-local-content.ts");

assert.ok(localAyahs().length >= 10, "مخزون الآيات صغير");
assert.ok(localDuas().length >= 5, "مخزون الأدعية صغير");
for (const d of localDuas()) {
  assert.ok(d.text.trim().split(/\s+/).length <= DUA_MAX_WORDS, `دعاء أطول من الحد: ${d.text}`);
}
assert.ok(!/لَعَلَّ|قال رسول/.test(swift.split("END GENERATED")[0]), "لا حديث في المحتوى");
console.log("ios-widget-local-content: ok", localAyahs().length, "ayahs", localDuas().length, "duas");
