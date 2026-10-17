#!/usr/bin/env bash
# حارس تغطية الوسم visually-verified (درس #3452): لكل ملف حسّاس (.github/content-sensitive-paths) في فرق BASE...HEAD
# يجب أن توجد لقطة (png/jpg) مضافة/معدّلة في الـPR باسم الملف أو شاشته، أو سطر في PROVENANCE.txt المعدَّل فيه اسم الملف/الشاشة
# (أو «covers=<اسم>»). وإلا يفشل (خروج 1) ويسرد الملفات غير المغطّاة. الاستعمال: native-sensitive-coverage.sh [BASE=origin/native-app] [HEAD=HEAD]
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
BASE=${1:-${BASE_REF:-origin/native-app}}; HEAD_REF=${2:-HEAD}
CHK=${SENSITIVE_CHECK:-$(cd "$(dirname "$0")" && pwd)/content-sensitive-check.sh}
git rev-parse -q --verify "$BASE" >/dev/null || { echo "native-sensitive-coverage: لا مرجع $BASE — تخطٍّ"; exit 0; }
changed=$(git diff --name-only --diff-filter=AMR "$BASE...$HEAD_REF")
sens=$(echo "$changed" | bash "$CHK")
[ -n "$sens" ] || { echo "✓ لا ملفات حسّاسة في الفرق"; exit 0; }
norm() { tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9\n'; }
corpus=$( { echo "$changed" | grep -Ei '\.(png|jpe?g)$'
  for f in $(echo "$changed" | grep -E '(^|/)PROVENANCE\.txt$'); do git show "$HEAD_REF:$f" 2>/dev/null; done; } | norm)
fail=0
while IFS= read -r p; do
  [ -n "$p" ] || continue
  b=$(basename "$p"); stem=${b%.*}; cands="$stem"
  s2=$(echo "$stem" | sed -E 's/(Screens|Screen|Views|View|Adapters|Models|Content|Reading)$//'); [ "$s2" != "$stem" ] && cands="$cands $s2"
  case "$p" in */Data/*) cands="$cands $(basename "$(dirname "$p")")";; esac
  ok=no
  for c in $cands; do n=$(echo "$c" | norm); [ ${#n} -ge 4 ] && echo "$corpus" | grep -qF "$n" && { ok=yes; break; }; done
  [ $ok = yes ] || { echo "✗ بلا لقطة/سطر PROVENANCE باسمه أو شاشته: $p" >&2; fail=1; }
done <<< "$sens"
[ $fail = 0 ] && echo "✓ كل ملف حسّاس مغطّى بلقطة مسمّاة"
exit $fail
