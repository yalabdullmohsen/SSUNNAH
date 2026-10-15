#!/usr/bin/env bash
# يفشل إن وُجد في السكربتات حذف/مسح محاكٍ لم يُنشأ في السكربت نفسه (قاعدة WORKFLOW.md «المحاكيات»).
set -u
cd "$(git rev-parse --show-toplevel)"
BAD=$(git ls-files '*.sh' '*.rb' '*.py' '*.mjs' ':!:scripts/check-no-sim-delete.sh' | while read -r f; do
  rg -n 'simctl (erase|shutdown all|delete (unavailable|all))|simctl delete' "$f" 2>/dev/null | while read -r l; do
    # الحذف المسموح: ملف أنشأ محاكيه بنفسه (simctl create) وحذف متغيره فقط
    if rg -q 'simctl create' "$f" && ! echo "$l" | rg -q 'erase|shutdown all|unavailable|delete all'; then continue; fi
    echo "$f:$l"
  done
done)
[ -z "$BAD" ] || { echo "ممنوع: حذف/مسح محاكٍ غير منشأ في السكربت:" >&2; echo "$BAD" >&2; exit 1; }
echo "OK: لا حذف محاكيات"
