// حارس: عناصر العقيدة pending_review تُستبعد من التصدير (فلا تصل البحث/الويدجت/الإشعارات).
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../../../", import.meta.url);
const { items } = JSON.parse(fs.readFileSync(new URL("docs/native/aqidah-pending-review.json", root), "utf8"));
const src = fs.readFileSync(new URL("artifacts/majalis/scripts/native/sections/aqidah.mjs", root), "utf8");

const keys = Object.keys(items);
assert.ok(keys.length >= 3, "القصص الثلاث المتعارضة يجب أن تبقى مخفية");
for (const k of keys) {
  assert.match(k, /^[a-z-]+\/[\w-]+$/, `مفتاح غير صالح: ${k}`);
  assert.ok(items[k].reason && /^\d{4}-\d{2}-\d{2}$/.test(items[k].since), `reason/since ناقصان: ${k}`);
}
// التصفية مطبَّقة في مسار الكتابة الوحيد للمجموعات
assert.match(src, /!pending\[`\$\{name\}\/\$\{it\.id\}`\]/, "writeGroups لا يصفّي pending_review");
console.log(`ok: ${keys.length} عنصرًا مخفيًا`);
assert.match(src, /ok\(l\.id, name\) && !pending\[`\$\{name\}\/\$\{l\.id\}`\]/, "حلقة الدروس لا تصفّي pending_review");
