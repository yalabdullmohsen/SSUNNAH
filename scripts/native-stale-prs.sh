#!/usr/bin/env bash
# يسرد كل PR مفتوح على native-app ويصنّفه: متعارض / متأخر >20 commit / بلا فحوص إلزامية ناجحة / خامل >4 ساعات.
# الاستخدام: scripts/native-stale-prs.sh [--strict]   (--strict: يفشل إن وُجد PR متعارض عمره >4 ساعات؛ يستعمله native-rc-gate.sh)
# الفحوص الإلزامية: gate وdeterministic وownership (Vercel غير مطلوب). الحدود قابلة للتعديل: STALE_HOURS=4 BEHIND_MAX=20
set -uo pipefail
BASE=native-app; HOURS=${STALE_HOURS:-4}; BEHIND=${BEHIND_MAX:-20}; STRICT=0; [ "${1:-}" = --strict ] && STRICT=1
[ -n "${STALE_PRS_JSON:-}" ] || repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null) || { echo "⚠ gh غير متاح — تخطّي فحص PRات المتروكة" >&2; exit 0; }
[ -n "${STALE_PRS_JSON:-}" ] || git fetch -q origin "$BASE" 2>/dev/null
now=$(date +%s); bad=0; rows=0
printf '%-6s %-5s %-34s %s\n' PR صاحب الحالة الرابط
while IFS=$'\t' read -r n head merge upd req url; do
  owner=$(printf '%s' "$head" | grep -oE '^n[0-9]+' || echo "${head%%/*}")
  ts=$(date -j -u -f '%Y-%m-%dT%H:%M:%SZ' "$upd" +%s 2>/dev/null || date -u -d "$upd" +%s)
  age=$(( (now-ts)/3600 )); tags=()
  [ "$merge" = CONFLICTING ] && { tags+=("متعارض ${age}س"); [ "$age" -ge "$HOURS" ] && bad=1; }
  b=$(git rev-list --count "origin/$head..origin/$BASE" 2>/dev/null || echo 0)
  [ "$b" -gt "$BEHIND" ] && tags+=("متأخر $b commit")
  [ "$req" != OK ] && tags+=("إلزامي غير ناجح: $req")
  [ "$age" -ge "$HOURS" ] && [ "$merge" != CONFLICTING ] && tags+=("خامل ${age}س")
  [ ${#tags[@]} -eq 0 ] && continue
  rows=$((rows+1)); printf '#%-5s %-5s %-34s %s\n' "$n" "$owner" "$(IFS='،'; echo "${tags[*]}")" "$url"
done < <(if [ -n "${STALE_PRS_JSON:-}" ]; then jq -r -f "$(dirname "$0")/native-stale-prs.jq" "$STALE_PRS_JSON"
  else gh pr list -B "$BASE" --state open --limit 100 --json number,headRefName,mergeable,updatedAt,statusCheckRollup,url | jq -r -f "$(dirname "$0")/native-stale-prs.jq"; fi)
[ "$rows" = 0 ] && echo "✓ لا PRات متروكة على $BASE"
if [ "$bad" = 1 ]; then echo "✗ PR متعارض من أكثر من ${HOURS} ساعات" >&2; [ "$STRICT" = 1 ] && exit 1; fi
exit 0
