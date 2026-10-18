#!/usr/bin/env bash
# سقف (ratchet) لحاويات SwiftUI الافتراضية `List`/`Form`/`DisclosureGroup` خارج Components (docs/native/DESIGN_SYSTEM_SPEC.md §5).
# يفشل إن زاد العدد على docs/native/default-containers-budget.txt؛ يُخفَّض السقف بعد الهجرة ولا يُرفع.
# الاستعمال: bash scripts/native-default-containers-guard.sh   (من جذر المستودع)
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
S="${CONTAINERS_GUARD_SRC:-$ROOT/artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative}"
B="$ROOT/docs/native/default-containers-budget.txt"
cap=$(tr -d '[:space:]' < "$B")
n=$(grep -rE '(^|[^A-Za-z])(List|Form|DisclosureGroup)(\(| \{)' "$S" 2>/dev/null | grep -v '/Components/' | grep -vE '^[^:]+:[0-9]+:\s*//' | wc -l | tr -d ' ')
if [ "$n" -gt "$cap" ]; then echo "✗ حاويات افتراضية: $n > السقف $cap — استعمل ScrollView+LazyVStack مع ListRow/Card"; exit 1; fi
[ "$n" -lt "$cap" ] && echo "ℹ︎ العدد $n أقل من السقف $cap — اخفض docs/native/default-containers-budget.txt"
echo "✓ الحاويات الافتراضية $n ≤ $cap"
