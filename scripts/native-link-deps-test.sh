#!/usr/bin/env bash
# اختبار: worktree بلا node_modules يحصل على الروابط تلقائيًا؛ الموجود لا يُستبدل؛ المستودع الرئيسي نفسه لا يُمسّ.
set -uo pipefail
S="$(cd "$(dirname "$0")" && pwd)/native-link-deps.sh"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; f=0
ok() { [ "$1" = 0 ] && echo "✓ $2" || { echo "✗ $2"; f=1; }; }
mkdir -p "$T/main/node_modules/.bin" "$T/main/artifacts/majalis/node_modules" "$T/wt/artifacts/majalis"
touch "$T/main/node_modules/.bin/tsx"
NATIVE_MAIN_ROOT="$T/main" bash "$S" "$T/wt" 2>/dev/null
[ -e "$T/wt/node_modules/.bin/tsx" ]; ok $? "tsx يُحَلّ من الرئيسي"
[ -L "$T/wt/artifacts/majalis/node_modules" ]; ok $? "node_modules الفرعي مربوط"
mkdir -p "$T/wt2/node_modules"; NATIVE_MAIN_ROOT="$T/main" bash "$S" "$T/wt2" 2>/dev/null
[ ! -L "$T/wt2/node_modules" ]; ok $? "الموجود لا يُستبدل"
NATIVE_MAIN_ROOT="$T/main" bash "$S" "$T/main" 2>/dev/null; [ ! -L "$T/main/node_modules" ]; ok $? "الرئيسي لا يُمسّ"
exit $f
