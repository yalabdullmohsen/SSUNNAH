#!/usr/bin/env bash
# بوابة البناء والقياس لكل نوافذ native: ببناء واحد في كل مرة (الـswap شبه ممتلئ) عبر كل الـworktrees، والباقي ينتظر دوره (FIFO).
# استعمال:
#   bash scripts/build-slot.sh -- <أمر…>     تشغيل الأمر داخل خانة (xcodebuild / simctl القياس / xctrace…)
#   bash scripts/build-slot.sh status          الخانات والطابور وحمل العمليات
#   bash scripts/build-slot.sh reap            تنظيف يتامى هذا الـworktree فقط
# الأولوية: ن3 (0) ثم ن1 (1) ثم ن2 (2) ثم ن4 (3) ضمن الطابور؛ BUILD_SLOT_PRIO يتجاوزها.
# متغيرات: BUILD_SLOTS (افتراضي 1)، BUILD_SLOT_PATTERNS (مسارات إضافية مفصولة بـ: تُنظَّف يتاماها، مثل DerivedData)،
#          BUILD_SLOT_HELD=1 (يُضبط تلقائيًا داخل الخانة فلا يحدث قفل ذاتي عند التداخل).
# لا يقتل إلا عمليات المستخدم الحالي التي تحمل مسار هذا الـworktree/الأنماط وأبوها launchd (pid 1) أو أبوها ميت — لا pkill بالاسم.
set -uo pipefail
DIR="${BUILD_SLOT_DIR:-$HOME/.majalis-tools/build-slots}"
MAX="${BUILD_SLOTS:-1}"
UIDN=$(id -u)
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PROCS_RE='(xcodebuild|xctest|XCTRunner|xcbuild|swift-build|swift-frontend|swiftc|xctrace|fswatch|SourceKitService)'
log() { echo "build-slot: $*" >&2; }

proc_load() { # → "used limit"
  local used lim sys; used=$(ps -u "$UIDN" -o pid= | wc -l | tr -d ' ')
  lim=$(ulimit -u); sys=$(sysctl -n kern.maxprocperuid 2>/dev/null || echo "$lim")
  [[ "$lim" =~ ^[0-9]+$ ]] || lim=$sys; [ "$sys" -lt "$lim" ] && lim=$sys
  echo "$used $lim"
}
check_load() { # يحذّر عند >70% ويمتنع/ينتظر عند ≥90%
  local used lim pct waited=0; read -r used lim < <(proc_load)
  pct=$(( used * 100 / lim ))
  [ "$pct" -ge 70 ] && log "تحذير: عمليات المستخدم $used من $lim (${pct}% من ulimit -u) — أغلق الأدوات الخاملة"
  while [ "$pct" -ge 90 ]; do
    [ "$waited" -ge 600 ] && { log "رفض: ${pct}% من حدّ العمليات بعد انتظار 10 دقائق"; exit 75; }
    log "حدّ العمليات ${pct}% — انتظار انخفاضه قبل البدء"; reap_orphans; sleep 10; waited=$((waited+10))
    read -r used lim < <(proc_load); pct=$(( used * 100 / lim ))
  done
}

descendants() { local p; for p in $(pgrep -P "$1" 2>/dev/null); do echo "$p"; descendants "$p"; done; }
kill_tree() { local p; for p in $(descendants "$1"); do kill "$p" 2>/dev/null; done; kill "$1" 2>/dev/null; }

reap_orphans() { # يتامى هذا الـworktree: أبوها 1 (أو ميت) وسطر أمرها يحمل مساره/أنماطه — فلترة واحدة بـawk بلا fork لكل عملية
  local pats="$ROOT/"; [ -n "${BUILD_SLOT_PATTERNS:-}" ] && pats="$pats:$BUILD_SLOT_PATTERNS"
  local alive pid ppid n=0; alive=" $(ps -u "$UIDN" -o pid= | tr -s ' \n' ' ') "
  while read -r pid ppid; do
    [ "$pid" = "$$" ] && continue
    case "$alive" in *" $ppid "*) [ "$ppid" != 1 ] && continue;; esac
    kill "$pid" 2>/dev/null && n=$((n+1))
  done < <(ps -u "$UIDN" -o pid=,ppid=,command= | awk -v re="$PROCS_RE" -v pats="$pats" '
    BEGIN { np = split(pats, P, ":") }
    { cmd = $0; sub(/^ *[0-9]+ +[0-9]+ +/, "", cmd); if (cmd !~ re) next
      for (i = 1; i <= np; i++) if (P[i] != "" && index(cmd, P[i])) { print $1, $2; break } }')
  [ "$n" -gt 0 ] && log "نُظّف $n عملية يتيمة لهذا الـworktree"
  return 0
}

# أولوية الطابور (الأصغر أولًا): ن3 قياس الأداء=0، ن1=1، ن2=2، ن4/غيرها=3 (بناءاتها قصيرة). تُستنتج من اسم الـworktree أو BUILD_SLOT_PRIO.
prio() {
  [ -n "${BUILD_SLOT_PRIO:-}" ] && { echo "$BUILD_SLOT_PRIO"; return; }
  case " $* " in *" archive "*) echo '!'; return;; esac   # الأرشفة (بناء RC) قبل بناءات اختبار النوافذ
  case "$(basename "$ROOT")" in n3-*|*quran*) echo 0;; n1-*) echo 1;; n2-*) echo 2;; *) echo 3;; esac
}
live_tickets() { local t; for t in "$DIR"/queue/*; do [ -e "$t" ] || continue
  if kill -0 "$(basename "$t" | sed 's/.*-0*//')" 2>/dev/null; then basename "$t"; else rm -f "$t"; fi; done | sort; }
slot_pid() { sed -n 's/^pid=\([0-9]*\).*/\1/p' "$1/owner" 2>/dev/null; }

status() {
  local i p read_u read_l; read -r read_u read_l < <(proc_load)
  echo "العمليات: $read_u / $read_l ($(( read_u * 100 / read_l ))%)  الخانات القصوى: $MAX"
  for i in $(seq 1 "$MAX"); do
    p=$(slot_pid "$DIR/slot-$i")
    if [ -n "$p" ] && kill -0 "$p" 2>/dev/null; then echo "خانة $i: مشغولة — $(cat "$DIR/slot-$i/owner")"; else echo "خانة $i: حرّة"; fi
  done
  echo "في الطابور: $(live_tickets | wc -l | tr -d ' ')"
}

case "${1:-}" in
  status) mkdir -p "$DIR/queue"; status; exit 0;;
  reap) reap_orphans; exit 0;;
  --) shift;;
  "") echo "الاستعمال: build-slot.sh -- <أمر…> | status | reap" >&2; exit 2;;
  *) echo "build-slot: وسيط غير معروف: $1" >&2; exit 2;;
esac
[ $# -gt 0 ] || { echo "build-slot: لا أمر بعد --" >&2; exit 2; }
[ -n "${BUILD_SLOT_HELD:-}" ] && exec "$@"

mkdir -p "$DIR/queue"
TICKET="$(prio "$@")-$(date +%s)-$(printf %07d $$)"; : > "$DIR/queue/$TICKET"
SLOT=""
release() { [ -n "$SLOT" ] && rm -rf "$DIR/slot-$SLOT"; rm -f "$DIR/queue/$TICKET"; }
CHILD=""
on_sig() { [ -n "$CHILD" ] && kill_tree "$CHILD"; release; reap_orphans; exit 143; }
trap on_sig INT TERM HUP
trap release EXIT

acquire() {
  local i p pos free announced=0
  while :; do
    free=0; for i in $(seq 1 "$MAX"); do
      p=$(slot_pid "$DIR/slot-$i")
      if [ -d "$DIR/slot-$i" ] && { [ -z "$p" ] || ! kill -0 "$p" 2>/dev/null; }; then rm -rf "$DIR/slot-$i"; fi
      [ -d "$DIR/slot-$i" ] || free=$((free+1))
    done
    pos=$(live_tickets | grep -n "^$TICKET$" | cut -d: -f1); pos=$(( ${pos:-1} - 1 ))
    if [ "$pos" -lt "$free" ]; then
      for i in $(seq 1 "$MAX"); do
        if mkdir "$DIR/slot-$i" 2>/dev/null; then
          echo "pid=$$ worktree=$ROOT cmd=$(basename "$1") started=$(date +%s)" > "$DIR/slot-$i/owner"; SLOT=$i
          # تخرج التذكرة من الطابور فور أخذ الخانة: بقاؤها كان يحسب حامل الخانة في دور المنتظرين فتبقى الخانة الحرّة محجوبة (عطل 2026-10-20: ن4 انتظر ساعتين وخانة 2 حرّة).
          rm -f "$DIR/queue/$TICKET"; return 0
        fi
      done
    fi
    [ "$announced" = 0 ] && { log "كل الخانات ($MAX) مشغولة — دورك رقم $((pos+1)) في الطابور"; announced=1; }
    sleep 3
  done
}

[ -n "${BUILD_SLOT_HELD:-}" ] || bash "$(dirname "$0")/native-sim-hygiene.sh" || exit $? # نظافة المحاكيات/العمليات + رفض عند ≥80٪
check_load
acquire "$@"
reap_orphans
export BUILD_SLOT_HELD=1
"$@" &
CHILD=$!
wait "$CHILD"; rc=$?
CHILD=""
reap_orphans
exit "$rc"
