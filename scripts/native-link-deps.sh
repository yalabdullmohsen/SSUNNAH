#!/usr/bin/env bash
# في أي git worktree بلا node_modules: يربط (symlink تلقائيًا) node_modules الجذر وartifacts/majalis من المستودع الرئيسي،
# حتى يجد tsx والحزم عند تشغيل التصدير. لا يلمس ما هو موجود. الاستعمال: bash scripts/native-link-deps.sh [جذر-worktree]
# اختبار: NATIVE_MAIN_ROOT=<جذر بديل>
set -uo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
MAIN="${NATIVE_MAIN_ROOT:-$(cd "$(git -C "$ROOT" rev-parse --git-common-dir 2>/dev/null)/.." 2>/dev/null && pwd)}"
[ -n "$MAIN" ] && [ "$MAIN" != "$ROOT" ] || exit 0
for d in node_modules artifacts/majalis/node_modules; do
  if [ ! -e "$ROOT/$d" ] && [ -d "$MAIN/$d" ]; then
    mkdir -p "$(dirname "$ROOT/$d")" && ln -s "$MAIN/$d" "$ROOT/$d" && echo "native-link-deps: $d → $MAIN/$d" >&2
  fi
done
exit 0
