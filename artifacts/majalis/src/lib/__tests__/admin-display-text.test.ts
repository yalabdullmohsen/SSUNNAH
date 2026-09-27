/**
 * تشغيل: node --import tsx src/lib/__tests__/admin-display-text.test.ts
 */
import assert from "node:assert/strict";
import {
  decodeLiteralUnicodeEscapes,
  hasLiteralUnicodeEscapes,
  normalizeAdminDisplayText,
  normalizeAdminDisplayTree,
} from "@/lib/admin-display-text";

assert.equal(hasLiteralUnicodeEscapes("قسم فارغ"), false);
assert.equal(hasLiteralUnicodeEscapes("\\u0642\\u0633\\u0645"), true);

assert.equal(decodeLiteralUnicodeEscapes("\\u0642\\u0633\\u0645 \\u0641\\u0627\\u0631\\u063a"), "قسم فارغ");
assert.equal(normalizeAdminDisplayText("\\u0645\\u0631\\u0627\\u062c\\u0639\\u0629"), "مراجعة");
assert.equal(normalizeAdminDisplayText("نص عربي"), "نص عربي");
assert.equal(normalizeAdminDisplayText(null), "");

const tree = normalizeAdminDisplayTree({
  title: "\\u0627\\u0644\\u062f\\u0631\\u0648\\u0633",
  nested: { ok: true, label: "\\u0645\\u0634\\u0627\\u064a\\u062e" },
});
assert.equal(tree.title, "الدروس");
assert.equal(tree.nested.label, "مشايخ");

console.log("admin-display-text.test.ts: ok");
