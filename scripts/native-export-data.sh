#!/usr/bin/env bash
# يولّد حزمة البيانات المحقَّقة للتطبيق الأصلي من أي worktree بأمر واحد:
#   bash scripts/native-export-data.sh [مجلد_الإخراج]   (الافتراضي: ios-native/Data في جذر هذا الـworktree)
# النتيجة: <out>/MANIFEST.json (مسارات + حجوم + sha256) ثم إعادة تحقق مستقلة من المجموع.
# يرفض التصدير: المحجوز في content-hold، demo، الموثّقة بلا شرح/مرجع (والعامة unsourced مقبولة)، الضعيف/الموضوع من حزمة verified-sahih (يُصدَّران منفصلين). أقسام التطبيق (scripts/native/sections) بالقواعد نفسها؛ الشبهات لا تدخل إلا بدليل متحقَّق من Tanzil ومصدر.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
bash "$ROOT/scripts/native-link-deps.sh" "$ROOT"
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
# تسجيل ملفي الضعيف/الموضوع في MANIFEST (كُتبا بعده) كي لا يصيرا يتيمين عند native-data-orphan-guard
node --input-type=module -e '
import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path";
const out = process.argv[1]; const mp = path.join(out, "MANIFEST.json"); const m = JSON.parse(fs.readFileSync(mp, "utf8"));
for (const p of ["hadith/weak-daif.json", "hadith/weak-mawdu.json"]) { if (!fs.existsSync(path.join(out, p))) continue; const b = fs.readFileSync(path.join(out, p)); m.files = m.files.filter((f) => f.path !== p); m.files.push({ path: p, bytes: b.length, sha256: crypto.createHash("sha256").update(b).digest("hex") }); }
fs.writeFileSync(mp, JSON.stringify(m, null, 2) + "\n");
' "$OUT"
NEW=$(find "$OUT" -type f | wc -l | tr -d ' '); OLD=0
# المقارنة بما صدّره التصدير السابق فعلًا (MANIFEST) لا بكل ما في المجلد، فلا تحجب ملفاتُ يتيمة أو فرقُ فرع التصدير؛ النقص >5٪ يُرفض
[ -f "$FINAL/MANIFEST.json" ] && OLD=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).files.length)' "$FINAL/MANIFEST.json")
if [ "$NEW" -lt $((OLD * 95 / 100)) ]; then echo "رُفض: الملفات الجديدة $NEW أقل من 95٪ من السابقة $OLD — لم يُمسّ $FINAL" >&2; exit 1; fi
node --input-type=module -e '
import fs from "node:fs"; import crypto from "node:crypto"; import path from "node:path";
const out = process.argv[1]; const m = JSON.parse(fs.readFileSync(path.join(out, "MANIFEST.json"), "utf8"));
for (const f of m.files) { const b = fs.readFileSync(path.join(out, f.path)); if (b.length !== f.bytes || crypto.createHash("sha256").update(b).digest("hex") !== f.sha256) { console.error("checksum mismatch:", f.path); process.exit(1); } }
const holds = new Set(JSON.parse(fs.readFileSync("content/content-hold.json", "utf8")).holds.map((h) => h.id));
let q = 0; const ex = new Map();
for (const f of m.files.filter((x) => /^quiz\/(?!manifest)/.test(x.path))) for (const r of JSON.parse(fs.readFileSync(path.join(out, f.path), "utf8"))) { q++; { const e = String(r.explanation || "").trim(); if (e) ex.set(e, (ex.get(e) || 0) + 1); } if (/^demo[-_]/i.test(String(r.id)) || holds.has(r.id) || !String(r.question || "").trim() || !String(r.answer || "").trim() || (r.documentation_status !== "unsourced" && !String(r.reference || "").trim())) { console.error("سؤال غير مقبول:", r.id); process.exit(1); } }
for (const [e, n] of ex) if (n > 3) { console.error("شرح قالبي مكرر", n, "مرات:", e.slice(0, 60)); process.exit(1); }
console.log(JSON.stringify({ ok: true, files: m.files.length, quizAccepted: q, manifest: path.join(out, "MANIFEST.json"), manifestSha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(out, "MANIFEST.json"))).digest("hex") }));
' "$OUT"
# مزامنة صارمة: نسخ ثم حذف كل يتيم من فرع/تصدير سابق، وحارس يفشل لو بقي يتيم (scripts/native-sync-dir.sh، اختباره native-sync-dir.test.sh)
. "$ROOT/scripts/native-sync-dir.sh"
BEFORE=$(find "$FINAL" -type f ! -name .input-hash 2>/dev/null | wc -l | tr -d ' ')
native_sync_dir "$OUT" "$FINAL"
# حارس ما بعد التصدير: خروج 0 لا يكفي — مقارنة عدد الملفات ومحتواها (sha256) بين المصدر المؤقت والوجهة، وفشل عند أي اختلاف (scripts/native-verify-sync.sh)
. "$ROOT/scripts/native-verify-sync.sh"
native_verify_sync "$OUT" "$FINAL" || exit 1
echo "ملفات ios-native/Data: قبل=$BEFORE بعد=$(find "$FINAL" -type f ! -name .input-hash | wc -l | tr -d ' ')"
