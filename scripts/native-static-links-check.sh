#!/usr/bin/env bash
# حارس الروابط الثابتة: كل رابط github.io/sunnah-legal داخل مصادر التطبيق يجب أن يعيد 200.
# terms.html لا يُشترط (يعيد 404 عمدًا؛ اتفاقية Apple القياسية تبقى) ويُرفض ورود رابطه في التطبيق حتى تنشره ن5 (docs/site).
# الاستخدام: scripts/native-static-links-check.sh   (يحتاج اتصالًا؛ بلا اتصال يُتخطّى بتحذير ولا يفشل)
set -uo pipefail
cd "$(dirname "$0")/.."
SRC=${SRC:-artifacts/majalis/ios/App/SunnahNative/Sources}
urls=$( { grep -rhoE 'https://yalabdullmohsen\.github\.io/sunnah-legal/[A-Za-z0-9_./-]+' "$SRC" 2>/dev/null; } | sort -u)
bad=0
for u in $urls; do
  case "$u" in *terms.html*) echo "✗ $u: صفحة terms غير منشورة (404) — احذف الرابط أو انشرها عبر ن5"; bad=1; continue;; esac
  code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' -L "$u" 2>/dev/null); code=${code: -3}
  case "$code" in
    200) echo "✓ $u";;
    000) echo "⚠ $u: لا اتصال — تُخطّى" ;;
    *) echo "✗ $u: HTTP $code"; bad=1;;
  esac
done

# تغطية docs/site: (1) كل رابط legal في التطبيق له صفحة في docs/site، (2) الروابط الداخلية والبريد صحيحة، (3) الصفحة المنشورة تطابق docs/site (بعد حقن البريد كما يفعل build.mjs في sunnah-legal)
SITE=${SITE:-docs/site}; LIVE=${LIVE:-https://yalabdullmohsen.github.io/sunnah-legal}
email=$(sed -n 's/.*SUPPORT_EMAIL *= *"\([^"]*\)".*/\1/p' "$SITE/config.js" 2>/dev/null | head -1)
[ -n "$email" ] || { echo "✗ $SITE/config.js بلا SUPPORT_EMAIL"; bad=1; }
for u in $urls; do pg=${u##*/}; [ -f "$SITE/$pg" ] || { echo "✗ $u: لا صفحة $SITE/$pg لنشرها"; bad=1; }; done
for f in "$SITE"/*.html; do
  [ -f "$f" ] || continue; pg=$(basename "$f")
  for h in $(grep -oE 'href="[^"#:]+"' "$f" | sed 's/href="//;s/"$//' | sort -u); do [ -f "$SITE/$h" ] || { echo "✗ $pg: رابط داخلي مكسور $h"; bad=1; }; done
  for m in $(grep -oE 'mailto:[^"]+' "$f" | sed 's/mailto://' | sort -u); do [ "$m" = "$email" ] || { echo "✗ $pg: بريد $m يخالف config.js ($email)"; bad=1; }; done
  want=$(sed -e 's#<script src="config.js"></script>##' -e "s#<a data-support-email>…</a>#<a href=\"mailto:$email\">$email</a>#g" "$f" | sed 's/[[:space:]]*$//' | shasum | cut -c1-12)
  got=$(curl -s -m 15 -L "$LIVE/$pg" 2>/dev/null | sed 's/[[:space:]]*$//' | shasum | cut -c1-12); live=$(curl -s -o /dev/null -m 15 -w '%{http_code}' -L "$LIVE/$pg" 2>/dev/null); live=${live: -3}
  case "$live" in 200) [ "$want" = "$got" ] && echo "✓ $pg منشورة ومطابقة" || { echo "✗ $pg: المنشورة تخالف $SITE (انشرها: build.mjs في sunnah-legal)"; bad=1; };; 000) echo "⚠ $pg: لا اتصال — تُخطّى";; *) echo "✗ $LIVE/$pg: HTTP $live"; bad=1;; esac
done
exit $bad
