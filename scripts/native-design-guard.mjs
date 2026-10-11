#!/usr/bin/env node
// حارس: يرفض أي لون/مسافة/خط مكتوب يدويًا في ios-native خارج Design/. الرموز تأتي من DSColor/DSMetric فقط.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = "ios-native";
const RULES = [
  [/Color\s*\(\s*(red|white|hue|\.sRGB|\.displayP3)/, "لون يدوي Color(...)"],
  [/UIColor\s*\(\s*(red|white|hue)/, "لون يدوي UIColor(...)"],
  [/#colorLiteral|#fileLiteral/, "literal لوني"],
  [/\b0x[0-9A-Fa-f]{6,8}\b/, "قيمة hex يدوية"],
  [/Color\s*\(\s*"/, "لون من اسم Asset غير مولَّد"],
  [/\.font\s*\(\s*\.system\s*\(\s*size\s*:/, "حجم خط يدوي"],
  [/Font\s*\.\s*custom\s*\(/, "خط custom يدوي"],
  [/\.padding\s*\(\s*(\.\w+\s*,\s*)?[1-9]\d*(\.\d+)?\s*\)/, "padding رقمي يدوي"],
  [/\bspacing\s*:\s*[1-9]\d*(\.\d+)?/, "spacing رقمي يدوي"],
  [/cornerRadius\s*\(\s*[1-9]/, "نصف قطر يدوي"],
  [/\.frame\s*\([^)]*(width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*[1-9]\d*(\.\d+)?/, "frame رقمي يدوي"],
];
const files = [];
const walk = (d) => { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) { if (e !== "Design" && e !== ".build" && e !== "Pods") walk(p); } else if (p.endsWith(".swift")) files.push(p); } };
if (existsSync(ROOT)) walk(ROOT);
const bad = [];
for (const f of files) readFileSync(f, "utf8").split("\n").forEach((line, i) => {
  const code = line.replace(/\/\/.*$/, "");
  for (const [re, why] of RULES) if (re.test(code)) bad.push(`${f}:${i + 1}: ${why}`);
});
if (bad.length) { console.error(`✗ native-design-guard: ${bad.length} مخالفة\n${bad.slice(0, 40).join("\n")}`); process.exit(1); }
console.log(`✓ native-design-guard: ${files.length} ملف Swift خارج Design/ بلا قيم يدوية`);
