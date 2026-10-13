// يولّد docs/native/BACKLOG.md: المفقود/الفارغ من native-data-check + غير المؤشَّر من FEATURE_PARITY، مرتّبًا بالأثر.
// الاستخدام: node scripts/native-backlog.mjs  (يقرأ native-loop.invalid إن وُجد لسبب كل بند)
import { execSync } from "node:child_process"; import { readFileSync, writeFileSync, existsSync } from "node:fs";
const sh = (c) => { try { return execSync(c, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch (e) { return e.stdout || ""; } };
const gate = sh("node scripts/native-data-check.mjs").split("\n");
const reasons = new Map();
const inv = `${process.env.HOME}/ssunnah-board/native-loop.invalid`;
if (existsSync(inv)) for (const l of readFileSync(inv, "utf8").split("\n")) { const [r, , why] = l.split("|"); if (r) reasons.set(r, why); }
const ownerFor = (why = "") => /تعذّر|MISSING|EMPTY/.test(why) ? "ن1 (البيانات)" : /DUP/.test(why) ? "ن2" : /PLACEHOLDER|قيد الإعداد/.test(why) ? "ن3 (الشاشة)" : /قيد التوثيق/.test(why) ? "ن1 (التوثيق)" : "ن3";
const prs = JSON.parse(sh("gh pr list -R yalabdullmohsen/SSUNNAH --base native-app --state open --json number,title,headRefName --limit 60") || "[]");
const winOf = (pr) => (pr.title.match(/ن\s?(\d)/) || pr.headRefName.match(/(?:^|[\/-])n(\d)(?:[\/-]|$)/) || [])[1];
/* النافذة المالكة: PR مفتوح يذكر قسم البند أو ملف شاشته؛ وإلا فالمالك المقترح */
const windowFor = (text, fallback) => {
  const keys = (text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []).map((k) => k.replace(/screens?$/, "")).filter(Boolean);
  const hit = prs.find((pr) => keys.some((k) => (pr.title + " " + pr.headRefName).toLowerCase().includes(k)));
  return hit && winOf(hit) ? `ن${winOf(hit)} (#${hit.number} مفتوح)` : `${fallback} — بلا PR مفتوح`;
};
const rows = [];
const byScreen = new Map();
for (const l of gate) {
  const m = l.match(/^(MISSING|WARN-EMPTY)\s+(\S+).*←\s*(\S+)/); if (!m) continue;
  const k = m[3]; const e = byScreen.get(k) || { files: [], kind: m[1] }; e.files.push(m[2]); byScreen.set(k, e);
}
for (const [screen, e] of byScreen) rows.push({ n: e.files.length, kind: e.kind === "MISSING" ? "ملف مفقود" : "ملف فارغ", what: `${screen}: ${e.files.slice(0, 6).join("، ")}${e.files.length > 6 ? "…" : ""}`, owner: "ن1 (البيانات)" });
const par = readFileSync("docs/native/FEATURE_PARITY.md", "utf8").split("\n"); let sec = "", own = "";
const bySec = new Map();
for (const l of par) {
  const h = l.match(/^## (.+?) — \d+ \(المسؤول: (.+?)\)/); if (h) { sec = h[1]; own = h[2]; continue; }
  const m = l.match(/^- \[ \] `([^`]+)`/); if (!m) continue;
  const why = reasons.get(m[1]); const e = bySec.get(sec) || { items: [], own, w: new Set() }; e.items.push(m[1]); if (why) e.w.add(why); bySec.set(sec, e);
}
for (const [s, e] of bySec) rows.push({ n: e.items.length, kind: "غير مؤشَّر", what: `${s}: ${e.items.slice(0, 5).join("، ")}${e.items.length > 5 ? "…" : ""}${e.w.size ? ` [${[...e.w].slice(0, 3).join("؛ ")}]` : ""}`, owner: [...e.w].length ? [...new Set([...e.w].map(ownerFor))].join(" / ") : e.own });
const ph = [...reasons].filter(([, w]) => /قيد الإعداد|PLACEHOLDER/.test(w || "")).map(([r]) => r);
if (ph.length) rows.push({ n: ph.length, kind: "placeholder «قيد الإعداد»", what: `يجب أن تكون صفرًا (يفشل native-release-check): ${ph.join("، ")}`, owner: "ن3 (الشاشة)" });
rows.sort((a, b) => b.n - a.n);
const mb = new Set(existsSync("docs/native/MERGED_BUILT.txt") ? readFileSync("docs/native/MERGED_BUILT.txt", "utf8").split("\n").filter(Boolean) : []);
const unbuilt = par.map(l => l.match(/^- \[ \] `([^`]+)`/)?.[1]).filter(r => r && !mb.has(r));
if (unbuilt.length) rows.unshift({ n: unbuilt.length, kind: "غير مبني (من الـ212)", what: unbuilt.map(r => `${r} ← ${/^\/knowledge/.test(r) ? "ن3" : "ن2"}`).join("، "), owner: "ن2 (/islamic-sects، /islamic-sects/:id) / ن3 (/knowledge/:section)" });
rows.push({ n: 0, kind: "بعد الإطلاق", what: "Live Activity فقط (ويدجت «الصلاة القادمة» بُنيت وتُرسم على n4-sim؛ يبقى النشاط الحي ومفتاح NSSupportsLiveActivities مخفيَّين حتى بعد الإطلاق)", owner: "غير مُسنَد" });
const head = gate[0] || "";
let out = `# BACKLOG (مولَّد آليًا — لا يُحرَّر يدويًا)\n\n${head}\n\nمرتّب بالأكبر أثرًا أولًا (العدد = عدد الملفات/الشاشات المتأثرة).\n\n| # | الأثر | النوع | البند | المالك المقترح | النافذة المالكة (من PR/فرع مفتوح) |\n|---|---|---|---|---|---|\n`;
rows.forEach((r, i) => { out += `| ${i + 1} | ${r.n} | ${r.kind} | ${r.what.replace(/\|/g, "/")} | ${r.owner} | ${windowFor(r.what, r.owner)} |\n`; });
const tail = existsSync("docs/native/BACKLOG_POST_LAUNCH.md") ? "\n" + readFileSync("docs/native/BACKLOG_POST_LAUNCH.md", "utf8") : "";
writeFileSync("docs/native/BACKLOG.md", out + tail); console.log(`BACKLOG: ${rows.length} بند`);
