#!/usr/bin/env bash
# يرفض العمل إن لم يكن المسار والفرع هما المخصّصين للنافذة (لكل نافذة worktree مستقل لا تشاركه نافذة أخرى).
# الاستعمال: bash scripts/native-window-guard.sh n1   (يُستدعى من ensure-sim.sh وسكربتات البدء)
set -euo pipefail
W="${1:?اسم النافذة (n1..n4)}"
case "$W" in
  n1) EXPECT="$HOME/ssunnah-wt/ssunnah-n1" ;;
  *)  exit 0 ;;   # بقية النوافذ لها حارسها الخاص
esac
TOP=$(git rev-parse --show-toplevel 2>/dev/null || true)
BR=$(git branch --show-current 2>/dev/null || true)
fail() { echo "✗ حارس النافذة ${W}: $1" >&2; exit 3; }
[[ "$(cd "$TOP" 2>/dev/null && pwd -P)" == "$(cd "$EXPECT" 2>/dev/null && pwd -P)" ]] || fail "المسار الحالي «${TOP}» ليس worktree النافذة «${EXPECT}»"
[[ -n "$BR" ]] || fail "HEAD منفصل؛ انتقل إلى فرع $W/…"
[[ "$BR" == "$W/"* || "$BR" =~ ^(feat|fix|test|docs|chore)/native- ]] || fail "الفرع «${BR}» ليس فرع ن1 (مثل n1/… أو feat/native-…)"
[[ "$BR" != "native-loop/progress" && "$BR" != "main" && "$BR" != "native-app" ]] || fail "الفرع «${BR}» محجوز"
