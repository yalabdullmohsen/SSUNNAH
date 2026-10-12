import fs from "node:fs"; import { align } from "./align.mjs"; import { quran } from "./lib.mjs";
const Q = quran(); const sname = (s) => Q.ayahs.find((x) => x.s === s && x.a === 1).name.replace(/^سُورَةُ\s*/, "");
const parse = (t) => { const rows = []; let row = [], f = "", q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; } else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else f += c; } if (f || row.length) { row.push(f); rows.push(row); } return rows; };
const rows = parse(fs.readFileSync("q-critical.csv", "utf8").replace(/^﻿/, "")).slice(1).filter((r) => r.length > 5);
const ord = { "نص منسوب للقرآن ليس فيه": 0, "عزو آية خاطئ": 1, "بين علامتي القرآن ولا يشبه آية": 2 };
rows.sort((a, b) => (a[10].startsWith("نعم") ? 0 : 1) - (b[10].startsWith("نعم") ? 0 : 1) || ord[a[0]] - ord[b[0]] || a[1].localeCompare(b[1]));
const out = [];
rows.forEach((r, i) => {
  const [type, file, id, , how, quote, cited, near, sim] = r;
  const f = file.replace("artifacts/majalis/", "");
  const where = `${f}${id ? " — " + id : ""}${r[10].startsWith("نعم") ? "" : " (سؤال demo غير معروض)"}`;
  let fix;
  if (type === "عزو آية خاطئ") {
    const m = near.match(/^(\d+):(\d+)(?:-(\d+))?/);
    const cm = cited.match(/\(=(\d+):([\d-]+)\)/);
    fix = `النص صحيح لكن المرجع خاطئ: المكتوب «${cm ? sname(+cm[1]) + ": " + cm[2] : cited}» والصحيح «${sname(+m[1])}: ${m[2]}${m[3] ? "-" + m[3] : ""}»`;
  } else if (type === "بين علامتي القرآن ولا يشبه آية") {
    fix = "ليس آية (حديث أو كلام شارح) ووُضع بين علامتي القرآن: تُزال {} أو ﴿﴾ ويُكتب بين «» أو بلا أقواس";
  } else if (/لِلْإِنْثَىٰ/.test(quote)) {
    const a = align("للذكر مثل حظ الأنثيين", "4:11");
    fix = `لا آية بهذا اللفظ؛ يحتاج مراجعة بشرية لتحديد الدليل. الآية في الباب: ﴿${a.text}﴾ (${a.ref})`;
  } else {
    const tf = (id.match(/تفسير (\d+):(\d+)/) || []);
    const cands = [];
    if (tf[1]) for (let d = -2; d <= 2; d++) { const k = +tf[2] + d; if (k > 0) cands.push(`${tf[1]}:${k}`); }
    if (near) cands.push(near);
    if (/لِيُنفِقْ ذُو/.test(quote)) cands.unshift("65:7");
    let a = null;
    for (const c of cands) { const x = align(quote, c); if (x && x.words <= Math.ceil(x.qn * 1.3) + 3 && (!a || x.hit > a.hit)) a = x; }
    if (/لِيُنفِقْ ذُو/.test(quote)) { const z = align(quote, "65:7"); fix = `الصحيح الحرفي: ﴿${z.text}﴾ (${z.ref})، والمرجع المكتوب «الطلاق: 6» خطأ وصوابه «الطلاق: 7»`; }
    else if (a && a.hit >= 0.7) fix = `الصحيح الحرفي: ﴿${a.text}﴾ (${a.ref})`;
    else if (a && a.hit >= 0.6 && a.words <= a.qn + 2) fix = `ليس لفظ آية. إن كان المقصود الآية (${a.ref}) فنصها الحرفي: ﴿${a.text}﴾؛ وإن كان شرحًا تُزال علامة القرآن (${how}) ويُكتب بين «» أو بلا أقواس`;
    else fix = `لا آية بهذا اللفظ: ليس اقتباسًا قرآنيًا — تُزال علامة القرآن (${how}) ويُكتب بين «» أو بلا أقواس`;
  }
  out.push(`${i + 1}) ${where}\n   الخاطئ: ${how === "﴿﴾" ? "﴿" + quote + "﴾" : how === "{}" ? "{" + quote + "}" : quote}${cited && type !== "عزو آية خاطئ" ? `  [المرجع المكتوب: ${cited}]` : ""}\n   ${fix}`);
});
fs.writeFileSync("n6-quran-items.txt", out.join("\n"));
console.log(out.length, fs.statSync("n6-quran-items.txt").size);
