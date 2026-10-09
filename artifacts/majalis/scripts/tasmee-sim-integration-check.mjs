#!/usr/bin/env node
/**
 * مدقِّق ناتج scripts/tasmee-sim-integration.sh — يثبت الربط لا الدقة (المعايير لا تتغيّر هنا):
 *  1) ظهرت علامات «ok» على كلمات الصفحة (≥ حدٍّ أدنى)،
 *  2) أول تلوين لكل كلمة صحيحة جاء بترتيب الصفحة تصاعديًا تمامًا،
 *  3) نص الكلمة الملوَّنة في DOM = كلمة الصفحة في الفهرس نفسه، والتلوين يبدأ من أول الصفحة.
 *  4) أرقام لوحة القياس وصلت (نوافذ وكلمات صحيحة وأزمنة)،
 *  5) مع حقن خطأ (k:j): ظهرت علامة «wrong» قرب k، وكل خطأ جديد أطلق تنبيهًا واحدًا.
 * الوسائط: <result.json> [truth.json|-] [بداية-بالثواني] [k:j]
 */
import { readFileSync } from "node:fs";

const [resultPath, truthPath = "-", fromArg = "0", swap = ""] = process.argv.slice(2);
const r = JSON.parse(readFileSync(resultPath, "utf8"));
const firstOk = [];
const seen = new Set();
for (const e of r.events) {
  if (e.state !== "ok" || seen.has(e.index)) continue;
  seen.add(e.index);
  firstOk.push(e);
}
let expected = null;
if (truthPath !== "-") {
  const from = Number(fromArg) * 1000;
  const to = from + r.seconds * 1000;
  expected = JSON.parse(readFileSync(truthPath, "utf8")).filter((w) => w.startMs >= from && w.endMs <= to).length;
}
const minOk = Math.max(5, Math.floor((expected ?? 20) * 0.5));
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok, detail });

check("تلوين كلمات صحيحة", firstOk.length >= minOk, `${firstOk.length} كلمة (الحد الأدنى للربط ${minOk}${expected != null ? ` من ${expected} متلوّة في المقطع` : ""})`);
const order = firstOk.map((e) => e.index);
/* سماحية الترتيب (موثَّقة، لا تُوسَّع): المتتبّع يعلّق الكلمة المشتبهة ولا يحسمها إلا بعد confirmWords=2 كلمة تالية،
 * ثم قد يستردّها صحيحة (recoverSim=0.8، حدث correct مع recovered=true) فتُلوَّن بعد ما يليها. أقصى تأخر مشروع =
 * confirmWords + 1 = 3 كلمات خلف أعلى فهرس ملوَّن. ما زاد عن ذلك فشلٌ. السماحية مشتقة من معايير المتتبّع الثابتة
 * لا من نتيجة تشغيل؛ تغيير confirmWords يستلزم تغييرها هنا. (أول ظهور: تشغيل حقن 5:9، الكلمة 31 بعد 32 و33.) */
const CONFIRM_WORDS = 2;
const RECOVER_WINDOW = CONFIRM_WORDS + 1;
const recovered = [];
const outOfOrder = [];
order.forEach((v, i) => {
  const max = Math.max(-1, ...order.slice(0, i));
  if (i === 0 || v > max) return;
  (max - v <= RECOVER_WINDOW ? recovered : outOfOrder).push(v);
});
check(
  "الترتيب تصاعدي",
  outOfOrder.length === 0,
  outOfOrder.length ? `خارج الترتيب: ${outOfOrder.join(",")}` : `${order[0]}→${order.at(-1)}${recovered.length ? ` (استرداد متأخر: ${recovered.join(",")})` : ""}`,
);
check("يبدأ من أول الصفحة", order[0] === 0, `أول فهرس ملوَّن ${order[0]}`);
const textMismatch = firstOk.filter((e) => r.words[e.index] !== e.text);
check("نص DOM = كلمة الصفحة", textMismatch.length === 0, textMismatch.length ? `${textMismatch.length} اختلاف` : "مطابق");

const st = r.stats;
check("أرقام لوحة القياس", st.windows > 0 && st.correct >= firstOk.length && st.latenciesMs.length > 0, `نوافذ ${st.windows}، صحيحة ${st.correct}، أزمنة ${st.latenciesMs.length}`);
const wrongIdx = new Set(r.events.filter((e) => e.state === "wrong").map((e) => e.index));
if (swap) {
  const k = Number(swap.split(":")[0]);
  check("حقن الخطأ يُوسَم", [...wrongIdx].some((i) => Math.abs(i - k) <= 2), `wrong عند ${[...wrongIdx].join(",") || "لا شيء"} (المحقون ${k})`);
}
check("تنبيه لكل خطأ جديد", r.alertsFired === wrongIdx.size, `تنبيهات ${r.alertsFired} / أخطاء ${wrongIdx.size}`);

const wrong = r.events.filter((e) => e.state !== "ok");
const lat = firstOk.map((e) => e.tMs);
console.log(`الصفحة ${r.page} — ${r.seconds}ث — ${r.words.length} كلمة في الصفحة`);
console.log(`أول ٣٠ تلوينًا (فهرس:كلمة@ث): ${firstOk.slice(0, 30).map((e) => `${e.index}:${e.text}@${(e.tMs / 1000).toFixed(1)}`).join(" ")}`);
console.log(`علامات خطأ/تجاوز: ${wrong.length}${wrong.length ? " — " + wrong.map((e) => `${e.index}:${e.text}:${e.state}`).join(" ") : ""}`);
if (lat.length) console.log(`آخر تلوين عند ${(lat.at(-1) / 1000).toFixed(1)}ث`);
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.detail}`);
process.exit(checks.every((c) => c.ok) ? 0 : 1);
