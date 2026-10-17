#!/usr/bin/env bash
# اختبار native-sim-hygiene.sh بلا محاكيات حقيقية: قوائم/عمليات مزيّفة + HYGIENE_DRY.
set -uo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"; H="$R/scripts/native-sim-hygiene.sh"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; fail=0
ok() { echo "  ✓ $1"; }; no() { echo "  ✗ $1"; fail=1; }
U1=11111111-1111-1111-1111-111111111111; U2=22222222-2222-2222-2222-222222222222; U3=33333333-3333-3333-3333-333333333333
U4=44444444-4444-4444-4444-444444444444; U5=55555555-5555-5555-5555-555555555555; W4=66666666-6666-6666-6666-666666666666
mkdir -p "$T/dev"; for u in $U1 $U2 $U3 $U4 $U5 $W4; do mkdir -p "$T/dev/$u/data"; touch -t 202001010000 "$T/dev/$u/data/f"; done # كلها خاملة
touch "$T/dev/$U1/data/f" # نشط
run() { HYGIENE_DRY=1 HYGIENE_DEVICES="$T/dev" HYGIENE_WINDOW=n4 HYGIENE_USED=${USED:-100} HYGIENE_LIMIT=1000 HYGIENE_SIM_LIST="$T/sims" HYGIENE_PS_FILE="$T/ps" bash "$H" 2>&1; echo "exit=$?"; }
: > "$T/ps"
cat > "$T/sims" <<L
== Devices ==
-- iOS 26.5 --
    n4-sim ($U4) (Booted)
    n4-sim2 ($U5) (Booted)
    n1-sim ($U1) (Booted)
-- watchOS 27.0 --
    n4-watch ($W4) (Booted)
L
out=$(run)
echo "$out" | grep -q "ACTION .*n4-sim2" && ! echo "$out" | grep -q "ACTION .*n4-watch" && ! echo "$out" | grep -q "ACTION .*($U4)\|n4-sim (" \
  && ok "محاكي iOS ثانٍ لنفس النافذة يُقفل وساعتها المقترنة تبقى" || { no "محاكٍ واحد لكل نافذة"; echo "$out"; }
echo "$out" | grep -q "عمليات المستخدم 100 من 1000 (10%)" && ok "يطبع نسبة الاستخدام" || no "نسبة الاستخدام"
cat > "$T/sims" <<L
-- iOS 26.5 --
    n1-sim ($U1) (Booted)
    n2-sim ($U2) (Booted)
    n3-quran ($U3) (Booted)
    n4-sim ($U4) (Booted)
L
out=$(run)
echo "$out" | grep -q "ACTION .*n2-sim" && ! echo "$out" | grep -q "ACTION .*n1-sim" && echo "$out" | grep -q "ACTION" \
  && ok "فوق السقف 3: يُقفل الخامل ويبقى النشط (n1)" || { no "سقف 3 + الخامل"; echo "$out"; }
[ "$(echo "$out" | grep -c ACTION)" = 1 ] && ok "يقفل بقدر الفائض فقط" || no "عدد الإقفالات"
cat > "$T/sims" <<L
-- iOS 26.5 --
    n1-sim ($U1) (Booted)
    n2-sim ($U2) (Booted)
L
echo "$(run)" | grep -q ACTION && no "لا إقفال تحت السقف" || ok "تحت السقف: لا إقفال"
cat > "$T/ps" <<L
 900 1 02:10:00 /Applications/Xcode.app/xcodebuild -scheme SunnahApp build
 901 1 00:05:00 /Applications/Xcode.app/xcodebuild -scheme Young
 902 1 03:00:00 /Applications/Xcode.app/xcodebuild -scheme SunnahApp archive
 903 777 05:00:00 swift-frontend -c x.swift
 904 1 1-02:00:00 SourceKitService
L
out=$(run)
echo "$out" | grep -q "ACTION .*عملية يتيمة قديمة 900" && echo "$out" | grep -q "ACTION .*904" && ok "يقتل اليتيم القديم (ساعتان ويوم)" || { no "قتل اليتيم"; echo "$out"; }
echo "$out" | grep -q "ACTION .* 901\|ACTION .* 902\|ACTION .* 903" && no "قتل ما لا يجب (حديث/أرشفة/له أب حي)" || ok "لا يمسّ الحديث ولا الأرشفة ولا ما له أب"
USED=850 out=$(run); echo "$out" | grep -q "exit=75" && echo "$out" | grep -q "رفض بدء البناء" && ok "≥80٪: يرفض بخروج 75 مع رسالة" || { no "رفض عند 85٪"; echo "$out"; }
USED=799 out=$(run); echo "$out" | grep -q "exit=0" && ok "<80٪: يمرّ" || no "مرور عند 79.9٪"
grep -q "native-sim-hygiene.sh" "$R/scripts/build-slot.sh" && grep -q "native-sim-hygiene.sh" "$R/scripts/native-head-build.sh" && ok "مربوط بـbuild-slot وnative-head-build" || no "الربط التلقائي"
[ $fail = 0 ] && echo "sim-hygiene tests OK" || { echo "sim-hygiene tests FAILED"; exit 1; }
