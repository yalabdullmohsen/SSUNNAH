/**
 * بوابة جودة الويدجت قبل أي إصدار — تشغيل: node --import tsx src/lib/__tests__/ios-widget-quality-gate.test.ts
 * تحرس: دعم الوضع الملوّن، عدم قطع النص الشرعي بلا تنبيه، عمق المحتوى اليومي، وسقف عدد الويدجت في المعرض.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../../../", import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, root), "utf8");
const dir = "ios/App/PrayerWidget/";
const swiftFiles = readdirSync(new URL(dir, root)).filter((f) => f.endsWith(".swift"));

// 1) الوضع الملوّن (iOS 18 Tinted): كل ما بالذهبي يُعلَّم widgetAccentable
const GOLD = "foregroundStyle(SunnahBrandColors.gold)";
for (const f of swiftFiles) {
  const s = read(dir + f);
  const gold = s.split(GOLD).length - 1;
  const accent = s.split(".widgetAccentable()").length - 1;
  assert.ok(accent >= gold, `${f}: ${gold} عنصرًا ذهبيًا و${accent} widgetAccentable فقط — الوضع الملوّن سيُسطّحها`);
}

// 2) نص الحديث/الفائدة لا يُقطع بصمت
const spot = read(dir + "SunnahContentExperienceCatalog.swift");
assert.match(spot, /@Environment\(\\\.widgetFamily\)/, "SpotlightContentView يجب أن يتكيّف مع حجم الويدجت");
assert.ok(spot.includes("تتمة النص في التطبيق"), "يجب تنبيه المستخدم حين يتجاوز النص ما يتسع");
assert.ok(!/\.lineLimit\(6\)\s*\n\s*if let source/.test(spot), "عاد lineLimit(6) الثابت");

// 3) عمق المحتوى اليومي (لا يتكرر خلال أسابيع)
const pool = JSON.parse(read("src/data/widget-daily-pool.generated.json"));
assert.ok(pool.hadiths.length >= 200, `أحاديث الويدجت ${pool.hadiths.length} < 200`);
assert.ok(pool.ayahs.length >= 150, `آيات الويدجت ${pool.ayahs.length} < 150`);
for (const h of pool.hadiths) assert.ok(h.grade === "صحيح" && h.narrator && h.source, `حديث ناقص التوثيق ${h.id}`);

// 4) الحديث يُنشر بنسبته (راوٍ · مصدر · حكم) لا بالمصدر وحده
const pub = read("src/lib/plugins/sunnah-widget-envelope-publish.ts");
assert.ok(pub.includes("hadithSource: formatHadithAttribution(hadith)"), "عاد نشر المصدر بلا راوٍ وحكم");

// 5) سقف المعرض: لا يزيد عدد الويدجت عن الحالي (الازدحام يضعف الاختيار)
const bundle = read(dir + "PrayerWidgetBundle.swift");
const count = (bundle.match(/^\s{8}[A-Z]\w+Widget\(\)\s*$/gm) ?? []).length;
assert.ok(count <= 32, `عدد الويدجت ${count} > 32 — ادمج المتشابه بدل الإضافة`);

console.log(`ios-widget-quality-gate: OK — ${count} ويدجت، ${pool.ayahs.length} آية، ${pool.hadiths.length} حديثًا`);
