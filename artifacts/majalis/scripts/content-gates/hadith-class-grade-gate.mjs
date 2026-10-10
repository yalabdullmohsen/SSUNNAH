#!/usr/bin/env node
/**
 * بوابة تناقض فئة الحديث وحكمه + غياب اسم المحكِّم (ن7).
 * - فئة daif/mawdu بحكم يبدأ بـ«صحيح/حسن» (أو sahih بحكم ضعيف) = تناقض: يجب أن يكون المعرّف في content-hold.json.
 * - حديث ضعيف/موضوع بلا اسم محكِّم مسمّى: مسموح فقط إن كان في content/hadith-no-grader-baseline.json (السقف يُخفَّض ولا يُرفع).
 * الاستخدام: node scripts/content-gates/hadith-class-grade-gate.mjs [--write-baseline]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "public/data/hadith-verified");
const HOLD = JSON.parse(fs.readFileSync(path.join(ROOT, "content/content-hold.json"), "utf8"));
const BASE_FILE = path.join(ROOT, "content/hadith-no-grader-baseline.json");
const held = new Set(HOLD.holds.map((h) => h.id));

const GENERIC = /كتب|نقاد|أهل العلم|العلماء|المحدث|الحفاظ|جمع/;
const GRADERS =
  /الألباني|ابن حجر|السيوطي|الذهبي|ابن الجوزي|ابن تيمية|ابن القيم|الصنعاني|العراقي|ابن عدي|العقيلي|الدارقطني|ابن معين|أحمد|البخاري|مسلم|الترمذي|أبو حاتم|أبو داود|النسائي|النووي|الشوكاني|المناوي|ابن كثير|البيهقي|الحاكم|ابن حبان|ابن عبد البر|الهيثمي|ابن الملقن|الزيلعي|ابن عراق|الفتني|الصغاني|ابن باز|ابن عثيمين|الخطيب|ابن رجب|السخاوي|الزرقاني|العجلوني|ابن الصلاح|ابن خزيمة|المنذري|الزركشي|الشعيب|الأرناؤوط|أحمد شاكر|ابن القطان|ابن عساكر|ابن ماجه/;

export function contradicts(h) {
  const g = (h.grade || "").trim();
  if (h.authenticity_class === "sahih") return /(^|[\s—،(])(ضعيف|موضوع|منكر|واه)/.test(g);
  return /^(صحيح|حسن)/.test(g);
}
export function hasNamedGrader(h) {
  const m = h.metadata?.muhaddith;
  if (m && !GENERIC.test(m) && GRADERS.test(m)) return true;
  return GRADERS.test([h.source_name, h.explanation, h.grade].filter(Boolean).join(" "));
}

const items = fs
  .readdirSync(DIR)
  .filter((f) => /^(daif|mawdu|sahih)-.*\.json$/.test(f))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));

const contra = items.filter(contradicts).map((h) => h.id);
const noGrader = items
  .filter((h) => h.authenticity_class !== "sahih" && !contradicts(h) && !hasNamedGrader(h))
  .map((h) => h.id);

if (process.argv.includes("--write-baseline")) {
  fs.writeFileSync(BASE_FILE, JSON.stringify({ about: "ضعيف/موضوع بلا محكِّم مسمّى — يُخفَّض فقط", ids: noGrader.sort() }, null, 1) + "\n");
  console.log(`baseline: ${noGrader.length}`);
  process.exit(0);
}
const base = new Set(JSON.parse(fs.readFileSync(BASE_FILE, "utf8")).ids);
const errors = [
  ...contra.filter((id) => !held.has(id)).map((id) => `${id}: تناقض فئة/حكم وليس في content-hold`),
  ...noGrader.filter((id) => !base.has(id)).map((id) => `${id}: ضعيف/موضوع بلا اسم محكِّم (أضف المحكِّم أو الحقل metadata.muhaddith)`),
];
if (errors.length) {
  console.error(errors.slice(0, 30).join("\n"));
  process.exit(1);
}
console.log(`ok: تناقض=${contra.length} (محجوب) بلا محكِّم=${noGrader.length} (ضمن السقف)`);
