#!/usr/bin/env bash
# مفتاح بناء المحاكي: هاش شجرتَي مصدر التطبيق (ios-native + حزمة SunnahNative) في HEAD. يخرج 3 (بلا طباعة) إن وُجدت تعديلات غير مدفوعة فيهما.
# الاستعمال: native-head-key.sh   → يطبع المفتاح. يُستدعى من native-head-build.sh وnative-shot-guard.sh.
set -uo pipefail
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
SRC_DIRS=${SRC_DIRS:-"artifacts/majalis/ios/App/SunnahNative ios-native"}
# shellcheck disable=SC2086
[ -z "$(git status --porcelain --untracked-files=no -- $SRC_DIRS 2>/dev/null)" ] || exit 3
k=""; for d in $SRC_DIRS; do k="$k$(git rev-parse "HEAD:$d" 2>/dev/null || echo none)"; done
k="$k$(xcrun --sdk iphonesimulator --show-sdk-version 2>/dev/null)"
printf '%s' "$k" | shasum -a 256 | cut -c1-16
