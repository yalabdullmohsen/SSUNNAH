#!/usr/bin/env bash
# يتحقق أن كل PR دُمج فعلًا في native-app بعد اكتمال فحوصه. الاستخدام: scripts/verify-merged.sh 3146 3147 ...
set -u
BASE=native-app
fail=0
# فحوص مستثناة صراحة: Vercel تخص الموقع المجمّد ssunnah.com (الحساب محجوب) ولا علاقة لها بتطبيق iOS.
# المعتمد: gate وownership وcontent-sensitive والاختبارات وفحوص iOS والاختبارات وبقية فحوص المستودع. لا تُغيَّر إعدادات Vercel ولا vercel.json.
EXCLUDED_CHECKS='^Vercel( |$)|^Vercel Preview Comments'
# gh pr checks يطبع: الاسم<TAB>الحالة<TAB>...؛ نُسقط المستثنى ثم نبحث عن فشل حقيقي.
real_failures() { gh pr checks "$1" 2>/dev/null | grep -vE "$EXCLUDED_CHECKS" | grep -iE '	(fail|error)'; }
for n in "$@"; do
  gh pr checks "$n" --watch --interval 20 >/dev/null 2>&1
  git fetch -q origin "$BASE" 2>/dev/null   # بعد انتهاء الفحوص: الدمج قد يحدث أثناء الانتظار
  read -r state sha < <(gh pr view "$n" --json state,mergeCommit --jq '"\(.state) \(.mergeCommit.oid // "-")"')
  if [ -n "$(real_failures "$n")" ]; then
    echo "#$n فحص غير Vercel فاشل ✗"; real_failures "$n" | head -3; fail=1
  elif [ "$state" = MERGED ] && git merge-base --is-ancestor "$sha" "origin/$BASE" 2>/dev/null; then
    echo "#$n MERGED ✓ (في $BASE)"
  else
    echo "#$n $state ✗"; fail=1
    real_failures "$n" | head -3
  fi
done
exit $fail
