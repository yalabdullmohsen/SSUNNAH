#!/usr/bin/env bash
# اختبار منطق بوابة content-sensitive على مستودع مؤقت بنسخة حقيقية من السكربتات وقائمة المسارات.
set -uo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; fail=0
ok(){ echo "  ✓ $1"; }; no(){ echo "  ✗ $1"; fail=1; }
cd "$T" && git init -q -b main . && git config user.email a@b && git config user.name t
mkdir -p scripts .github ios-native/Data/hadith docs/shots
cp "$R"/scripts/{content-sensitive-gate,content-sensitive-check,native-sensitive-coverage}.sh scripts/; cp "$R/.github/content-sensitive-paths" .github/
echo a > ios-native/Data/hadith/book.json; echo a > other.txt; git add -A; git commit -qm base; git update-ref refs/remotes/origin/native-app HEAD
git checkout -qb f
run() { env LABELS="$1" ACTION="$2" BEFORE="$3" SHA=HEAD BASE_REF=native-app bash scripts/content-sensitive-gate.sh 2>/dev/null; }
expect() { out=$(run "$2" "$3" "$4"); echo "$out" | grep -q "^STATE=$5$" && echo "$out" | grep -q "^DROP_LABEL=$6$" && ok "$1" || { no "$1"; echo "$out" | sed 's/^/      /'; }; }
# غير حسّاس
echo b >> other.txt; git add -A; git commit -qm c1; B0=$(git rev-parse HEAD~1)
expect "غير حسّاس → success" "" opened "" success no
# حسّاس بلا وسم ولا لقطة → pending
echo b >> ios-native/Data/hadith/book.json; git add -A; git commit -qm c2; B1=$(git rev-parse HEAD)
expect "حسّاس بلا وسم ولا لقطة → pending" "" opened "" pending no
# وسم وحده يكفي (بلا لقطة)
expect "الوسم وحده يكفي" "visually-verified" labeled "" success no
# لقطة مسمّاة بلا وسم → success تلقائيًا
touch docs/shots/hadith-home.png; git add -A; git commit -qm shot; B2=$(git rev-parse HEAD)
expect "لقطة مسمّاة بلا وسم → success" "" synchronize "$B1" success no
# دفعة لقطات فقط لا تُسقط الوسم
expect "دفعة لقطة لا تُسقط الوسم" "visually-verified" synchronize "$B1" success no
# دفعة اختبار/ملف غير حسّاس لا تُسقط
echo t > test.txt; git add -A; git commit -qm t
expect "دفعة غير حسّاسة لا تُسقط الوسم" "visually-verified" synchronize "$B2" success no
# دفعة تمسّ ملفًا حسّاسًا تُسقط الوسم (ومع اللقطة المسمّاة تبقى success)
B3=$(git rev-parse HEAD); echo c >> ios-native/Data/hadith/book.json; git add -A; git commit -qm s
expect "دفعة حسّاسة تُسقط الوسم" "visually-verified" synchronize "$B3" success yes
# دون لقطة: الإسقاط يعيدها pending
git rm -q docs/shots/hadith-home.png; git commit -qm rmshot; B4=$(git rev-parse HEAD); echo d >> ios-native/Data/hadith/book.json; git add -A; git commit -qm s2
expect "إسقاط الوسم بلا لقطة → pending" "visually-verified" synchronize "$B4" pending yes
# BEFORE غير صالح (force-push) → إسقاط احتياطي
expect "BEFORE غير صالح → إسقاط" "visually-verified" synchronize 0000000000000000000000000000000000000000 pending yes
# دمج native-app: ملف حسّاس تغيّر في الأساس لا في فرق الـPR → لا إسقاط
git checkout -q main; echo m >> ios-native/Data/hadith/book.json; git add -A; git commit -qm basechange; git update-ref refs/remotes/origin/native-app HEAD
git checkout -q f; B5=$(git rev-parse HEAD); git merge -q origin/native-app -X ours -m merge 2>/dev/null
expect "دمج native-app لا يُسقط الوسم" "visually-verified" synchronize "$B5" success no
# موسوم content-sensitive بلا ملف حسّاس: اللقطات لا تكفي، الوسم يكفي
git checkout -q -B g origin/native-app; echo z >> other.txt; git add -A; git commit -qm z
expect "content-sensitive بلا وسم → pending" "content-sensitive" opened "" pending no
expect "content-sensitive مع الوسم → success" "content-sensitive,visually-verified" labeled "" success no
[ $fail = 0 ] && echo "content-sensitive-gate tests OK" || { echo FAILED; exit 1; }
