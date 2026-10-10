#!/usr/bin/env node
// نسبة إنجاز إعادة البناء بـSwiftUI = المؤشَّر [x] / الكل في docs/native/FEATURE_PARITY.md
import { readFileSync } from "node:fs";
const md = readFileSync("docs/native/FEATURE_PARITY.md", "utf8");
let sec = "", total = 0, done = 0; const by = new Map();
for (const l of md.split("\n")) {
  if (l.startsWith("## ")) { sec = l.slice(3); continue; }
  if (sec.startsWith("المحذوف")) continue;
  const m = l.match(/^- \[( |x|X)\]/); if (!m) continue;
  total++; const d = m[1] !== " "; if (d) done++;
  const s = by.get(sec) ?? [0, 0]; s[1]++; if (d) s[0]++; by.set(sec, s);
}
if (process.argv.includes("--by-section")) for (const [k, [d, t]] of by) console.log(`${d}/${t}\t${k}`);
console.log(`الإنجاز: ${done}/${total} = ${total ? ((done / total) * 100).toFixed(1) : 0}%`);
