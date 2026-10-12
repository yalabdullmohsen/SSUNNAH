import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("q-findings.json", "utf8"));
const STOP = /^(يا|ان|إن|أن|لا|ما|من|الا|ألا|إلا|او|أو|ذا|يوميذ|يومئذ|ابن|ام|و|في|فيما)$/;
const cls = (x) => {
  if (x.kind.startsWith("عزو")) return "ref";
  const miss = (x.missing || "").split("، ").filter(Boolean);
  if (x.similarity >= 90 && miss.every((w) => STOP.test(w))) return "rasm";
  if (/hadith-verified|verified_hadith|hadith_banks|daif_mawdu/.test(x.file)) return "inhadith";
  if (x.how === "{}" && (/["'|?$]|[A-Za-z]/.test(x.quote) || x.quote.trim().split(/\s+/).length < 3)) return "noise";
  if (x.how === "{}" && x.similarity < 45) return /public\/data|\/content\//.test(x.file) ? "notQuranBrace" : "noise";
  if (x.how === "قال تعالى" && x.similarity < 45) return "notQuran";
  return "crit";
};
const shown = (x) => (/demo-quiz/.test(x.id || "") ? "لا (سؤال تجريبي demo مستبعد من العرض)" : /\/archive\/|content\/archive/.test(x.file) ? "لا (أرشيف)" : "نعم/محتمل");
const rows = []; const g = {};
const seen = new Set();
for (const x of a) {
  const c = cls(x); g[c] = (g[c] || 0) + 1;
  const key = [x.file, x.id, x.line, x.quote].join("|"); if (seen.has(key)) continue; seen.add(key);
  if (!["crit", "ref", "notQuran", "notQuranBrace"].includes(c)) continue;
  rows.push({ c, file: x.file, id: x.id || (x.line ? `س${x.line}` : ""), field: x.field || "", how: x.how, quote: x.quote, cited: x.cited || "", nearest: x.nearest || x.actual || "", sim: x.similarity ?? "", proposed: c === "ref" ? x.proposed : x.similarity >= 45 ? `(${x.nearest}) ${x.proposed}` : x.proposed, shown: shown(x), sev: c === "ref" ? "حرج" : c === "notQuran" || c === "notQuranBrace" ? "حرج (يحتاج مراجعة: نص بين علامتي اقتباس القرآن لا يشبه آية — قد يكون حديثًا أو كلامًا)" : "حرج" });
}
const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
fs.writeFileSync("q-critical.csv", "﻿" + ["النوع,الملف,المعرّف,الحقل,صيغة الاقتباس,النص المخالف,المرجع المكتوب,الموضع الأقرب/الفعلي,التشابه%,النص الصحيح المقترح (Tanzil),معروض للعامة,الخطورة"].concat(rows.map((r) => [r.c === "ref" ? "عزو آية خاطئ" : r.c === "notQuran" || r.c === "notQuranBrace" ? "بين علامتي القرآن ولا يشبه آية" : "نص منسوب للقرآن ليس فيه", r.file, r.id, r.field, r.how, r.quote, r.cited, r.nearest, r.sim, r.proposed, r.shown, r.sev].map(esc).join(","))).join("\n"));
console.log(g, "rows", rows.length);
const byFile = {}; rows.forEach((r) => (byFile[r.file] = (byFile[r.file] || 0) + 1)); console.log(Object.entries(byFile).sort((x, y) => y[1] - x[1]).slice(0, 40).map(([f, n]) => n + " " + f).join("\n"));
const shownN = rows.filter((r) => r.shown.startsWith("نعم")).length; console.log("shown", shownN);
