#!/usr/bin/env bash
# حارس خطافات لقطات التدقيق (SNAP_DRAWER/ROUTE/SCROLL/BOTTOM/DETAIL…): يجب أن تقع كلها داخل #if DEBUG، ولا يظهر أي رمز منها في بناء Release.
# الاستخدام: native-debug-hooks-guard.sh            ← فحص المصدر (كل ظهور داخل #if DEBUG وليس في فرع #else)
#            native-debug-hooks-guard.sh <App.app>  ← فحص المصدر + البحث عن الرموز في binary البناء (Release أو الأرشيف)
set -uo pipefail
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
SYMS='SnapshotScroll|snapshotScroll|SNAP_DRAWER|SNAP_ROUTE|SNAP_SCROLL|SNAP_BOTTOM|SNAP_DETAIL|SnapBottomAnchor|snapFirst|snapShowsPending'
DIRS=${GUARD_DIRS:-"artifacts/majalis/ios/App/SunnahNative/Sources ios-native"}
bad=0
# shellcheck disable=SC2086
while IFS= read -r f; do
  out=$(awk -v syms="$SYMS" -v f="$f" '
    /^[ \t]*#if[ \t(]/ { n++; dbg[n] = ($0 ~ /^[ \t]*#if[ \t]+DEBUG[ \t]*(\/\/.*)?$/) ? 1 : 0; next }
    /^[ \t]*#else/ { if (n > 0 && dbg[n] == 1) dbg[n] = 0; next }
    /^[ \t]*#elseif/ { if (n > 0 && dbg[n] == 1) dbg[n] = 0; next }
    /^[ \t]*#endif/ { if (n > 0) n--; next }
    $0 ~ syms { inDebug = 0; for (i = 1; i <= n; i++) if (dbg[i]) inDebug = 1; if (!inDebug) printf "%s:%d: %s\n", f, NR, $0 }
  ' "$f")
  [ -n "$out" ] && { echo "$out" | cut -c1-200; bad=1; }
done < <(git ls-files $DIRS | grep '\.swift$' | xargs grep -lE "$SYMS" 2>/dev/null)
[ "$bad" = 0 ] || { echo "native-debug-hooks-guard: رموز لقطات خارج #if DEBUG (أعلاه)" >&2; exit 1; }
if [ -n "${1:-}" ]; then
  APP=$1; [ -d "$APP" ] || { echo "native-debug-hooks-guard: التطبيق غير موجود: $APP" >&2; exit 2; }
  # كل ملفات الحزمة (binary الرئيسي وSunnahApp.debug.dylib والإطارات والـappex) لا الـbinary الرئيسي وحده
  hits=$(grep -raEl "$SYMS" "$APP" 2>/dev/null | head)
  [ -z "$hits" ] || { echo "$hits"; echo "native-debug-hooks-guard: رموز لقطات داخل البناء: $APP" >&2; exit 1; }
  echo "بناء نظيف ($(find "$APP" -type f | wc -l | tr -d ' ') ملفًا فُحصت): $APP"
fi
echo "native-debug-hooks-guard: OK"
