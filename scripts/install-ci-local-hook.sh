#!/usr/bin/env bash
# يربط pnpm run ci:local بخطاف pre-push (مرة واحدة؛ آمن لإعادة التشغيل). الخطاف يبقى محليًا في .git/hooks.
set -euo pipefail
HOOK="$(git rev-parse --git-common-dir)/hooks/pre-push"
[[ -f "$HOOK" ]] || { echo "لا يوجد pre-push في $HOOK" >&2; exit 1; }
grep -q "ci:local" "$HOOK" && { echo "ci:local مربوط مسبقًا"; exit 0; }
python3 - "$HOOK" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
marker = "# 2) preflight"
block = (
    '# 1.5) ci:local — بوابات CI الحاسمة على الملفات المتغيّرة (يوقف الدفع عند الفشل)\n'
    'echo "⏳ ci:local…"\n'
    '"$PNPM_BIN" run ci:local || fail "ci:local"\n'
    'pass "ci:local"\n\n'
)
assert marker in s, "تعذّر إيجاد موضع الإدراج"
open(p, "w").write(s.replace(marker, block + marker, 1))
PY
echo "تم ربط ci:local بـ pre-push"
