#!/usr/bin/env bash
# نظافة المحاكيات والعمليات قبل أي بناء (يُستدعى تلقائيًا من build-slot.sh وnative-head-build.sh):
#  1) يطبع نسبة استخدام العمليات (ps -u مقابل ulimit -u).
#  2) يحدّ المحاكيات المُشغَّلة: محاكي iOS واحد + ساعته المقترنة لكل نافذة (nX-*)، وحدّ أقصى 3 محاكيات iOS إجمالًا؛ يقفل الخامل أولًا.
#  3) يقتل العمليات اليتيمة القديمة (أبوها 1، عمرها > 30 دقيقة) من xcodebuild/swift-build/swift-frontend/SourceKitService… ولا يمسّ الأرشفة (archive).
#  4) يرفض البدء (خروج 75) إن بقي الاستخدام ≥ 80٪ ويقول للنافذة أن تنتظر أو تنظّف.
# متغيرات (للاختبار والضبط): HYGIENE_MAX_SIMS(3) HYGIENE_IDLE_MIN(30) HYGIENE_ORPHAN_MIN(30) HYGIENE_PCT_MAX(80) HYGIENE_WINDOW
#   HYGIENE_DRY=1 (يطبع الإجراءات "ACTION …" بلا تنفيذ) HYGIENE_USED/HYGIENE_LIMIT (يتجاوزان القياس)
#   القرص: تحذير تحت HYGIENE_DISK_WARN_GB(12) ورفض (خروج 75) تحت HYGIENE_DISK_MIN_GB(8) بعد التنظيف التلقائي؛ HYGIENE_FREE_GB يتجاوز القياس.
#   DerivedData: يُحذف الأقدم من HYGIENE_DD_HOURS(2) بلا استعمال (أي نافذة)، في HYGIENE_DD_ROOTS (افتراضي ssunnah-build وXcode DerivedData و~/.majalis-tools/dd)؛ headbuild يُبقي أحدث HYGIENE_HB_KEEP(2)؛ ثم simctl delete unavailable.
#     يخص النافذة الحالية (اسم يبدأ بـnX-) والمشترك (بلا بادئة)؛ ولا يُمسّ مجلد نافذة أخرى ولا شيء ما دامت أرشفة جارية أو العملية تذكر مساره. تقرير "DD-CLEAN" قبل كل حذف.
#   HYGIENE_SIM_LIST=<ملف> (بديل خرج simctl list devices booted) HYGIENE_DEVICES=<جذر CoreSimulator/Devices> HYGIENE_PS_FILE=<ملف: pid ppid etime command>
set -uo pipefail
UIDN=$(id -u)
MAX_SIMS=${HYGIENE_MAX_SIMS:-3}; IDLE_MIN=${HYGIENE_IDLE_MIN:-30}; ORPHAN_MIN=${HYGIENE_ORPHAN_MIN:-30}; PCT_MAX=${HYGIENE_PCT_MAX:-80}
DEV_ROOT=${HYGIENE_DEVICES:-$HOME/Library/Developer/CoreSimulator/Devices}
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
WIN=${HYGIENE_WINDOW:-$(basename "$ROOT" | sed -n 's/^\(n[1-5]\)-.*/\1/p')}
PROCS_RE='(xcodebuild|xctest|XCTRunner|xcbuild|swift-build|swift-frontend|swiftc|xctrace|fswatch|SourceKitService)'
log() { echo "native-sim-hygiene: $*" >&2; }
act() { # act <وصف> <أمر…> : ينفّذ أو يطبع عند DRY
  local d=$1; shift
  if [ "${HYGIENE_DRY:-0}" = 1 ]; then echo "ACTION $d"; else "$@" >/dev/null 2>&1; log "$d"; fi
}

usage_pct() {
  local used lim sys
  used=${HYGIENE_USED:-$(ps -u "$UIDN" -o pid= | wc -l | tr -d ' ')}
  lim=${HYGIENE_LIMIT:-$(ulimit -u)}; sys=$(sysctl -n kern.maxprocperuid 2>/dev/null || echo "$lim")
  [[ "$lim" =~ ^[0-9]+$ ]] || lim=$sys
  [ -z "${HYGIENE_LIMIT:-}" ] && [ "$sys" -lt "$lim" ] && lim=$sys
  USED=$used; LIM=$lim; PCT=$(( used * 100 / lim ))
}

# المحاكيات المُشغَّلة → أسطر "kind|name|udid" (kind = watch|phone)
booted() {
  if [ -n "${HYGIENE_SIM_LIST:-}" ]; then cat "$HYGIENE_SIM_LIST"; else xcrun simctl list devices booted 2>/dev/null; fi |
    awk '/^-- /{ k = ($0 ~ /watchOS/) ? "watch" : (($0 ~ /iOS/) ? "phone" : "other"); next }
         /\(Booted\)/ { line=$0; sub(/^ +/,"",line); u=line; sub(/.*\(/,"",u); n=line
           match(line, /\([0-9A-Fa-f-]{36}\)/); if (RSTART==0) next
           id=substr(line,RSTART+1,RLENGTH-2); nm=substr(line,1,RSTART-2)
           if (k=="phone"||k=="watch") print k "|" nm "|" id }'
}
idle() { # لا ملف تغيّر في بيانات المحاكي خلال IDLE_MIN دقيقة
  local d="$DEV_ROOT/$1/data"; [ -d "$d" ] || return 0
  [ -z "$(find "$d" -type f -mmin "-$IDLE_MIN" -print -quit 2>/dev/null)" ]
}
owner() { local o; o=$(echo "$1" | sed -n 's/^\(n[1-5]\)-.*/\1/p'); echo "${o:-other}"; }
shut() { act "إقفال المحاكي $1 ($2): $3" xcrun simctl shutdown "$2"; }

limit_sims() {
  local list k n u o seen_phone seen_watch phones=0
  list=$(booted)
  [ -n "$list" ] || return 0
  # (أ) محاكي واحد لكل مالك (iOS) وساعة واحدة لكل مالك: الفائض يُقفل (الخامل أولًا بحكم الترتيب)
  declare -a keep_p keep_w
  while IFS='|' read -r k n u; do
    [ -n "$u" ] || continue; o=$(owner "$n")
    case " ${keep_p[*]-} ${keep_w[*]-} " in *" $k:$o "*) shut "$n" "$u" "أكثر من محاكي $k لنفس النافذة ($o)"; continue;; esac
    [ "$k" = phone ] && keep_p+=("$k:$o") || keep_w+=("$k:$o")
    [ "$k" = phone ] && phones=$((phones+1))
  done < <(echo "$list" | awk -F'|' '{print $0}' )
  # (ب) سقف إجمالي لمحاكيات iOS: نقفل الخامل (غير النافذة الحالية أولًا) حتى نبلغ السقف
  if [ "$phones" -gt "$MAX_SIMS" ]; then
    while IFS='|' read -r k n u; do
      [ "$phones" -gt "$MAX_SIMS" ] || break
      [ "$k" = phone ] || continue
      idle "$u" || continue
      shut "$n" "$u" "خامل ≥ ${IDLE_MIN}د وإجمالي المحاكيات $phones > $MAX_SIMS"; phones=$((phones-1))
    done < <(echo "$list")
    if [ "$phones" -gt "$MAX_SIMS" ] && [ -n "$WIN" ]; then # لا خامل كفاية: نقفل محاكي هذه النافذة (البناء لا يحتاجه)
      while IFS='|' read -r k n u; do
        [ "$phones" -gt "$MAX_SIMS" ] || break
        [ "$k" = phone ] && [ "$(owner "$n")" = "$WIN" ] || continue
        shut "$n" "$u" "الإجمالي $phones > $MAX_SIMS (محاكي نافذتك)"; phones=$((phones-1))
      done < <(echo "$list")
    fi
    [ "$phones" -le "$MAX_SIMS" ] || log "تحذير: $phones محاكيات iOS مشغّلة (السقف $MAX_SIMS) وكلها نشطة — اطلب من النوافذ الأخرى إقفال محاكياتها"
  fi
}

kill_orphans() { # أبوها 1، عمرها > ORPHAN_MIN، من أدوات البناء؛ ولا أرشفة
  local pid ppid et cmd n=0
  while read -r pid ppid et cmd; do
    [ "$pid" = "$$" ] && continue
    [ "$ppid" = 1 ] || continue
    echo "$cmd" | grep -Eq "$PROCS_RE" || continue
    case " $cmd " in *" archive "*) continue;; esac
    awk -v e="$et" -v m="$ORPHAN_MIN" 'BEGIN{d=0;s=e; if(s~/-/){split(s,a,"-");d=a[1];s=a[2]}; n=split(s,t,":"); sec=(n==3)?t[1]*3600+t[2]*60+t[3]:t[1]*60+t[2]; exit !((d*86400+sec)>m*60)}' || continue
    act "قتل عملية يتيمة قديمة $pid ($et): ${cmd:0:60}" kill "$pid"; n=$((n+1))
  done < <(if [ -n "${HYGIENE_PS_FILE:-}" ]; then cat "$HYGIENE_PS_FILE"; else ps -u "$UIDN" -o pid=,ppid=,etime=,command=; fi)
  return 0
}

dd_clean() {
  local roots d name o age sz hrs=${HYGIENE_DD_HOURS:-2} ps_txt
  ps_txt=$(if [ -n "${HYGIENE_PS_FILE:-}" ]; then cat "$HYGIENE_PS_FILE"; else ps -u "$UIDN" -o command=; fi)
  if echo "$ps_txt" | grep -Eq '(^| )archive( |$)'; then log "DD: أرشفة جارية — لا تنظيف لـDerivedData"; return 0; fi
  roots=${HYGIENE_DD_ROOTS:-$HOME/ssunnah-build/DerivedData $HOME/Library/Developer/Xcode/DerivedData $HOME/.majalis-tools/dd}
  for r in $roots; do
    [ -d "$r" ] || continue
    for d in "$r"/*/; do
      d=${d%/}; [ -d "$d" ] || continue; name=$(basename "$d"); o=$(echo "$name" | sed -n 's/^\(n[1-5]\)-.*/\1/p')
      echo "$ps_txt" | grep -qF "$d" && continue                            # مستعمل الآن
      [ -z "$(find "$d" -type f -mmin "-$((hrs*60))" -print -quit 2>/dev/null)" ] || continue
      sz=$(du -sk "$d" 2>/dev/null | cut -f1)
      if [ "${HYGIENE_DRY:-0}" = 1 ]; then echo "DD-CLEAN $d ($((sz/1024))MB، بلا استعمال > ${hrs}س)"
      else log "DD-CLEAN سيُحذف $d ($((sz/1024))MB، بلا استعمال > ${hrs}س)"; rm -rf "$d"; fi
    done
  done
}
hb_prune() { # يُبقي أحدث HYGIENE_HB_KEEP(2) مفتاح headbuild ويحذف الأقدم من ساعتين لا يخص بناءً جاريًا (قفل .lock)
  local hb=${HYGIENE_HB_DIR:-$HOME/.majalis-tools/headbuild} keep=${HYGIENE_HB_KEEP:-2} d i=0
  [ -d "$hb" ] || return 0
  while IFS= read -r d; do i=$((i+1)); [ "$i" -le "$keep" ] && continue
    [ -d "$d.lock" ] && continue; [ -z "$(find "$d" -type f -mmin -120 -print -quit 2>/dev/null)" ] || continue
    if [ "${HYGIENE_DRY:-0}" = 1 ]; then echo "HB-CLEAN $d"; else log "HB-CLEAN $d"; rm -rf "$d"; fi
  done < <(ls -1dt "$hb"/*/ 2>/dev/null | sed 's#/$##')
}
free_gb() { if [ -n "${HYGIENE_FREE_GB:-}" ]; then echo "$HYGIENE_FREE_GB"; else df -k "$HOME" | awk 'NR==2{printf "%d", $4/1048576}'; fi; }

usage_pct; log "عمليات المستخدم $USED من $LIM (${PCT}%)"
limit_sims
kill_orphans
dd_clean
hb_prune
[ "${HYGIENE_DRY:-0}" = 1 ] || xcrun simctl delete unavailable >/dev/null 2>&1
FREE=$(free_gb); log "المساحة الحرة ${FREE}GB"
[ "$FREE" -lt "${HYGIENE_DISK_WARN_GB:-12}" ] && log "تحذير: المساحة الحرة ${FREE}GB < ${HYGIENE_DISK_WARN_GB:-12}GB"
if [ "$FREE" -lt "${HYGIENE_DISK_MIN_GB:-8}" ]; then
  log "رفض بدء البناء: المساحة الحرة ${FREE}GB < ${HYGIENE_DISK_MIN_GB:-8}GB. احذف DerivedData القديم/المحاكيات غير المستعملة (xcrun simctl delete unavailable) ثم أعد المحاولة."; exit 75
fi
[ -n "${HYGIENE_USED:-}" ] || { sleep 1; usage_pct; }
if [ "$PCT" -ge "$PCT_MAX" ]; then
  log "رفض بدء البناء: الاستخدام ${PCT}% ≥ ${PCT_MAX}% ($USED/$LIM). انتظر دقيقتين، أو أغلق محاكيك: xcrun simctl shutdown <اسم-محاكيك>، ثم أعد المحاولة."
  exit 75
fi
exit 0
