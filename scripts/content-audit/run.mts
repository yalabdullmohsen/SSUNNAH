/* تدقيق شامل للمحتوى (ملفات فقط، قراءة فقط) → docs/content/AUDIT_REPORT.md
   التشغيل: cd artifacts/majalis && npx tsx ../../scripts/content-audit/run.mts */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const app = path.join(root, "artifacts/majalis");
const data = path.join(app, "public/data");
const rj = (f: string) => JSON.parse(fs.readFileSync(f, "utf8"));
const files = (d: string, re = /\.json$/) =>
  fs.existsSync(d) ? fs.readdirSync(d).filter((f) => re.test(f) && f !== "manifest.json").map((f) => path.join(d, f)) : [];
const arr = (j: any): any[] => (Array.isArray(j) ? j : (Object.values(j).find(Array.isArray) as any[]) || []);
const has = (v: any) => v != null && String(typeof v === "object" ? JSON.stringify(v) : v).replace(/[\[\]{}"\s]/g, "") !== "";

type Row = { section: string; total: number; withSource: number; weak: number; note: string };
const rows: Row[] = [];
const issues: Record<string, number> = {};
const bump = (k: string, n = 1) => (issues[k] = (issues[k] || 0) + n);
const WEAK = /ضعيف|موضوع|منكر|واه/;
const MUTTAFAQ = /متفق عليه/;

// الأذكار
const { ADHKAR_ITEMS } = await import(path.join(app, "src/lib/adhkar-seed.ts"));
{
  let src = 0, weak = 0;
  for (const a of ADHKAR_ITEMS) {
    if (has(a.source) || has(a.reference)) src++; else bump("adhkar-no-source");
    if (WEAK.test(a.grade || "")) weak++;
    if (!has(a.grade)) bump("adhkar-no-grade");
    if (MUTTAFAQ.test(a.grade || "") && !/(البخاري)/.test(a.reference || a.source || "") ) bump("adhkar-muttafaq-without-bukhari");
    if (/^adh-import-/.test(a.id)) bump("adhkar-adh-import-ids");
  }
  rows.push({ section: "أذكار (seed)", total: ADHKAR_ITEMS.length, withSource: src, weak, note: "adh-import-% محسوبة في issues" });
}

// الفوائد
{
  const { SEED_FAWAID } = await import(path.join(app, "src/lib/fawaid-seed.ts"));
  const src = SEED_FAWAID.filter((f: any) => has(f.source) || has(f.reference) || has(f.sources)).length;
  rows.push({ section: "فوائد (seed)", total: SEED_FAWAID.length, withSource: src, weak: 0, note: "" });
}

// ملفات JSON العامة
const sets: [string, string[], (x: any) => boolean, (x: any) => boolean][] = [
  ["حديث موثّق (hadith-verified)", files(path.join(data, "hadith-verified")), (x) => has(x.source_name) || has(x.metadata?.source), (x) => WEAK.test(`${x.grade || ""}${x.authenticity_class || ""}`)],
  ["أسئلة وأجوبة (qa)", files(path.join(data, "qa"), /^seed-.*\.json$/), (x) => has(x.reference) || has(x.evidence), (x) => false],
  ["قصص (stories)", files(path.join(data, "stories")), (x) => has(x.sources), (x) => false],
  ["اختبارات (quiz)", files(path.join(data, "quiz")), (x) => has(x.reference), (x) => false],
  ["دروس (lessons chunks)", files(path.join(data, "lessons"), /^chunk-.*\.json$/), (x) => has(x.source_url) || has(x.source_name) || has(x.source), (x) => false],
];
for (const [name, fl, hasSrc, isWeak] of sets) {
  let total = 0, src = 0, weak = 0;
  for (const f of fl) for (const x of arr(rj(f))) { total++; if (hasSrc(x)) src++; if (isWeak(x)) weak++; }
  rows.push({ section: name, total, withSource: src, weak, note: `${fl.length} ملف` });
}

// مدوّنات حديثية كاملة (مصدر على مستوى المجموعة)
for (const c of ["bukhari", "muslim"]) {
  const j = rj(path.join(data, `hadith/${c}.json`));
  rows.push({ section: `مدوّنة ${c}`, total: j.count ?? arr(j).length, withSource: j.count ?? arr(j).length, weak: 0, note: `مصدر المجموعة: ${j.source}` });
}

// القرآن والتفسير (عدّ فقط)
rows.push({ section: "قرآن (surah-*.json محمي)", total: files(path.join(data, "quran"), /^surah-\d+\.json$/).length, withSource: 114, weak: 0, note: "لا يُعدَّل" });
for (const t of ["saadi", "muyassar"]) rows.push({ section: `تفسير ${t}`, total: files(path.join(data, "tafsir", t)).length, withSource: files(path.join(data, "tafsir", t)).length, weak: 0, note: "ملفات سور" });

// إخفاء المحتوى
const hold = rj(path.join(app, "content/content-hold.json")).holds.length;

const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const out = [
  "# تقرير تدقيق المحتوى (مُولَّد آليًا — لا يُحرَّر يدويًا)",
  "",
  "التشغيل: `cd artifacts/majalis && npx tsx ../../scripts/content-audit/run.mts`",
  "",
  `عناصر قيد الإيقاف (content-hold): ${hold}`,
  "",
  "| القسم | الإجمالي | له مصدر | النسبة | ضعيف/موضوع | ملاحظة |",
  "|---|---:|---:|---:|---:|---|",
  ...rows.map((r) => `| ${r.section} | ${r.total} | ${r.withSource} | ${pct(r.withSource, r.total)} | ${r.weak} | ${r.note} |`),
  "",
  "## أخطاء حسب النوع",
  ...Object.entries(issues).map(([k, v]) => `- ${k}: ${v}`),
  "",
].join("\n");
fs.writeFileSync(path.join(root, "docs/content/AUDIT_REPORT.md"), out);
console.log(out);
