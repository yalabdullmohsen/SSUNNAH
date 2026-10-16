#!/usr/bin/env bash
# اختبار native-stale-prs.sh: يُحتسب آخر تشغيل لكل فحص إلزامي فقط (ملغى قديم + ناجح أحدث = ناجح؛ ناجح قديم + فاشل أحدث = فاشل)
cd "$(dirname "$0")/.."; T=$(mktemp); trap 'rm -f "$T"' EXIT; fail=0
mk() { # $1 رقم، $2..: gate بصيغة conclusion@completedAt
  echo "{\"number\":$1,\"headRefName\":\"n4/x\",\"mergeable\":\"MERGEABLE\",\"updatedAt\":\"2099-01-01T00:00:00Z\",\"url\":\"u$1\",\"statusCheckRollup\":[$2,{\"name\":\"deterministic\",\"conclusion\":\"SUCCESS\",\"completedAt\":\"2026-10-16T01:00:00Z\"},{\"name\":\"ownership\",\"conclusion\":\"SUCCESS\",\"completedAt\":\"2026-10-16T01:00:00Z\"}]}"; }
g() { echo "{\"name\":\"gate\",\"conclusion\":\"$1\",\"completedAt\":\"$2\"}"; }
chk() { # $1 اسم، $2 JSON، $3 متوقع: ok|bad
  echo "[$2]" >"$T"; out=$(STALE_PRS_JSON=$T bash scripts/native-stale-prs.sh 2>&1)
  if echo "$out" | grep -q "إلزامي غير ناجح"; then got=bad; else got=ok; fi
  [ "$got" = "$3" ] || { echo "✗ $1: توقعت $3 فحصلت $got"; echo "$out"; fail=1; }; }
chk "ملغى قديم + ناجح أحدث = ناجح" "$(mk 1 "$(g CANCELLED 2026-10-16T01:00:00Z),$(g SUCCESS 2026-10-16T02:00:00Z)")" ok
chk "ناجح قديم + فاشل أحدث = فاشل" "$(mk 2 "$(g SUCCESS 2026-10-16T01:00:00Z),$(g FAILURE 2026-10-16T02:00:00Z)")" bad
chk "فاشل قديم + ناجح أحدث = ناجح" "$(mk 3 "$(g FAILURE 2026-10-16T01:00:00Z),$(g SUCCESS 2026-10-16T02:00:00Z)")" ok
chk "ناجح قديم + ملغى أحدث = فاشل" "$(mk 4 "$(g SUCCESS 2026-10-16T01:00:00Z),$(g CANCELLED 2026-10-16T02:00:00Z)")" bad
[ $fail = 0 ] && echo "✓ native-stale-prs" || exit 1
