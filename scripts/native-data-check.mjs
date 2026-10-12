#!/usr/bin/env node
// بوابة بيانات: كل ContentSource.bundled(name:subdirectory:) في Sources/ يجب أن يقابله ملف JSON صالح في ios-native/Data.
// يطبع المفقود/التالف مع الملف المصدر؛ يخرج 1 إن وُجد نقص. الاستخدام: node scripts/native-data-check.mjs [--json]
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
const EX = existsSync("docs/native/data-exemptions.json") ? JSON.parse(readFileSync("docs/native/data-exemptions.json", "utf8")) : {};
const skipMissing = new Set([...(EX.computedInApp ?? []), ...Object.keys(EX.overriddenGenerated ?? {}).filter(k => k[0] !== "_")]), skipEmpty = new Set([...(EX.computedInApp ?? []), ...Object.keys(EX.intentionallyEmpty ?? {})]);
const SRC = "artifacts/majalis/ios/App/SunnahNative/Sources", DATA = process.env.NATIVE_DATA_DIR ?? "ios-native/Data";
const walk = (d, o = []) => { for (const e of readdirSync(d)) { const p = join(d, e), s = statSync(p); s.isDirectory() ? walk(p, o) : o.push(p); } return o; };
const have = new Map(); // name -> [paths]
if (existsSync(DATA)) for (const p of walk(DATA)) if (p.endsWith(".json")) { const n = basename(p, ".json"); (have.get(n) ?? have.set(n, []).get(n)).push(p); }
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
  if (!cands.length) { if (skipMissing.has(k) || skipMissing.has(name)) continue; missing.push({ ref: k, from: [...files] }); continue; }
  for (const p of cands) try {
    const v = JSON.parse(readFileSync(p, "utf8"));
    if (skipEmpty.has(p.slice(DATA.length + 1, -5))) continue;
    if (Array.isArray(v) ? !v.length : v && typeof v === "object" && !Object.keys(v).length) empty.push({ file: p, from: [...files] }); // تحذير فقط، لا فشل
  } catch (e) { broken.push({ file: p, error: String(e.message).slice(0, 80) }); }
}
console.log(`مراجع bundled: ${refs.size} · مفقود: ${missing.length} · JSON تالف: ${broken.length} · فارغ (تحذير): ${empty.length}`);
for (const m of missing) console.log(`MISSING ${m.ref}  ← ${m.from.join(", ")}`);
for (const b of broken) console.log(`BROKEN ${b.file}: ${b.error}`);
for (const e of empty) console.log(`WARN-EMPTY ${e.file} (فارغ [] أو {}) ← ${e.from.join(", ")}`);
if (process.argv.includes("--json")) console.log(JSON.stringify({ missing, broken, empty }));
process.exit(missing.length || broken.length ? 1 : 0);
