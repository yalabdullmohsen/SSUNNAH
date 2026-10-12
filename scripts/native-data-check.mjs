#!/usr/bin/env node
// بوابة بيانات: كل ContentSource.bundled(name:subdirectory:) في Sources/ يجب أن يقابله ملف JSON صالح في ios-native/Data.
// يطبع المفقود/التالف مع الملف المصدر؛ يخرج 1 إن وُجد نقص. الاستخدام: node scripts/native-data-check.mjs [--json]
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
const SRC = "artifacts/majalis/ios/App/SunnahNative/Sources", DATA = process.env.NATIVE_DATA_DIR ?? "ios-native/Data";
const walk = (d, o = []) => { for (const e of readdirSync(d)) { const p = join(d, e), s = statSync(p); s.isDirectory() ? walk(p, o) : o.push(p); } return o; };
const have = new Map(); // name -> [paths]
if (existsSync(DATA)) for (const p of walk(DATA)) if (p.endsWith(".json")) { const n = basename(p, ".json"); (have.get(n) ?? have.set(n, []).get(n)).push(p); }
// استثناءات موحّدة: computedInApp تُتجاوز في MISSING وWARN-EMPTY، وintentionallyEmpty في WARN-EMPTY فقط.
const ex = JSON.parse(readFileSync("docs/native/data-exemptions.json", "utf8"));
const computed = new Set(ex.computedInApp ?? []), emptyOk = new Set(Object.keys(ex.intentionallyEmpty ?? {}));
const keyOf = p => p.replace(`${DATA}/`, "").replace(/\.json$/, "");
const refs = new Map();
for (const f of walk(SRC).filter(p => p.endsWith(".swift"))) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/\.bundled\(\s*name:\s*"([^"]+)"(?:\s*,\s*subdirectory:\s*(?:"([^"]+)"|[^)]*))?/g)) {
    const k = `${m[2] ? m[2] + "/" : ""}${m[1]}`; (refs.get(k) ?? refs.set(k, new Set()).get(k)).add(f.replace(SRC + "/SunnahNative/", ""));
  }
}
const missing = [], broken = [], empty = [];
for (const [k, files] of refs) {
  const name = basename(k), sub = k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : null;
  const cands = (have.get(name) ?? []).filter(p => !sub || p.includes(`${DATA}/${sub}/`) || p.includes(`/${sub}/`));
  if (!cands.length) { if (computed.has(k)) continue; missing.push({ ref: k, from: [...files] }); continue; }
  for (const p of cands) try {
    const v = JSON.parse(readFileSync(p, "utf8"));
    if (Array.isArray(v) ? !v.length : v && typeof v === "object" && !Object.keys(v).length) if (!computed.has(keyOf(p)) && !emptyOk.has(keyOf(p))) empty.push({ file: p, from: [...files] }); // تحذير فقط، لا فشل
  } catch (e) { broken.push({ file: p, error: String(e.message).slice(0, 80) }); }
}
// فراغ أي ملف بيانات (لا المُشار إليه من Swift فقط)؛ لا تكرار مع ما وُجد أعلاه.
const seen = new Set(empty.map(e => e.file));
for (const paths of have.values()) for (const p of paths) {
  if (seen.has(p) || computed.has(keyOf(p)) || emptyOk.has(keyOf(p))) continue;
  try { const v = JSON.parse(readFileSync(p, "utf8")); if (Array.isArray(v) ? !v.length : v && typeof v === "object" && !Object.keys(v).length) empty.push({ file: p, from: [] }); } catch { /* التالف يُبلَّغ في مرجعه */ }
}
// سلامة المانيفست: كل ملف مدرج موجود وsha256 مطابق (يُحسب فشلًا).
const manifest = existsSync(`${DATA}/MANIFEST.json`) ? JSON.parse(readFileSync(`${DATA}/MANIFEST.json`, "utf8")) : { files: [] };
for (const { path, sha256 } of manifest.files) {
  const abs = join(DATA, path);
  if (!existsSync(abs)) { if (!computed.has(path.replace(/\.json$/, ""))) missing.push({ ref: path, from: ["MANIFEST.json"] }); continue; }
  if (sha256 && createHash("sha256").update(readFileSync(abs)).digest("hex") !== sha256) broken.push({ file: abs, error: "sha256 لا يطابق المانيفست" });
}
console.log(`مراجع bundled: ${refs.size} · مفقود: ${missing.length} · JSON تالف: ${broken.length} · فارغ (تحذير): ${empty.length}`);
for (const m of missing) console.log(`MISSING ${m.ref}  ← ${m.from.join(", ")}`);
for (const b of broken) console.log(`BROKEN ${b.file}: ${b.error}`);
for (const e of empty) console.log(`WARN-EMPTY ${e.file} (فارغ [] أو {}) ← ${e.from.join(", ")}`);
if (process.argv.includes("--json")) console.log(JSON.stringify({ missing, broken, empty }));
process.exit(missing.length || broken.length ? 1 : 0);
