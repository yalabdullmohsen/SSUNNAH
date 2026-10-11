#!/usr/bin/env node
// بوابة بيانات: كل ContentSource.bundled(name:subdirectory:) في Sources/ يجب أن يقابله ملف JSON صالح في ios-native/Data.
// يطبع المفقود/التالف مع الملف المصدر؛ يخرج 1 إن وُجد نقص. الاستخدام: node scripts/native-data-check.mjs [--json]
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
const SRC = "artifacts/majalis/ios/App/SunnahNative/Sources", DATA = "ios-native/Data";
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
const missing = [], broken = [];
for (const [k, files] of refs) {
  const name = basename(k), sub = k.includes("/") ? k.slice(0, k.lastIndexOf("/")) : null;
  const cands = (have.get(name) ?? []).filter(p => !sub || p.includes(`${DATA}/${sub}/`) || p.includes(`/${sub}/`));
  if (!cands.length) { missing.push({ ref: k, from: [...files] }); continue; }
  for (const p of cands) try { JSON.parse(readFileSync(p, "utf8")); } catch (e) { broken.push({ file: p, error: String(e.message).slice(0, 80) }); }
}
console.log(`مراجع bundled: ${refs.size} · مفقود: ${missing.length} · JSON تالف: ${broken.length}`);
for (const m of missing) console.log(`MISSING ${m.ref}  ← ${m.from.join(", ")}`);
for (const b of broken) console.log(`BROKEN ${b.file}: ${b.error}`);
if (process.argv.includes("--json")) console.log(JSON.stringify({ missing, broken }));
process.exit(missing.length || broken.length ? 1 : 0);
