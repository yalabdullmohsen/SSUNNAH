#!/usr/bin/env bash
# اختبار تكامل التسميع على محاكي iOS — يُشغَّل يدويًا (CI لا يملك نموذج WhisperKit ولا محاكيًا بزمن حقيقي).
#
# السلسلة المختبَرة كلها حقيقية ما عدا مصدر الصوت:
#   ملف مسجَّل → TasmeeEngine.append (مدخل نقرة الميكروفون نفسه، بإيقاع الزمن الحقيقي) → حلقة فك WhisperKit
#   → حدث tasmeePartial → RecitationTracker → reducer → سمة data-tasmee على كلمات صفحة المصحف في WKWebView.
# التغذية من ملف موجودة في بناء Debug/TestFlight فقط (TASMEE_DIAGNOSTICS)؛ النتيجة علامات كلمات فقط بلا صوت.
#
# الاستعمال:
#   bash scripts/tasmee-sim-integration.sh [ملف.wav] [صفحة] [ثوانٍ] [بداية-بالثواني]
#   الافتراضي: مقطع العفاسي من corpus/set/afasy_medium.wav، الصفحة 562 (الملك ١–١٢)، 40 ثانية من البداية.
#   TASMEE_SWAP=k:j  حقن خطأ لاختبار حلقة التنبيه: صوت الكلمة k من المقطع يُستبدل بصوت الكلمة j (من ملف truth.json المجاور).
#   SKIP_BUILD=1     إعادة التشغيل بلا بناء.
# المتطلبات: محاكي iOS مُقلَع، Xcode، شبكة لتنزيل النموذج أول مرة (يُحفظ في حاوية التطبيق بعدها).
# المخرَج: $TASMEE_SIM_OUT (افتراضيًا $TMPDIR/tasmee-sim)/tasmee-sim-integration-<وقت>.json — خارج المستودع + حكم المدقِّق (scripts/tasmee-sim-integration-check.mjs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
WAV="${1:-$HOME/.majalis-tools/bench-work/corpus/set/afasy_medium.wav}"
PAGE="${2:-562}"
SEC="${3:-40}"
FROM="${4:-0}"
BUNDLE=com.yousef.majlisilm
SIM="${TASMEE_SIM:-booted}"
OUT_DIR="${TASMEE_SIM_OUT:-${TMPDIR:-/tmp}/tasmee-sim}"
DERIVED="${TMPDIR:-/tmp}/tasmee-sim-derived"
WEB="${TMPDIR:-/tmp}/tasmee-sim-web"
mkdir -p "$OUT_DIR"

[[ -f "$WAV" ]] || { echo "ملف الصوت غير موجود: $WAV" >&2; exit 1; }

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  echo "==> vite build (native)"
  VITE_TARGET=native PORT="${PORT:-24216}" BASE_PATH="${BASE_PATH:-/}" npx vite build --config vite.config.ts --outDir "$WEB" --emptyOutDir >/dev/null
  echo "==> xcodebuild Debug (محاكي)"
  xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
    -destination "generic/platform=iOS Simulator" -derivedDataPath "$DERIVED" -quiet build
  APP="$DERIVED/Build/Products/Debug-iphonesimulator/App.app"
  # الإعداد يوجّه WebView إلى الموقع المنشور (server.url)؛ الاختبار يحتاج حزمة الويب المحلية من هذا الفرع،
  # فتوضع حزمة VITE_TARGET=native (خارج المستودع) في نسخة البناء ويُنزع منها server.url (لا يُمسّ أي ملف في المستودع، ولا cap sync).
  rm -rf "$APP/public" && cp -R "$WEB" "$APP/public"
  cp ios/App/App/public/cordova*.js ios/App/App/public/native-load-error.html "$APP/public/" 2>/dev/null || true
  python3 - "$APP/capacitor.config.json" <<'PY'
import json, sys
p = sys.argv[1]; c = json.load(open(p)); c.get("server", {}).pop("url", None)
json.dump(c, open(p, "w"), ensure_ascii=False, indent=1)
PY
  xcrun simctl install "$SIM" "$APP"
fi

DOCS="$(xcrun simctl get_app_container "$SIM" "$BUNDLE" data)/Documents"
mkdir -p "$DOCS"
FEED=tasmee-feed.wav
trap 'rm -f "$DOCS/$FEED"' EXIT
echo "==> مقطع ${SEC}ث من ${FROM}ث → Documents/$FEED"
TRUTH="${WAV%.wav}.truth.json"
python3 - "$WAV" "$DOCS/$FEED" "$FROM" "$SEC" "$TRUTH" "${TASMEE_SWAP:-}" <<'PY'
import sys, wave, json
src, dst, start, dur, truth, swap = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6]
with wave.open(src) as r:
    fr, width = r.getframerate(), r.getsampwidth()
    params = r.getparams(); allf = r.readframes(r.getnframes())
b = lambda ms: int(ms / 1000 * fr) * width
if swap:
    words = [w for w in json.load(open(truth)) if w["startMs"] >= start * 1000]
    k, j = (int(x) for x in swap.split(":"))
    wk, wj = words[k], words[j]
    allf = allf[:b(wk["startMs"])] + allf[b(wj["startMs"]):b(wj["endMs"])] + allf[b(wk["endMs"]):]
frames = allf[b(start * 1000):b((start + dur) * 1000)]
with wave.open(dst, "wb") as w:
    w.setparams(params); w.writeframes(frames)
PY
rm -f "$DOCS/tasmee-feed-result.json"

echo "==> تشغيل التطبيق بوسائط التغذية"
xcrun simctl terminate "$SIM" "$BUNDLE" 2>/dev/null || true
xcrun simctl launch "$SIM" "$BUNDLE" -TasmeeFeedFile "$FEED" -TasmeeFeedPage "$PAGE" -TasmeeFeedSec "$SEC" >/dev/null

# تنزيل النموذج أول مرة + الإقلاع + مدة المقطع + الحسم
DEADLINE=$(( $(date +%s) + ${TASMEE_SIM_TIMEOUT:-600} ))
until [[ -f "$DOCS/tasmee-feed-result.json" ]]; do
  (( $(date +%s) < DEADLINE )) || { echo "انتهت المهلة بلا نتيجة" >&2; xcrun simctl terminate "$SIM" "$BUNDLE" 2>/dev/null || true; exit 1; }
  sleep 5
done
RESULT="$OUT_DIR/tasmee-sim-integration-$(date +%Y%m%d-%H%M%S).json"
cp "$DOCS/tasmee-feed-result.json" "$RESULT"
rm -f "$DOCS/$FEED"   # لا يبقى صوت في الحاوية بعد الاختبار
xcrun simctl terminate "$SIM" "$BUNDLE" 2>/dev/null || true
node scripts/tasmee-sim-integration-check.mjs "$RESULT" "$([[ -f "$TRUTH" ]] && echo "$TRUTH" || echo -)" "$FROM" "${TASMEE_SWAP:-}"
