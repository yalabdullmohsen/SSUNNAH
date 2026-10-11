#!/usr/bin/env bash
# يولّد حزمة البيانات المحقَّقة للتطبيق الأصلي من أي worktree بأمر واحد:
#   bash scripts/native-export-data.sh [مجلد_الإخراج]   (الافتراضي: ios-native/Data في جذر هذا الـworktree)
# النتيجة: <out>/MANIFEST.json (مسارات + حجوم + sha256) ثم إعادة تحقق مستقلة من المجموع.
# يرفض التصدير: المحجوز في content-hold، demo، الموثّقة بلا شرح/مرجع (والعامة unsourced مقبولة)، الضعيف/الموضوع. أقسام التطبيق (scripts/native/sections) بالقواعد نفسها؛ الشبهات لا تدخل إلا بدليل متحقَّق من Tanzil ومصدر.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/ios-native/Data}"
cd "$ROOT/artifacts/majalis"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
ADH=content/native/adhkar-verified.json  # لقطة الأذكار الموثّقة (تُمرَّر تلقائيًا إن وُجدت؛ لا تُنشأ أذكار)
node --import tsx scripts/native/export-ios-data.mjs --out "$OUT" ${ADH:+$( [ -f "$ADH" ] && echo "--adhkar-json $ADH" )}
node --input-type=module -e '
import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path";
const out = process.argv[1]; const m = JSON.parse(fs.readFileSync(path.join(out, "MANIFEST.json"), "utf8"));
for (const f of m.files) { const b = fs.readFileSync(path.join(out, f.path)); if (b.length !== f.bytes || crypto.createHash("sha256").update(b).digest("hex") !== f.sha256) { console.error("checksum mismatch:", f.path); process.exit(1); } }
const holds = new Set(JSON.parse(fs.readFileSync("content/content-hold.json", "utf8")).holds.map((h) => h.id));
let q = 0;
for (const f of m.files.filter((x) => /^quiz\/(?!manifest)/.test(x.path))) for (const r of JSON.parse(fs.readFileSync(path.join(out, f.path), "utf8"))) { q++; if (/^demo[-_]/i.test(String(r.id)) || holds.has(r.id) || !String(r.question || "").trim() || !String(r.answer || "").trim() || (r.documentation_status !== "unsourced" && (!String(r.reference || "").trim() || !String(r.explanation || "").trim()))) { console.error("سؤال غير مقبول:", r.id); process.exit(1); } }
console.log(JSON.stringify({ ok: true, files: m.files.length, quizAccepted: q, manifest: path.join(out, "MANIFEST.json"), manifestSha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(out, "MANIFEST.json"))).digest("hex") }));
' "$OUT"
