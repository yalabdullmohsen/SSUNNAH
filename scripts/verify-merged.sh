#!/usr/bin/env bash
# يتحقق أن كل PR دُمج فعلًا في native-app بعد اكتمال فحوصه. الاستخدام: scripts/verify-merged.sh 3146 3147 ...
set -u
BASE=native-app
fail=0
git fetch -q origin "$BASE" 2>/dev/null
for n in "$@"; do
  gh pr checks "$n" --watch --interval 20 >/dev/null 2>&1
  read -r state sha < <(gh pr view "$n" --json state,mergeCommit --jq '"\(.state) \(.mergeCommit.oid // "-")"')
  if [ "$state" = MERGED ] && git merge-base --is-ancestor "$sha" "origin/$BASE" 2>/dev/null; then
    echo "#$n MERGED ✓ (في $BASE)"
  else
    echo "#$n $state ✗"; fail=1
    gh pr checks "$n" 2>/dev/null | grep -iE 'fail|error' | head -3
  fi
done
exit $fail
