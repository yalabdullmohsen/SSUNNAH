#!/usr/bin/env bash
# اختبار طابور build-slot.sh في مجلد مؤقت (لا يمس الطابور الحيّ): 3 بناءات متزامنة تتسلسل بالأقدم أولًا،
# وتذكرة/خانة عملية ميتة (أو pid مُعاد بوقت بدء مختلف) لا تحجز الطابور.
set -uo pipefail
SRC=$(cd "$(dirname "$0")" && pwd)
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
mkdir -p "$T/scripts" "$T/home"
cp "$SRC/build-slot.sh" "$T/scripts/"; printf '#!/bin/sh\nexit 0\n' > "$T/scripts/native-sim-hygiene.sh"
export HOME="$T/home" BUILD_SLOT_DIR="$T/slots" LOG="$T/log"; : > "$LOG"   # HOME معزول: لا memwait
BS="bash $T/scripts/build-slot.sh --"
fail=0; ok() { echo "ok   $*"; }; bad() { echo "FAIL $*"; fail=1; }

# 1) ثلاثة بناءات متزامنة: بلا تداخل وبترتيب الدخول
for n in 1 2 3; do ( $BS sh -c "echo s$n \$(date +%s) >> $LOG; sleep 2; echo e$n \$(date +%s) >> $LOG" ) & sleep 1.2; done; wait
order=$(grep -o '^[se][0-9]' "$LOG" | tr '\n' ' ')
[ "$order" = "s1 e1 s2 e2 s3 e3 " ] && ok "تسلسل بلا تداخل بالأقدم أولًا ($order)" || bad "الترتيب: $order"

# 2) خانة حيّة بلا طابور: تُؤخذ فورًا (< 3 ث)
s=$(date +%s); $BS true; [ $(( $(date +%s) - s )) -lt 3 ] && ok "أخذ الخانة الفارغة فورًا" || bad "تأخّر أخذ الخانة الفارغة"

# 3) تذكرة ميتة أقدم + خانة ميتة لا تحجبان
mkdir -p "$T/slots/queue" "$T/slots/slot-1"
( sleep 0 ) & dead=$!; wait $dead
echo "x" > "$T/slots/queue/1-$(printf %07d $dead)"
echo "pid=$dead worktree=/x cmd=x started=1" > "$T/slots/slot-1/owner"; echo "x" > "$T/slots/slot-1/start"; touch -t 200001010000 "$T/slots/slot-1"
s=$(date +%s); $BS true; [ $(( $(date +%s) - s )) -lt 4 ] && ok "تذكرة/خانة ميتة تُحذفان تلقائيًا" || bad "حجبت العملية الميتة الطابور"

# 4) pid حيّ لكن وقت بدء مختلف (pid مُعاد) = ميت
echo "Thu Jan  1 00:00:00 2000" > "$T/slots/queue/1-$(printf %07d $$)"
s=$(date +%s); $BS true; [ $(( $(date +%s) - s )) -lt 4 ] && ok "pid مُعاد بوقت بدء مختلف يُعدّ ميتًا" || bad "pid مُعاد حجب الطابور"

# 5) قتل الحامل بـ kill -9 لا يجمّد من خلفه
( $BS sleep 30 ) & holder=$!; sleep 1.5
pkill -9 -P $holder sleep 2>/dev/null; kill -9 $holder 2>/dev/null; sleep 0.5
s=$(date +%s); $BS true; [ $(( $(date +%s) - s )) -lt 6 ] && ok "kill -9 للحامل لا يجمّد الطابور" || bad "تجمّد بعد kill -9"
pkill -f "sleep 30" 2>/dev/null
exit $fail
