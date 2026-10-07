#!/usr/bin/env node
/**
 * يبني مخزون «آية/حديث اليوم» للويدجت من مصادر المشروع الموثّقة — لا نصوص تُكتب يدويًا:
 *  - الآيات: مفاتيح منتقاة يدويًا (آيات تُفهم منفردة) والنص من public/data/quran-v2/pages (text_uthmani) حرفيًا؛ ترتيب الدوران بالـhash.
 *  - الأحاديث: public/data/hadith-verified/sahih-*.json، الدرجة «صحيح» حرفيًا فقط، براوٍ ومصدر، وبنص كامل ≤200 حرف.
 * الناتج: src/data/widget-daily-pool.generated.json — يُتحقق منه بـ test:widget-daily-pool.
 * تشغيل: node scripts/build-widget-daily-pool.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = join(root, "public/data");
const OUT = join(root, "src/data/widget-daily-pool.generated.json");
const MIN_AYAH = 150; // ≈5 أشهر بلا تكرار (مع المخزون القديم الذي يبقى احتياطًا)
const SEED = "sunnah-widget-pool-v1";

const h = (s) => createHash("sha1").update(`${SEED}:${s}`).digest("hex");
const toAr = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// ── الآيات ──────────────────────────────────────────────
// الاختيار يدوي لآيات تُفهم منفردة (ذكر، دعاء، وعد، خُلق، توحيد) — الترشيح الآلي بالكلمات لا يكفي لعزل
// كلام الكفار/الجن أو الآيات المبتورة عن سياقها. النص نفسه يُقرأ حرفيًا من المصحف المعتمد، لا يُكتب يدويًا.
// ⚠️ قائمة المفاتيح تحتاج مراجعة المالك قبل التوسّع؛ أضف/احذف مفتاحًا ثم أعد التشغيل.
const AYAH_KEYS = [
  "2:45", "2:152", "2:153", "2:186", "2:195", "2:208", "2:245", "2:263",
  "2:268", "2:269", "2:274", "2:281", "3:8", "3:31", "3:92", "3:133",
  "3:134", "3:139", "3:200", "4:28", "4:79", "4:110", "4:147", "5:35",
  "6:17", "6:162", "7:56", "7:199", "7:201", "8:46", "9:51", "9:119",
  "10:57", "10:58", "10:62", "11:114", "11:115", "13:28", "14:7", "14:34",
  "14:40", "15:49", "15:97", "15:98", "16:18", "16:53", "16:96", "16:128",
  "17:9", "17:36", "17:53", "17:78", "17:80", "17:81", "17:82", "17:84",
  "18:7", "18:46", "18:109", "19:96", "20:14", "20:82", "20:114", "20:132",
  "21:35", "21:107", "22:77", "23:2", "23:62", "23:97", "23:118", "24:30",
  "24:52", "25:63", "25:67", "25:74", "25:77", "26:80", "26:83", "26:89",
  "27:62", "28:88", "29:57", "29:64", "29:69", "30:41", "30:60", "31:14",
  "31:17", "31:18", "31:19", "31:22", "32:16", "33:21", "33:41", "33:56",
  "33:70", "33:71", "35:5", "35:15", "35:29", "36:82", "39:54", "39:61",
  "40:51", "40:55", "40:60", "40:65", "41:34", "41:35", "42:19", "42:20",
  "42:25", "42:30", "42:36", "42:40", "42:43", "47:7", "47:19", "47:31",
  "49:10", "50:16", "51:56", "51:55", "53:39", "53:42", "55:27", "55:60",
  "57:22", "57:23", "59:18", "59:19", "59:22", "59:24", "61:10", "61:11",
  "61:13", "62:10", "63:9", "64:11", "64:15", "64:16", "64:17", "67:1",
  "67:2", "67:3", "67:15", "67:19", "67:23", "67:30", "68:4", "73:8",
  "73:9", "75:36", "76:30", "79:40", "87:15", "88:17", "89:28", "91:9",
  "92:20", "93:3", "93:4", "93:5", "93:6", "93:9", "93:10", "93:11",
  "94:5", "94:6", "95:4", "95:6", "96:1", "96:5", "97:3", "98:5",
  "98:7", "99:7", "103:2", "103:3", "110:3", "112:4"
];
const chapters = new Map(readJson(join(data, "quran-v2/chapters.json")).map((c) => [c.id, c.name_arabic]));
const found = new Map();
for (const f of readdirSync(join(data, "quran-v2/pages")).sort()) {
  for (const v of readJson(join(data, "quran-v2/pages", f))) {
    if (!AYAH_KEYS.includes(v.verse_key)) continue;
    found.set(v.verse_key, v.words.filter((w) => w.char_type_name === "word").map((w) => w.text_uthmani).join(" "));
  }
}
const missing = AYAH_KEYS.filter((k) => !found.has(k));
if (missing.length) { console.error("مفاتيح غير موجودة في المصحف:", missing.join(" ")); process.exit(1); }
const ayahs = [...new Set(AYAH_KEYS)]
  .sort((x, y) => h(x).localeCompare(h(y))) // ترتيب دوران حتمي يبدو عشوائيًا
  .map((key) => {
    const [s, a] = key.split(":").map(Number);
    return {
      id: `wa-${s}-${a}`,
      key,
      surah: `سورة ${chapters.get(s)}`,
      ayahNumber: a,
      text: found.get(key),
      reference: `القرآن الكريم — ${s}:${a}`,
      label: `${chapters.get(s)}: ${toAr(a)}`,
    };
  });

// ── الأحاديث ────────────────────────────────────────────
const hadiths = [];
for (const f of readdirSync(join(data, "hadith-verified")).filter((n) => /^sahih-\d+\.json$/.test(n)).sort()) {
  for (const r of readJson(join(data, "hadith-verified", f))) {
    if (r.grade !== "صحيح" || !r.narrator || !r.source_name || !r.text) continue;
    const t = String(r.text).trim();
    if (t.length < 25 || t.length > 200) continue;
    hadiths.push({
      id: String(r.id),
      text: t,
      narrator: String(r.narrator).trim(),
      source: String(r.source_name).trim(),
      grade: r.grade,
      meaning: String(r.explanation || "").trim(),
    });
  }
}
const picked = hadiths.sort((x, y) => h(x.id).localeCompare(h(y.id)));
const MIN_HADITH = 200; // الأحاديث الصحيحة الكاملة (راوٍ + مصدر + ≤200 حرف) أقل من الآيات؛ يكفي ≈8 أشهر بلا تكرار

if (ayahs.length < MIN_AYAH || picked.length < MIN_HADITH) {
  console.error(`مخزون غير كافٍ: ayahs=${ayahs.length} hadiths=${picked.length} (المطلوب آيات ${MIN_AYAH}، أحاديث ${MIN_HADITH})`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify({ version: 1, seed: SEED, ayahs, hadiths: picked }, null, 1) + "\n");
console.log(`widget-daily-pool: ${ayahs.length} آية، ${picked.length} حديثًا → ${OUT}`);
