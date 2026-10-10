#!/usr/bin/env node
/**
 * بوابة الاقتباس القرآني (Tanzil فقط): كل نص بين { } أو ﴿ ﴾ أو في كائن "type":"quran"
 * يجب أن يوجد متصلًا في public/data/quran بعد التطبيع المعتمد من المالك:
 *   حذف التشكيل وعلامات الوقف والمحارف الخفية، توحيد الهمزات آ/أ/إ/ٱ←ا، ؤ←و، ئ←ي، ى←ي، ة←ت،
 *   ثم حذف ا و ي ء؛ والتقسيم عند … والشرطة.
 * التشغيل: node scripts/test-quran-quotes-tanzil.mjs [--json] [dir…]  (يفشل بكود 1 إن وُجدت مخالفة غير مستثناة)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const dirs = args.filter((a) => !a.startsWith("--"));
const SCAN = dirs.length ? dirs : ["public/data/tafsir", "public/data/quiz", "public/data/qa", "public/data/knowledge", "public/data/lessons", "public/data/fiqh", "public/data/stories", "public/data/quran-people"];

export const norm = (s) =>
  String(s)
    .normalize("NFKD")
    .replace(/[\p{Mn}​-‏‪-‮⁠﻿ۖ-ۭـ]/gu, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ت")
    .replace(/[^ء-ي]/g, "")
    .replace(/[اويء]/g, "")
    .replace(/(.)\1+/g, "$1")
    .replace(/بصطت/g, "بسطت"); // رسم المصحف (الأعراف 69)؛ والتشديد يُطوى بحذف تكرار الحرف

const joined = [];
for (let i = 1; i <= 114; i++) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/quran", `surah-${String(i).padStart(3, "0")}.json`), "utf8"));
  joined.push(d.ayahs.map((a) => norm(a.text)).join(""));
}
const corpus = joined.join("|");

const segments = (q) =>
  q.split(/…|\.{3}|\*|[—–-]|\s[:؛]\s/).map((x) => x.trim()).filter((x) => norm(x).length >= 3);
const inQuran = (q) => segments(q).every((s) => corpus.includes(norm(s)));

const QUOTE = /﴿([^﴿﴾]{2,})﴾|\{([^{}]{2,})\}/g;
const found = [];
let quotes = 0;
const check = (file, p, text) => {
  quotes++;
  if (!inQuran(text)) found.push({ file, path: p, text: text.slice(0, 120) });
};
const walk = (file, node, p) => {
  if (typeof node === "string") {
    for (const m of node.matchAll(QUOTE)) check(file, p, (m[1] ?? m[2]).trim());
  } else if (Array.isArray(node)) node.forEach((v, i) => walk(file, v, `${p}[${i}]`));
  else if (node && typeof node === "object") {
    if (node.type === "quran" && typeof node.text === "string") check(file, `${p}.text`, node.text);
    for (const [k, v] of Object.entries(node)) walk(file, v, `${p}.${k}`);
  }
};
const files = (d) =>
  fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []))
    : [];
for (const d of SCAN) for (const f of files(path.join(ROOT, d))) walk(path.relative(ROOT, f), JSON.parse(fs.readFileSync(f, "utf8")), "$");

if (asJson) console.log(JSON.stringify(found, null, 1));
else {
  for (const f of found) console.log(`${f.file} ${f.path}: «${f.text}»`);
  console.log(`quran-quotes-tanzil: ${quotes} اقتباسًا، ${found.length} مخالفة`);
}
process.exit(found.length ? 1 : 0);
