#!/usr/bin/env bash
# حارس عنوان الشاشة: يمنع `.navigationTitle(` الخام خارج مكوّن SunnahNavTitle (يقطع العنوان بـ«…» عند الأحجام الكبيرة)؛ المسموح `.sunnahNavTitle(` أو `registryTitle`.
# `navigationTitle("")` (شاشة عنوانها في المتن) مسموح. ملفات لم تُحوَّل بعد في scripts/native-nav-title-allow.txt (تتقلص فقط).
set -uo pipefail
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
DIRS=${GUARD_DIRS:-"artifacts/majalis/ios/App/SunnahNative/Sources"}
ALLOW=${GUARD_ALLOW:-scripts/native-nav-title-allow.txt}
# shellcheck disable=SC2086
hits=$(git ls-files $DIRS | grep '\.swift$' | grep -v '/Components/SunnahNavTitle\.swift$' \
  | xargs grep -HnE '(^|[^A-Za-z])navigationTitle\((\)|[^")]|"[^"])' 2>/dev/null \
  | grep -vE '^[^:]+:[0-9]+:[[:space:]]*///' || true)
bad=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  f=${line%%:*}
  grep -qxF "$f" "$ALLOW" 2>/dev/null && continue
  echo "$line" | cut -c1-200; bad=1
done <<< "$hits"
[ "$bad" = 0 ] || { echo "native-nav-title-guard: استعمل .sunnahNavTitle( بدل .navigationTitle( (أعلاه)" >&2; exit 1; }
echo "native-nav-title-guard: OK"
