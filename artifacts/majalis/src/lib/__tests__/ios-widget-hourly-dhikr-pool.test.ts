import assert from "node:assert/strict";
import test from "node:test";
import { buildHourlyDhikrPool, safeDailyDua } from "../plugins/sunnah-widget-envelope-publish";
import { ADHKAR_ITEMS } from "../adhkar-seed";
import { DAILY_TICKER_DHIKR } from "../daily-ticker-dhikr";
import { isBlockedFromPublic } from "../content-display-zones";

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

test("بطاقة «دعاء» وذكر الساعة: لا ضعيف ولا «لم يثبت» (adh-157/161/171)", () => {
  const weakIds = new Set(["adh-157", "adh-161", "adh-171"]);
  const weak = DAILY_TICKER_DHIKR.filter((d) => weakIds.has(d.id));
  assert.equal(weak.length, 3);
  for (const d of weak) assert.ok(isBlockedFromPublic(d), `${d.id} يجب أن يُحجب عن العرض العام`);
  const weakTexts = new Set(weak.map((d) => d.text.trim()));
  for (let day = 0; day < 400; day += 1) {
    const dua = safeDailyDua(new Date(Date.UTC(2026, 9, 1) + day * 86400000));
    assert.ok(!weakTexts.has(dua.text.trim()), `دعاء ضعيف ظهر في اليوم ${day}`);
    assert.ok(!isBlockedFromPublic(dua), `دعاء محجوب ظهر: ${dua.id}`);
  }
  for (const text of buildHourlyDhikrPool()) assert.ok(!weakTexts.has(text), "ذكر ضعيف في مجموعة الساعة");
  for (const item of ADHKAR_ITEMS) {
    if (buildHourlyDhikrPool().includes(item.text.trim())) assert.ok(!isBlockedFromPublic(item), item.id);
  }
});
