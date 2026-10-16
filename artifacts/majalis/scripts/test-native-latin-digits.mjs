// عقد: لا أرقام هندية في حقول المصدر في ios-native/Data (يُولَّد بـnative-export-data.sh)، ولا مساس بحقول النص.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { latinizeSources, toLatinDigits } from "./native/lib/latin-digits.mjs";

assert.equal(toLatinDigits("أبو داود ٤٩٠٣ ۵"), "أبو داود 4903 5");
const r = latinizeSources([{ title: "١", text: "آية ٢", source: "مسلم: ٦٥٧", sources: [{ label: "البخاري ١٣٥٨" }] }])[0];
assert.deepEqual([r.title, r.text, r.source, r.sources[0].label], ["١", "آية ٢", "مسلم: 657", "البخاري 1358"]);

const root = new URL("../../../ios-native/Data", import.meta.url).pathname;
const H = /[٠-٩۰-۹]/, KEYS = new Set(["source", "sources", "source_url", "sourceUrl", "reference", "references", "ref", "citation", "citations"]);
const bad = [];
const scan = (x, f, inSrc = false) => {
  if (typeof x === "string") { if (inSrc && H.test(x)) bad.push(`${f}: ${x.slice(0, 60)}`); }
  else if (Array.isArray(x)) x.forEach((i) => scan(i, f, inSrc));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) scan(v, f, inSrc || KEYS.has(k));
};
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!["mushaf", "tafsir", "quran"].includes(e.name)) walk(p); } else if (e.name.endsWith(".json") && e.name !== "MANIFEST.json") { try { scan(JSON.parse(fs.readFileSync(p, "utf8")), p.slice(root.length + 1)); } catch {} } } };
if (fs.existsSync(root)) walk(root); else console.log("ios-native/Data غير مُولَّد — تخطٍّ لفحص الملفات");
assert.equal(bad.length, 0, `أرقام هندية في حقول المصدر (${bad.length}):\n${bad.slice(0, 10).join("\n")}`);
console.log("OK latin-digits");
