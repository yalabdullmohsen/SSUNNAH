#!/usr/bin/env bash
# يولّد حزمة البيانات المحقَّقة للتطبيق الأصلي من أي worktree بأمر واحد:
#   bash scripts/native-export-data.sh [مجلد_الإخراج]   (الافتراضي: ios-native/Data في جذر هذا الـworktree)
# النتيجة: <out>/MANIFEST.json (مسارات + حجوم + sha256) ثم إعادة تحقق مستقلة من المجموع.
# يرفض التصدير: المحجوز في content-hold، demo، الموثّقة بلا شرح/مرجع (والعامة unsourced مقبولة)، الضعيف/الموضوع من حزمة verified-sahih (يُصدَّران منفصلين). أقسام التطبيق (scripts/native/sections) بالقواعد نفسها؛ الشبهات لا تدخل إلا بدليل متحقَّق من Tanzil ومصدر.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/artifacts/majalis"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
ADH=content/native/adhkar-verified.json  # لقطة الأذكار الموثّقة (تُمرَّر تلقائيًا إن وُجدت؛ لا تُنشأ أذكار)
# قفل ذري (mkdir): تصدير واحد في الوقت؛ ينتظر حتى 10 دقائق ثم يفشل بلا كتابة. يُحذف عند الخروج دائمًا.
# $LOCK/owner: pid + مالك الجلسة + وقت البدء. لا يُكسر قفل إلا إن كان pid المسجَّل ميتًا فعلًا (kill -0)؛ وإلا يُطبع مالكه وعمره.
# بديل pkill: `bash scripts/native-export-data.sh --abort` يوقف تصديرك أنت فقط (pid من الملف، وبشرط أن يكون المالك هذه النافذة).
LOCK="$ROOT/ios-native/.export.lock"; mkdir -p "$ROOT/ios-native"
ME="${NATIVE_WINDOW:-${USER:-?}@$(basename "$ROOT")}"
own() { sed -n "s/^$1=//p" "$LOCK/owner" 2>/dev/null | head -1 || true; }
describe() { local st; st=$(own started); echo "pid $(own pid) · مالك $(own owner) · عمره $(( st ? $(date +%s) - st : 0 ))ث"; }
if [ "${1:-}" = "--abort" ]; then
  [ -d "$LOCK" ] || { echo "لا قفل تصدير قائم" >&2; exit 0; }
  [ -f "$LOCK/owner" ] || { echo "رُفض: قفل قديم بلا مالك مسجَّل (pid $(cat "$LOCK/pid" 2>/dev/null || echo ?)) — لا يُوقَف من هنا" >&2; exit 1; }
  if [ "$(own owner)" != "$ME" ]; then echo "رُفض: القفل يخصّ غيرك ($(describe)) — لا يُوقَف من هنا" >&2; exit 1; fi
  P=$(own pid); kill -0 "$P" 2>/dev/null && kill "$P" && echo "أُوقف تصديرك (pid $P)"; exit 0
fi
OUT="${1:-$ROOT/ios-native/Data}"
for i in $(seq 1 120); do
  if mkdir "$LOCK" 2>/dev/null; then printf 'pid=%s\nowner=%s\nstarted=%s\n' "$$" "$ME" "$(date +%s)" > "$LOCK/owner"; echo $$ > "$LOCK/pid"; break; fi
  OWNER=$(own pid); [ -n "$OWNER" ] || OWNER=$(cat "$LOCK/pid" 2>/dev/null || true)
  if [ -n "$OWNER" ] && ! kill -0 "$OWNER" 2>/dev/null; then echo "قفل يتيم (pid $OWNER ميت) — يُكسر" >&2; rm -rf "$LOCK"; continue; fi
  [ "$i" -eq 1 ] && echo "ينتظر قفل غيره: $(describe)" >&2
  [ "$i" -eq 120 ] && { echo "رُفض: تصدير آخر يعمل منذ أكثر من 10 دقائق ($(describe)) — لم يُكتب شيء" >&2; exit 1; }
  sleep 5
done
# حارس: يُصدَّر إلى مجلد مؤقت أولًا؛ فشل التصدير أو نقص عدد الملفات لا يمسّ $OUT
FINAL="$OUT"; OUT="$(mktemp -d "${TMPDIR:-/tmp}/native-data.XXXXXX")"; trap 'rm -rf "$OUT" "$LOCK"' EXIT
node --import tsx scripts/native/export-ios-data.mjs --out "$OUT" ${ADH:+$( [ -f "$ADH" ] && echo "--adhkar-json $ADH" )}
# الضعيف/الموضوع: ملفان منفصلان عن verified-sahih (قرار يوسف 2026-10-14، DATA_CONTRACT §5.2)
(cd "$ROOT" && node scripts/native-export-weak-hadith.mjs "$OUT/hadith")
NEW=$(find "$OUT" -type f | wc -l | tr -d ' '); OLD=0; [ -d "$FINAL" ] && OLD=$(find "$FINAL" -type f ! -name .input-hash | wc -l | tr -d ' ')
if [ "$NEW" -lt "$OLD" ]; then echo "رُفض: الملفات الجديدة $NEW أقل من الحالية $OLD — لم يُمسّ $FINAL" >&2; exit 1; fi
node --input-type=module -e '
import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path";
const out = process.argv[1]; const m = JSON.parse(fs.readFileSync(path.join(out, "MANIFEST.json"), "utf8"));
for (const f of m.files) { const b = fs.readFileSync(path.join(out, f.path)); if (b.length !== f.bytes || crypto.createHash("sha256").update(b).digest("hex") !== f.sha256) { console.error("checksum mismatch:", f.path); process.exit(1); } }
const holds = new Set(JSON.parse(fs.readFileSync("content/content-hold.json", "utf8")).holds.map((h) => h.id));
let q = 0;
for (const f of m.files.filter((x) => /^quiz\/(?!manifest)/.test(x.path))) for (const r of JSON.parse(fs.readFileSync(path.join(out, f.path), "utf8"))) { q++; if (/^demo[-_]/i.test(String(r.id)) || holds.has(r.id) || !String(r.question || "").trim() || !String(r.answer || "").trim() || (r.documentation_status !== "unsourced" && (!String(r.reference || "").trim() || !String(r.explanation || "").trim()))) { console.error("سؤال غير مقبول:", r.id); process.exit(1); } }
console.log(JSON.stringify({ ok: true, files: m.files.length, quizAccepted: q, manifest: path.join(out, "MANIFEST.json"), manifestSha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(out, "MANIFEST.json"))).digest("hex") }));
' "$OUT"
mkdir -p "$FINAL" && cp -R "$OUT"/. "$FINAL"/
