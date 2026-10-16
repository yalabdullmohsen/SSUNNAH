#!/usr/bin/env bash
# حارس الروابط الثابتة: كل رابط github.io/sunnah-legal داخل مصادر التطبيق يجب أن يعيد 200.
# terms.html لا يُشترط (يعيد 404 عمدًا؛ اتفاقية Apple القياسية تبقى) ويُرفض ورود رابطه في التطبيق حتى تنشره ن5 (docs/site).
# الاستخدام: scripts/native-static-links-check.sh   (يحتاج اتصالًا؛ بلا اتصال يُتخطّى بتحذير ولا يفشل)
set -uo pipefail
cd "$(dirname "$0")/.."
SRC=${SRC:-artifacts/majalis/ios/App/SunnahNative/Sources}
urls=$( { grep -rhoE 'https://yalabdullmohsen\.github\.io/sunnah-legal/[A-Za-z0-9_./-]+' "$SRC" 2>/dev/null; } | sort -u)
[ -n "$urls" ] || { echo "✓ لا روابط sunnah-legal في المصادر"; exit 0; }
bad=0
for u in $urls; do
  case "$u" in *terms.html*) echo "✗ $u: صفحة terms غير منشورة (404) — احذف الرابط أو انشرها عبر ن5"; bad=1; continue;; esac
  code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' -L "$u" 2>/dev/null || echo 000)
  case "$code" in
    200) echo "✓ $u";;
    000) echo "⚠ $u: لا اتصال — تُخطّى" ;;
    *) echo "✗ $u: HTTP $code"; bad=1;;
  esac
done
exit $bad
