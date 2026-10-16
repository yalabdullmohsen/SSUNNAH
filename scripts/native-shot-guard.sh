#!/usr/bin/env bash
# حارس مصدر اللقطات: يفشل (خروج 1) إن كان التطبيق المبني أقدم من آخر تعديل في كود الواجهة (HEAD + الملفات المعدّلة)،
# أو إن اختلف binary المثبّت في المحاكي عن المبني. يكتب PROVENANCE.txt بجانب اللقطات (SHA، مسار التطبيق، هاش الـbinary وتاريخ بنائه).
# الاستخدام: native-shot-guard.sh <App.app> <مجلد اللقطات>   (SIM اختياري للمقارنة مع المثبّت؛ SRC_DIRS وGUARD_REPO للاختبار)
set -uo pipefail
APP=${1:?مسار .app}; OUT=${2:?مجلد اللقطات}; BID=${BID:-com.yousef.majlisilm}
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
SRC_DIRS=${SRC_DIRS:-"artifacts/majalis/ios/App/SunnahNative ios-native"}
die() { echo "native-shot-guard: $*" >&2; exit 1; }
[ -d "$APP" ] || die "التطبيق غير موجود: $APP"
EXE=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Info.plist" 2>/dev/null || true)
BIN="$APP/${EXE:-__none__}"; [ -f "$BIN" ] || BIN="$APP"
mt() { stat -f %m "$1" 2>/dev/null || echo 0; }
BUILT=$(mt "$BIN")
# shellcheck disable=SC2086
NEWEST=$(git log -1 --format=%ct -- $SRC_DIRS 2>/dev/null); NEWEST=${NEWEST:-0}
# shellcheck disable=SC2086
while IFS= read -r f; do [ -f "$f" ] && { m=$(mt "$f"); [ "$m" -gt "$NEWEST" ] && NEWEST=$m; }; done < <(git status --porcelain -- $SRC_DIRS 2>/dev/null | sed 's/^...//')
[ "$BUILT" -ge "$NEWEST" ] || die "التطبيق قديم: بُني $(date -r "$BUILT" '+%F %T') وآخر تعديل للكود $(date -r "$NEWEST" '+%F %T') — أعد البناء من HEAD"
HASH=$( if [ -f "$BIN" ]; then shasum -a 256 "$BIN" | cut -d' ' -f1; else (cd "$BIN" && find . -type f -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -d' ' -f1); fi )
if [ -n "${SIM:-}" ]; then
  C=$(xcrun simctl get_app_container "$SIM" "$BID" app 2>/dev/null) || die "التطبيق غير مثبّت في المحاكي $SIM"
  IB="$C/${EXE:-__none__}"; [ -f "$IB" ] || die "binary المثبّت غير موجود"
  [ "$(shasum -a 256 "$IB" | cut -d' ' -f1)" = "$HASH" ] || die "المثبّت في المحاكي ≠ المبني من $APP — أعد التثبيت"
fi
mkdir -p "$OUT"
{ echo "git_sha=$(git rev-parse HEAD)"; echo "branch=$(git rev-parse --abbrev-ref HEAD)"; echo "app=$APP"
  echo "binary_sha256=$HASH"; echo "built_at=$(date -r "$BUILT" '+%F %T')"; echo "source_newest=$(date -r "$NEWEST" '+%F %T')"
  echo "captured_at=$(date '+%F %T')"; } | tee "$OUT/PROVENANCE.txt"
