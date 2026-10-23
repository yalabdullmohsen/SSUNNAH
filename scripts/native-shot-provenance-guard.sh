#!/usr/bin/env bash
# حارس CI: أي PR يضيف لقطات (png/jpg) تحت docs/native/ يجب أن يضيف/يحتفظ بـPROVENANCE.txt في نفس المجلد (من native-shot-guard.sh)
# بـgit_sha صالح (40 hex، ومن أسلاف HEAD إن وُجد في السجل) وbinary_sha256. بدونه تُعدّ اللقطات من بناء مجهول ويفشل الفحص.
# BASE_REF (الافتراضي origin/native-app)، GUARD_REPO للاختبار.
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
BASE=${BASE_REF:-origin/native-app}; fail=0; bad() { echo "✗ $1" >&2; fail=1; }
git rev-parse -q --verify "$BASE" >/dev/null || { echo "native-shot-provenance: لا مرجع $BASE — تخطٍّ (اجلبه بـgit fetch)"; exit 0; }
dirs=$(git diff --name-only --diff-filter=A "$BASE"...HEAD -- 'docs/native/' | grep -Ei '\.(png|jpe?g)$' | xargs -I{} dirname {} | sort -u)
for d in $dirs; do
  p="$d/PROVENANCE.txt"
  [ -f "$p" ] || { bad "$d: لقطات مضافة بلا PROVENANCE.txt (شغّل native-shot-guard.sh على اللقط)"; continue; }
  sha=$(sed -n 's/^git_sha=//p' "$p" | head -1)
  # الصيغة حقل في كل سطر كما يكتبها native-shot-guard.sh؛ ملف مكتوب يدويًا على سطر واحد يُرفض بإرشاد صريح.
  hint="(حقل واحد في كل سطر: git_sha=<40 hex> ثم binary_sha256=… — ولّده بـscripts/native-shot-guard.sh ولا تكتبه يدويًا)"
  echo "$sha" | grep -Eq '^[0-9a-f]{40}$' || { bad "$p: git_sha غير صالح $hint"; continue; }
  grep -Eq '^binary_sha256=[0-9a-f]{64}$' "$p" || bad "$p: binary_sha256 مفقود $hint"
  if git cat-file -e "$sha^{commit}" 2>/dev/null; then git merge-base --is-ancestor "$sha" HEAD || bad "$p: git_sha ليس من أسلاف HEAD (لقطات من فرع آخر)"; fi
done
[ "$fail" = 0 ] && echo "✓ لقطات PR كلها بمصدر موثّق (PROVENANCE.txt)"
exit "$fail"
