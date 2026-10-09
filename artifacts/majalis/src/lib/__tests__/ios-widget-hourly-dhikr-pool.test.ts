import assert from "node:assert/strict";
import test from "node:test";
import { buildHourlyDhikrPool } from "../plugins/sunnah-widget-envelope-publish";
import { ADHKAR_ITEMS } from "../adhkar-seed";

test("مجموعة ذكر الساعة: ≤6 كلمات، حرفية من الأذكار المعتمدة، بلا تكرار ولا آيات", () => {
  const pool = buildHourlyDhikrPool();
  assert.ok(pool.length >= 10, "مجموعة كافية للتدوير الساعي");
  assert.equal(new Set(pool).size, pool.length);
  const bySource = new Map(ADHKAR_ITEMS.map((i) => [i.text.trim(), i]));
  for (const text of pool) {
    assert.ok(text.split(/\s+/).length <= 6, text);
    const item = bySource.get(text);
    assert.ok(item, `النص يجب أن يطابق عنصرًا معتمدًا حرفيًا: ${text}`);
    assert.ok(!/^سورة/.test(item.source ?? ""), "لا آيات خارج ودجت الآية");
    assert.ok(!/[٠-٩]/.test(text), "لا أرقام هندية");
  }
});
