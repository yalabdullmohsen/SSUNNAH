#!/usr/bin/env node
// [~] = مؤجل بقرار المالك (docs/native/DEFERRED.md): يبقى في الـ212 ويُستثنى من «المطلوب للإصدار».
// رقمان منفصلان: «مدموج ومبني» = docs/native/MERGED_BUILT.txt، و«مُتحقَّق بلقطة» = [x] في FEATURE_PARITY (لا [x] إلا بلقطة فاتح/داكن صالحة).
import { readFileSync, existsSync } from "node:fs";
const md = readFileSync("docs/native/FEATURE_PARITY.md", "utf8");
const built = new Set(existsSync("docs/native/MERGED_BUILT.txt") ? readFileSync("docs/native/MERGED_BUILT.txt", "utf8").split("\n").filter(Boolean) : []);
let sec = "", total = 0, ver = 0, bt = 0, def = 0, relBt = 0, relVer = 0; const by = new Map();
for (const l of md.split("\n")) {
  if (l.startsWith("## ")) { sec = l.slice(3); continue; }
  if (sec.startsWith("المحذوف")) continue;
  const m = l.match(/^- \[( |x|X|~)\] `([^`]*)`/); if (!m) continue;
  total++; const d = m[1] === "~", v = m[1] !== " " && !d, b = built.has(m[2]) || v;
  if (v) ver++; if (b) bt++; if (d) def++; else { if (v) relVer++; if (b) relBt++; }
  const s = by.get(sec) ?? [0, 0, 0]; s[2]++; if (b) s[0]++; if (v) s[1]++; by.set(sec, s);
}
if (process.argv.includes("--by-section")) for (const [k, [b, v, t]] of by) console.log(`مبني ${b}/${t} · متحقَّق ${v}/${t}\t${k}`);
console.log(`مدموج ومبني: ${bt}/${total}`);
console.log(`مُتحقَّق بلقطة: ${ver}/${total}`);
if (def) {
  console.log(`مؤجل بقرار المالك: ${def}/${total}`);
  console.log(`المطلوب للإصدار: مدموج ومبني ${relBt}/${total - def} · مُتحقَّق بلقطة ${relVer}/${total - def}`);
}
