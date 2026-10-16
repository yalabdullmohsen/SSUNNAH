// عقد: لا أرقام هندية في حقول المصدر في ios-native/Data (يُولَّد بـnative-export-data.sh)، ولا مساس بحقول النص.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { latinizeSources, toLatinDigits } from "./native/lib/latin-digits.mjs";

assert.equal(toLatinDigits("أبو داود ٤٩٠٣ ۵"), "أبو داود 4903 5");
const r = latinizeSources([{ title: "١", text: "آية ٢", source: "مسلم: ٦٥٧", sources: [{ label: "البخاري ١٣٥٨" }] }])[0];
assert.deepEqual([r.title, r.text, r.source, r.sources[0].label], ["١", "آية ٢", "مسلم: 657", "البخاري 1358"]);

const root = process.env.NATIVE_DATA_DIR ?? new URL("../../../ios-native/Data", import.meta.url).pathname;
const H = /[٠-٩۰-۹]/, KEYS = new Set(["source", "sources", "source_url", "sourceUrl", "reference", "references", "ref", "citation", "citations"]);
const bad = [];
const scan = (x, f, inSrc = false) => {
  if (typeof x === "string") { if (inSrc && H.test(x)) bad.push(`${f}: ${x.slice(0, 60)}`); }
  else if (Array.isArray(x)) x.forEach((i) => scan(i, f, inSrc));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) scan(v, f, inSrc || KEYS.has(k));
};
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!["mushaf", "tafsir", "quran"].includes(e.name)) walk(p); } else if (e.name.endsWith(".json") && e.name !== "MANIFEST.json") { try { const j = JSON.parse(fs.readFileSync(p, "utf8")), rel = p.slice(root.length + 1); scan(j, rel); scanBody(j, rel); } catch {} } } };
// سطور المصدر المدمجة في body (لا حقل مصدر مستقل): فوائد (آخر فقرة)، «المصدر: …» (فضائل الأعمال/التطبيقات/الأركان)، مراجع الأدلة بعد « — » في «من القرآن/من السنة». لا يمسّ المتن الحر ولا القرآن.
export const embeddedSourceLines = (rel, body) => {
  const paras = body.split("\n\n"), out = [];
  if (rel === "learn/fawaid.json" && paras.length > 1) out.push(paras[paras.length - 1]);
  let inDalil = false;
  for (const l of body.split("\n")) {
    if (/^المصدر\s*:/.test(l)) out.push(l);
    if (/^من (القرآن|السنة):$/.test(l)) { inDalil = true; continue; }
    if (inDalil) { const i = l.lastIndexOf(" — "); if (i < 0) inDalil = false; else out.push(l.slice(i + 3)); }
  }
  return out;
};
assert.deepEqual(embeddedSourceLines("learn/fawaid.json", "نص ٢٢\n\nالبخاري (٦٤٥)"), ["البخاري (٦٤٥)"]);
assert.deepEqual(embeddedSourceLines("fiqh/x.json", "متن ٣\n\nالمصدر: مسلم ٤٨٢\n\nمن السنة:\nنص ٥ — الترمذي ٢٣٣٦"), ["المصدر: مسلم ٤٨٢", "الترمذي ٢٣٣٦"]);
const scanBody = (x, f) => {
  if (Array.isArray(x)) x.forEach((i) => scanBody(i, f));
  else if (x && typeof x === "object") { if (typeof x.body === "string") for (const l of embeddedSourceLines(f, x.body)) if (H.test(l)) bad.push(`${f} [body ${x.id ?? "?"}]: ${l.slice(0, 60)}`); for (const v of Object.values(x)) if (typeof v === "object") scanBody(v, f); }
};
if (fs.existsSync(root)) walk(root); else console.log("ios-native/Data غير مُولَّد — تخطٍّ لفحص الملفات");
assert.equal(bad.length, 0, `أرقام هندية في حقول المصدر وسطوره المدمجة في body (${bad.length}):\n${bad.slice(0, 10).join("\n")}`);
// وسوم التوثيق بالعربية (مصدر واحد: lib/tag-labels.mjs) لا مفاتيح إنجليزية في Data
{
  const { arabicTags, TAG_LABELS } = await import("./native/lib/tag-labels.mjs");
  assert.deepEqual(arabicTags({ tags: ["العقيدة", "verified", "scholarly_source", "complete_ayah"] }).tags, ["العقيدة", TAG_LABELS.verified, TAG_LABELS.scholarly_source, "complete_ayah"]);
  const f = root + "/learn/fawaid.json";
  if (fs.existsSync(f)) { const left = JSON.parse(fs.readFileSync(f, "utf8")).flatMap((r) => r.tags ?? []).filter((t) => Object.hasOwn(TAG_LABELS, t)); assert.equal(left.length, 0, `وسوم إنجليزية في learn/fawaid.json: ${[...new Set(left)]}`); }
}
console.log("OK latin-digits");
