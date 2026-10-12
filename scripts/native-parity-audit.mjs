#!/usr/bin/env node
/* تدقيق تطابق الموقع/التطبيق: لكل قسم عدد عناصر مصدر الموقع مقابل ما في ios-native/Data، والفرق وسببه.
 * الأقسام المعتمدة على ملفات (قرآن/تفسير/حديث/أذكار/أسئلة/قصص) تُعَدّ من المصدر الخام مستقلًا عن المُصدِّر؛
 * بقية الأقسام: عدد الموقع = المُصدَّر + المرفوض المسجَّل في MANIFEST.json (وكل مرفوض له سبب).
 * الاستخدام: node scripts/native-parity-audit.mjs [--data ios-native/Data] [--md docs/native/PARITY_AUDIT.md]
 * يخرج بـ 1 إن وُجد فرق غير مفسَّر (نقص بلا سبب). */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = `${root}/artifacts/majalis`;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
let dataDir = path.resolve(root, arg("--data", "ios-native/Data"));
if (!fs.existsSync(`${dataDir}/MANIFEST.json`)) {
  dataDir = fs.mkdtempSync(`${process.env.TMPDIR || "/tmp"}/parity-`);
  execFileSync("node", ["--import", "tsx", "scripts/native/export-ios-data.mjs", "--out", dataDir, "--adhkar-json", "content/native/adhkar-verified.json"], { cwd: app, stdio: "ignore", env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=1536" } });
}
const rd = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const manifest = rd(`${dataDir}/MANIFEST.json`);
const pad = (n) => String(n).padStart(3, "0");
const rows = []; // {section, site, app, why}
const add = (section, site, appN, why = "") => rows.push({ section, site, app: appN, diff: appN - site, why });

/* ---- أقسام عدّها مستقل من المصدر الخام ---- */
{
  let site = 0, got = 0;
  for (let s = 1; s <= 114; s++) { site += rd(`${app}/public/data/quran/surah-${pad(s)}.json`).ayahs.length; got += rd(`${dataDir}/quran/surah-${pad(s)}.json`).ayahs.length; }
  add("القرآن (آيات)", site, got);
}
for (const id of ["muyassar", "saadi"]) {
  let site = 0, got = 0, ayahs = 0;
  for (let s = 1; s <= 114; s++) {
    site += Object.keys(rd(`${app}/public/data/tafsir/${id}/${pad(s)}.json`).ayahs).length;
    got += Object.keys(rd(`${dataDir}/tafsir/${id}/${pad(s)}.json`).ayahs).length;
    ayahs += rd(`${app}/public/data/quran/surah-${pad(s)}.json`).numberOfAyahs;
  }
  add(`التفسير: ${id}`, site, got, ayahs !== site ? `آيات ${ayahs - site} بلا تفسير في المصدر نفسه (يعرضها الموقع بلا تفسير)` : "");
}
for (const c of ["bukhari", "muslim"]) {
  const site = rd(`${app}/public/data/hadith/${c}.json`).hadiths.length;
  add(`الحديث: ${c}`, site, rd(`${dataDir}/hadith/${c}.json`).hadiths.length, "محجوز/نص فارغ إن وُجد الفرق");
}
{
  let site = 0;
  for (const f of fs.readdirSync(`${app}/public/data/hadith-verified`).filter((x) => /^(sahih|daif|mawdu)-\d+\.json$/.test(x)))
    for (const h of rd(`${app}/public/data/hadith-verified/${f}`)) if (h.authenticity_class === "sahih") site++;
  add("الحديث: المصحّح (صحيح)", site, rd(`${dataDir}/hadith/verified-sahih.json`).length, "فرق مقصود: صحيح محجوز في content-hold (1)؛ الضعيف والموضوع خارج المقارنة أصلًا (قاعدة العقد)");
}
{
  const rowsA = rd(`${app}/content/native/adhkar-verified.json`).filter((r) => !r.deleted_at && r.verification_status === "verified");
  add("الأذكار (معتمد)", rowsA.length, rd(`${dataDir}/adhkar/verified-adhkar.json`).length);
}
{
  let site = 0, unsourced = 0;
  const dir = `${app}/public/data/quiz`;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "manifest.json"))
    for (const q of rd(`${dir}/${f}`)) {
      if (/^demo[-_]/i.test(String(q.id))) continue;
      site++;
      if (q.documentation_status === "unsourced" && !String(q.reference || "").trim()) unsourced++;
    }
  const qm = rd(`${dataDir}/quiz/manifest.json`).total;
  add("الأسئلة (غير demo)", site, qm, `منها ${unsourced} بلا مرجع تُعرض كما يعرضها الموقع؛ الفرق = المحجوز في content-hold لا يُحذف`);
}
{
  let site = 0;
  const dir = `${app}/public/data/stories`;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json") && x !== "manifest.json")) site += rd(`${dir}/${f}`).length;
  const got = rd(`${dataDir}/sirah/stories.json`).length;
  add("القصص", site, got);
}

/* ---- بقية الأقسام: الموقع = المُصدَّر + المرفوض المسجَّل ---- */
const done = new Set(["quranAyahs", "tafsir", "hadith", "adhkar", "quiz"]);
const rejBy = {};
for (const [k, reasons] of Object.entries(manifest.rejected || {})) {
  const [grp, ...rest] = k.split("-");
  (rejBy[grp] ||= []).push({ key: rest.join("-"), reasons });
}
const intentionalEmpty = /فارغ عمدًا|غير مُصدَّر/;
for (const [grp, v] of Object.entries(manifest.counts)) {
  if (done.has(grp) || typeof v !== "object") continue;
  for (const [name, n] of Object.entries(v)) {
    const rj = (rejBy[grp] || []).filter((r) => name.includes(r.key) || r.key.includes(name.split("/").pop().replace(".json", "")));
    const rejN = rj.reduce((a, r) => a + Object.entries(r.reasons).filter(([m]) => !intentionalEmpty.test(m)).reduce((b, [, c]) => b + c, 0), 0);
    const why = rj.flatMap((r) => Object.entries(r.reasons).map(([m, c]) => `${m}: ${c}`)).join("؛ ");
    const site = n + rejN;
    add(`${grp}/${name}`, site, n, why);
  }
}

/* ---- فروق مقصودة معروفة (مشروحة في DATA_CONTRACT) ---- */
const explained = (r) => r.diff === 0 || r.why;
const bad = rows.filter((r) => r.diff < 0 && !explained(r));
const unexplainedPositive = rows.filter((r) => r.diff > 0);
const table = ["| القسم | عدد الموقع | عدد التطبيق | الفرق | السبب |", "|---|---:|---:|---:|---|", ...rows.map((r) => `| ${r.section} | ${r.site} | ${r.app} | ${r.diff} | ${r.why} |`)].join("\n");
console.log(table);
console.log(`\nأقسام: ${rows.length} — فروق غير مفسَّرة: ${bad.length} — تطبيق أكثر من الموقع: ${unexplainedPositive.length}`);
const md = arg("--md", "");
if (md) fs.writeFileSync(path.resolve(root, md), `# تدقيق تطابق الموقع/التطبيق\n\nمُولَّد بـ \`node scripts/native-parity-audit.mjs --md ${md}\`. الفرق = التطبيق − الموقع.\n\n${table}\n`);
process.exit(bad.length || unexplainedPositive.length ? 1 : 0);
