import fs from "node:fs"; import { ROOT, sk1, findQuran } from "./lib.mjs";
const rows = JSON.parse(fs.readFileSync("db-adhkar-full.json", "utf8"));
const L = (t) => String(t).replace(/[^ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىي]/g, "");
const C = {};
for (const c of ["bukhari", "muslim"]) { const j = JSON.parse(fs.readFileSync(`${ROOT}/public/data/hadith/${c}.json`, "utf8")); C[c] = (Array.isArray(j) ? j : Object.values(j).find(Array.isArray)).map((h) => ({ n: h.n, t: h.t, l: L(h.t), s: sk1(h.t) })); }
const strip = (t) => t.replace(/[ً-ْٰـ‏]/g, "");
const groups = new Map();
for (const r of rows) { const k = L(r.text); if (!groups.has(k)) groups.set(k, { text: r.text, ids: [] }); groups.get(k).ids.push(r.id); }
const out = [];
for (const [k, g] of groups) {
  const isQuran = /^بسم الله الرحمن الرحيم|^الله لا إله إلا هو الحي القيوم|^آمن الرسول/.test(strip(g.text)) && findQuran(g.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ،\s*/, "")).found;
  const words = strip(g.text).split(/\s+/).length;
  const exact = [], ortho = [];
  if (!isQuran) for (const c of ["bukhari", "muslim"]) for (const h of C[c]) { if (h.l.includes(k)) exact.push({ c, n: h.n, h }); else if (h.s.includes(sk1(g.text))) ortho.push({ c, n: h.n, h }); }
  out.push({ ...g, isQuran, words, exact, ortho });
}
const fmt = (m, text) => {
  const plain = strip(m.h.t).replace(/\s+/g, " ");
  const first = strip(text).replace(/[.،,]/g, "").split(/\s+/)[0];
  const i = plain.indexOf(first);
  return `${m.c === "bukhari" ? "البخاري" : "مسلم"} ${m.n}: «…${plain.slice(Math.max(0, i), Math.max(0, i) + Math.min(220, strip(text).length + 40))}…»`;
};
const lines = [];
let nFound = 0, nShort = 0, nNot = 0, nQ = 0;
out.forEach((g, i) => {
  const ids = g.ids.join("، ");
  if (g.isQuran) { nQ += g.ids.length; lines.push({ k: "q", s: `${ids}\n   النص: ${g.text}\n   آيات قرآنية لا حديث؛ لم يُبحث في متن الحديث. (طوبقت سابقًا على المصحف المقفول رسمًا).` }); return; }
  const all = [...g.exact.map((m) => ({ ...m, kind: "حرفي" })), ...g.ortho.map((m) => ({ ...m, kind: "حرفي بعد توحيد الهمزة والألف المقصورة والتاء المربوطة" }))];
  if (!all.length) { nNot += g.ids.length; lines.push({ k: "n", s: `${ids}\n   النص: ${g.text}\n   لم يوجد نصه حرفيًا في البخاري ولا مسلم (المتن المحفوظ في المستودع).` }); return; }
  if (g.words <= 3 || all.length > 6) { nShort += g.ids.length; lines.push({ k: "s", s: `${ids}\n   النص: ${g.text}\n   عبارة قصيرة توجد حرفيًا في ${all.length} موضعًا (منها ${all.slice(0, 3).map((m) => (m.c === "bukhari" ? "البخاري " : "مسلم ") + m.n).join("، ")}…)؛ وجودها حرفيًا لا يحدد حديثًا بعينه، فلا تُنسب آليًا.` }); return; }
  nFound += g.ids.length;
  lines.push({ k: "f", s: `${ids}\n   النص: ${g.text}\n   وُجد (${all[0].kind}) في:\n${all.map((m) => "     - " + fmt(m, g.text) + (m.kind !== "حرفي" ? " [بعد توحيد الإملاء]" : "")).join("\n")}` });
});
fs.writeFileSync("adh51-result.json", JSON.stringify({ lines, nFound, nShort, nNot, nQ }, null, 1));
console.log({ groups: out.length, nFound, nShort, nNot, nQ });
for (const l of lines) console.log("[" + l.k + "] " + l.s.slice(0, 400) + "\n");
