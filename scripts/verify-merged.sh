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
  # كان هنا `gh pr checks --watch`: يعلّق لأنه ينتظر كل الفحوص بما فيها Vercel (غير مطلوبة وقد تبقى pending/تُعاد بلا نهاية)
  # فلا يعود حتى بعد دمج الـPR. الآن نستطلع الحالة: ننتهي عند MERGED/CLOSED أو فشل حقيقي أو انتهاء المهلة (VERIFY_TIMEOUT ثانية، الافتراضي 1800).
  waited=0
  while [ "$waited" -lt "${VERIFY_TIMEOUT:-1800}" ]; do
    st=$(gh pr view "$n" --json state --jq .state 2>/dev/null)
    [ "$st" = MERGED ] || [ "$st" = CLOSED ] && break
    [ -n "$(real_failures "$n")" ] && break
    [ -n "${VERIFY_NOWAIT:-}" ] && break
    sleep 20; waited=$((waited+20))
  done
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
