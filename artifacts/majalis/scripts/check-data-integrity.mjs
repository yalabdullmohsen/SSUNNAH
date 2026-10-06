#!/usr/bin/env node
/**
 * بوابة سلامة البيانات المضمّنة (docs/DATA.md). تفشل عند:
 *  - نص شرعي بلا مرجع/درجة (أحاديث محققة، أذكار)، حقل إلزامي فارغ، مخالفة المخطط (data/schemas/datasets.mjs)
 *  - معرّف مكرر، عدم تطابق manifest مع الأجزاء، تغيّر بصمة sha256 للصحيحين
 *  - اختفاء معرّف ثابت قد يكون محفوظًا لدى المستخدمين (data/schemas/id-baseline.json) دون تحويلة redirects
 *  - حرف تالف (U+FFFD) أو مسافة صفرية (U+200B) في البيانات
 *  - تجاوز سقوف الديون المعروفة (ceilings) — السقوف لا تُرفع، تُخفض فقط.
 * فحص روابط الصوت شبكي واختياري: --network (خارج المسار الإلزامي).
 * --update-baseline يضيف المعرّفات الجديدة إلى الخط الأساسي (لا يحذف القديمة).
 * التشغيل: node --import tsx scripts/check-data-integrity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CHUNKED, ChunkManifest, SahihaynHadith, Dhikr, AudioRegistry } from "../data/schemas/datasets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "public/data");
const BASELINE_PATH = path.join(ROOT, "data/schemas/id-baseline.json");
const args = new Set(process.argv.slice(2));
const errors = [];
const stats = {};
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const isEmpty = (v) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);

function checkSchema(schema, item, where) {
  const r = schema.safeParse(item);
  if (!r.success) errors.push(`${where}: ${r.error.issues.map((i) => `${i.path.join(".") || "item"} ${i.message}`).join("; ")}`);
}

function dupes(values) {
  const seen = new Map();
  for (const v of values) seen.set(v, (seen.get(v) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1);
}

/* ── المجموعات المجزأة ───────────────────────────────────────────── */
const ids = {};
const items = {};
for (const [dir, { item: schema, stableId }] of Object.entries(CHUNKED)) {
  const mPath = path.join(DATA, dir, "manifest.json");
  const manifest = readJson(mPath);
  checkSchema(ChunkManifest, manifest, `${dir}/manifest.json`);
  const all = [];
  for (const c of manifest.chunks ?? []) {
    const f = path.join(DATA, dir, c.file);
    if (!fs.existsSync(f)) { errors.push(`${dir}: جزء مفقود ${c.file}`); continue; }
    const arr = readJson(f);
    if (arr.length !== c.count) errors.push(`${dir}/${c.file}: manifest count=${c.count} والفعلي=${arr.length}`);
    arr.forEach((it, i) => { checkSchema(schema, it, `${dir}/${c.file}#${i}`); all.push(it); });
  }
  if (manifest.total !== all.length) errors.push(`${dir}: manifest total=${manifest.total} والفعلي=${all.length}`);
  for (const [id, n] of dupes(all.map((x) => String(x[stableId])))) errors.push(`${dir}: معرّف ثابت مكرر ${stableId}=${id} ×${n}`);
  ids[dir] = all.map((x) => String(x[stableId]));
  items[dir] = all;
  stats[dir] = all.length;
}

/* ── الصحيحان: البصمة + الأرقام ─────────────────────────────────── */
const hm = readJson(path.join(DATA, "hadith/manifest.json"));
for (const f of hm.files) {
  const p = path.join(DATA, "hadith", f.file);
  const buf = fs.readFileSync(p);
  if (crypto.createHash("sha256").update(buf).digest("hex") !== f.sha256) errors.push(`hadith/${f.file}: sha256 لا يطابق manifest (نص المصدر عُدّل)`);
  const list = JSON.parse(buf.toString("utf8")).hadiths;
  if (list.length !== f.count) errors.push(`hadith/${f.file}: count=${f.count} والفعلي=${list.length}`);
  list.forEach((h, i) => checkSchema(SahihaynHadith, h, `hadith/${f.file}#${i}`));
  for (const [n] of dupes(list.map((h) => h.n))) errors.push(`hadith/${f.file}: رقم مكرر ${n}`);
  stats[`hadith/${f.collection}`] = list.length;
}

/* ── الأذكار (داخل الحزمة) ──────────────────────────────────────── */
const { ADHKAR_ITEMS } = await import("../src/lib/adhkar-seed.ts");
ADHKAR_ITEMS.forEach((d) => checkSchema(Dhikr, d, `adhkar ${d.id}`));
for (const [id] of dupes(ADHKAR_ITEMS.map((d) => d.id))) errors.push(`adhkar: معرّف مكرر ${id}`);
ids.adhkar = ADHKAR_ITEMS.map((d) => d.id);
stats.adhkar = ADHKAR_ITEMS.length;

/* ── سجل الصوت ──────────────────────────────────────────────────── */
const reg = readJson(path.join(DATA, "audio/audio-registry.json"));
checkSchema(AudioRegistry, reg, "audio/audio-registry.json");
for (const [id] of dupes(reg.reciters.map((r) => r.id))) errors.push(`audio: قارئ مكرر ${id}`);

/* ── أحرف تالفة/مخفية ──────────────────────────────────────────── */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(json|jsonl)$/.test(e.name)) out.push(p);
  }
  return out;
}
for (const f of [...walk(DATA), ...walk(path.join(ROOT, "src/data"))]) {
  const s = fs.readFileSync(f, "utf8");
  if (s.includes("\uFFFD")) errors.push(`${path.relative(ROOT, f)}: حرف تالف U+FFFD`);
  if (s.includes("\u200B")) errors.push(`${path.relative(ROOT, f)}: مسافة صفرية U+200B`);
}

/* ── سقوف الديون المعروفة (docs/DATA_CONFLICTS.md) ─────────────── */
const baseline = readJson(BASELINE_PATH);
const measured = {
  hadithVerifiedDupTextGroups: dupes(items["hadith-verified"].map((h) => norm(h.text))).length,
  quizDuplicateEntries: dupes(items.quiz.map((q) => `${norm(q.question)}\u0000${norm(q.answer)}`)).reduce((a, [, n]) => a + n - 1, 0),
  quizMissingReference: items.quiz.filter((q) => isEmpty(q.reference)).length,
  qaMissingReference: items.qa.filter((q) => isEmpty(q.reference)).length,
  storyNumericIdCollisions: dupes(items.stories.map((s) => s.id)).length,
};
for (const [k, v] of Object.entries(measured)) {
  const max = baseline.ceilings[k];
  if (max == null) errors.push(`ceilings: ${k} غير معرّف`);
  else if (v > max) errors.push(`سقف ${k}: ${v} > ${max}`);
  else if (v < max) console.log(`↓ ${k}: ${v} (السقف ${max} — اخفضه في id-baseline.json)`);
}

/* ── حفظ معرّفات المستخدمين: لا يختفي معرّف ثابت دون تحويلة ─────── */
const redirects = baseline.redirects ?? {};
for (const [set, list] of Object.entries(baseline.ids)) {
  const current = new Set(ids[set] ?? []);
  const lost = list.filter((id) => !current.has(id) && !current.has(redirects[set]?.[id]));
  if (lost.length) errors.push(`${set}: ${lost.length} معرّف ثابت اختفى بلا تحويلة (قد يكون محفوظًا لدى المستخدمين): ${lost.slice(0, 5).join(", ")}`);
}
if (args.has("--update-baseline")) {
  for (const set of Object.keys(baseline.ids)) baseline.ids[set] = [...new Set([...baseline.ids[set], ...ids[set]])];
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 1)}\n`);
  console.log("✓ id-baseline.json محدَّث");
}

if (args.has("--network")) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/audit-reciters-playability.mjs")], { stdio: "inherit" });
  if (r.status !== 0) errors.push("روابط الصوت: audit-reciters-playability فشل");
}

console.log(`مجموعات: ${Object.entries(stats).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
if (errors.length) {
  console.error(`✗ check-data-integrity: ${errors.length} خطأ`);
  for (const e of errors.slice(0, 40)) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("✓ check-data-integrity");
