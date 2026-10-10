#!/usr/bin/env node
// حارس: لا لون/مسافة/خط مكتوب يدويًا في Templates وComponents وGenerated — فقط Sunnah.*
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const src = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "ios/App/SunnahNative/Sources/SunnahNative");
const RULES = [
  [/Color\s*\(|Color\.(?!clear\b)[a-z]+|UIColor\s*\(|#colorLiteral|0x[0-9A-Fa-f]{6}/, "لون مكتوب يدويًا"],
  [/\.(foregroundColor|foregroundStyle|background|tint)\(\s*\.[a-z]+/, "لون نظام بدل Sunnah.Colors"],
  [/\.padding\(\s*(\.\w+\s*,\s*)?\d/, "padding رقمي"],
  [/spacing:\s*\d|lineSpacing\(\s*\d|cornerRadius:\s*\d|lineWidth:\s*\d/, "مسافة/زاوية رقمية"],
  [/\.frame\([^)]*(width|height|Width|Height):\s*\d/, "أبعاد رقمية"],
  [/\.font\(\s*\.|Font\.system|Font\.custom|\.system\(size/, "خط خارج Sunnah.Typography"],
];
let bad = 0;
for (const dir of ["Templates", "Components", "Generated"]) {
  for (const f of readdirSync(join(src, dir)).filter((x) => x.endsWith(".swift") && x !== "ScreenTemplate.swift")) {
    readFileSync(join(src, dir, f), "utf8").split("\n").forEach((line, i) => {
      if (line.trimStart().startsWith("//")) return;
      for (const [re, why] of RULES) if (re.test(line)) { console.error(`${dir}/${f}:${i + 1}: ${why}: ${line.trim()}`); bad++; }
    });
  }
}
if (bad) { console.error(`check-native-tokens: ${bad} مخالفة`); process.exit(1); }
console.log("check-native-tokens: ok");
