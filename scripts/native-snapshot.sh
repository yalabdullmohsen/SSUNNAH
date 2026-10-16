#!/usr/bin/env bash
if [ -z "${BUILD_SLOT_HELD:-}" ]; then exec bash "$(cd "$(dirname "$0")" && pwd)/build-slot.sh" -- bash "$0" "$@"; fi  # بوابة الخانات: ببناءين متزامنين كحد أقصى (docs/native/WORKFLOW.md)
# لقطات فاتح/داكن لمسارات قسم (أو مسار مفرد) مع تحقق صارم. الاستخدام: native-snapshot.sh <قسم|route> [...]
# يكتب ~/ssunnah-board/snapshots/<قسم>/<مسار>-{light,dark}.png ويُلحق المسارات الصالحة بـ$TICK والمرفوضة بـ$INVALID (مسار|سبب)
set -uo pipefail
. "$(cd "$(dirname "$0")" && pwd)/native-sim.sh" || exit 2
BID=com.yousef.majlisilm
BOARD=${BOARD:-$HOME/ssunnah-board}; TICK=${TICK:-$BOARD/native-loop.ticks}; INVALID=${INVALID:-$BOARD/native-loop.invalid}
MAP=${MAP:-docs/native/ROUTE_TEMPLATE_MAP.json}; OCR="$(cd "$(dirname "$0")" && pwd)/native-snapshot-ocr.swift"
touch "$TICK" "$INVALID"
xcrun simctl boot "$SIM" >/dev/null 2>&1
xcrun simctl status_bar "$SIM" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 >/dev/null 2>&1
# تحقق إلزامي قبل أول لقطة: التطبيق يعمل فعلًا في الواجهة (لا SpringBoard)؛ إعادة تثبيت وتشغيل مرة، ثم فشل صريح بدل لقطات باطلة.
APP=${APP:-$HOME/.majalis-tools/dd/n4/Build/Products/Debug-iphonesimulator/SunnahApp.app}
[ -d "$APP" ] && xcrun simctl install "$SIM" "$APP" >/dev/null 2>&1   # دائمًا من $APP المبني (لا نسخة قديمة عالقة)
[ -n "${SNAPSHOT_SKIP_GUARD:-}" ] || SIM=$SIM bash "$(cd "$(dirname "$0")" && pwd)/native-shot-guard.sh" "$APP" "$BOARD/snapshots" || exit 2  # مصدر اللقطات: مبني من HEAD ومطابق للمثبّت
fg_ok() { xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1; xcrun simctl launch "$SIM" $BID >/dev/null 2>&1
  for _ in 1 2 3 4 5 6 7 8; do sleep 2
    xcrun simctl spawn "$SIM" launchctl list 2>/dev/null | grep -Eq "^[0-9]+[[:space:]]+[0-9-]+[[:space:]]+UIKitApplication:$BID" && return 0
  done; return 1; }
if ! fg_ok; then
  echo "native-snapshot: $BID ليس في الواجهة — إعادة تثبيت وتشغيل" >&2
  [ -d "$APP" ] && xcrun simctl install "$SIM" "$APP" >/dev/null 2>&1
  fg_ok || { echo "native-snapshot: فشل — التطبيق لا يعمل في المحاكي (SpringBoard)؛ لا لقطات باطلة" >&2; exit 2; }
fi
SEEN=$(mktemp); trap 'rm -f "$SEEN"' EXIT
comp() { node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const r=d.routes.find(x=>x.path===process.argv[2]);console.log(r?r.component||r.template:"?")' "$MAP" "$1"; }
for s in "$@"; do
  if [[ "$s" == /* ]]; then sec=misc; routes="$s"; else sec=$s
    routes=$(node -e '
      const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
      const ID={"السيرة والتاريخ والأعلام":"sirah","العقيدة والتزكية":"aqidah","الفقه والعبادات":"fiqh","اللغة والمكتبة والبحث":"library","القرآن":"quran","الحساب والإعدادات":"account","الدروس والتعلم":"learn","الحديث والسنة":"hadith","الأذكار والأدعية":"adhkar"};
      d.routes.filter(r=>ID[r.section]===process.argv[2]).forEach(r=>console.log(r.path))' "$MAP" "$s"); fi
  mkdir -p "$BOARD/snapshots/$sec"
  while read -r route; do
    [ -z "$route" ] && continue
    eff=$(node -e 'try{const m=JSON.parse(require("fs").readFileSync("docs/native/ROUTE_SAMPLES.json","utf8"));console.log(m[process.argv[1]]||process.argv[1])}catch{console.log(process.argv[1])}' "$route")
    slug=$(echo "${route#/}" | tr '/:' '__'); L="$BOARD/snapshots/$sec/$slug-light.png"; D="$BOARD/snapshots/$sec/$slug-dark.png"
    # الجاهزية: التطبيق (DEBUG) يكتب snapshot-ready.json في tmp حاويته بعد زوال التحميل واستقرار الشاشة (screen.ready)،
    # ويضمّنه state=ok|empty|error (من معرّفات screen.empty/screen.error) أو timeout. السكربت ينتظره بمهلة SNAP_TIMEOUT لا بنوم ثابت.
    STATE_L=""; STATE_D=""
    cap() { for mode in light dark; do
      xcrun simctl ui "$SIM" appearance $mode; xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1
      CT=$(xcrun simctl get_app_container "$SIM" $BID data 2>/dev/null)/tmp; rm -f "$CT/snapshot-ready.json"
      xcrun simctl launch "$SIM" $BID -snapshotRoute "$eff" >/dev/null 2>&1
      st=NOT_READY; end=$(( $(date +%s) + ${SNAP_TIMEOUT:-25} ))
      while [ "$(date +%s)" -lt "$end" ]; do
        if [ -s "$CT/snapshot-ready.json" ]; then st=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['state'])" "$CT/snapshot-ready.json" 2>/dev/null || echo NOT_READY); break; fi
        sleep 0.25
      done
      [ "$mode" = light ] && STATE_L=$st || STATE_D=$st
      xcrun simctl io "$SIM" screenshot "$BOARD/snapshots/$sec/$slug-$mode.png" >/dev/null 2>&1
    done; }
    cap
    why=""; ro=$(swift "$OCR" "$L" "$eff" 2>/dev/null); r2=$(swift "$OCR" "$D" "$eff" 2>/dev/null)
    # بياض كلي: الجاهزية معلنة من التطبيق فلا إعادة محاولة (إنذار كاذب يُعالَج بإصلاح الإعلان لا بالتكرار)
    if false; then ro=$(swift "$OCR" "$L" "$eff" 2>/dev/null); r2=$(swift "$OCR" "$D" "$eff" 2>/dev/null); fi
    [ -s "$L" ] && [ -s "$D" ] || why="NOSHOT"
    # الحالة المعلنة من التطبيق أولًا: عالقة/خطأ/فارغ بمعرّف ثابت لا بنص
    for stt in "$STATE_L" "$STATE_D"; do [ -z "$why" ] && case "$stt" in error) why="ERROR:screen.error";; empty) why="EMPTY:screen.empty";; ok) ;; *) why="NOT_READY:$stt";; esac; done
    # الأولوية لسبب المحتوى (خطأ/قيد الإعداد/فارغ) لأنه ينسب المسار للجهة الصحيحة؛ DUP فقط لشاشة سليمة مطابقة لمسار بمكوّن مختلف
    [ -z "$why" ] && { [ "$ro" != OK ] && why=$ro || { [ "$r2" != OK ] && why=$r2; }; }
    if [ -z "$why" ]; then
      # بصمة المحتوى (نصوص الشاشة بعد حذف التبويبات والرأس) لا بكسلات الصورة؛ DUP فقط إن تطابق المحتوى مع مسار بمكوّن مختلف
      fl=$(swift "$OCR" "$L" "$eff" --text 2>/dev/null | python3 -c "import sys,hashlib;c={'الرئيسية','القرآن','الدروس','الصلاة','الأقسام','9:41'};t=sorted({l.strip() for l in sys.stdin if len(l.strip())>1 and l.strip() not in c});print(hashlib.sha256('\n'.join(t).encode()).hexdigest()[:32] if len(t)>=3 else 'few')")
      fd=$(swift "$OCR" "$D" "$eff" --text 2>/dev/null | python3 -c "import sys,hashlib;c={'الرئيسية','القرآن','الدروس','الصلاة','الأقسام','9:41'};t=sorted({l.strip() for l in sys.stdin if len(l.strip())>1 and l.strip() not in c});print(hashlib.sha256('\n'.join(t).encode()).hexdigest()[:32] if len(t)>=3 else 'few')")
      c=$(comp "$route")
      for h in "$fl" "$fd"; do [ "$h" = few ] && continue; o=$(grep "^$h " "$SEEN" | head -1 | cut -d' ' -f2-); ob="${o#* }"; oc="${o% *}"; [ -n "$o" ] && [ "$oc" != "$c" ] && [ "$ob" != "${route##*/}" ] && why="${why:-DUP_SCREEN}"; [ -z "$o" ] && echo "$h $c ${route##*/}" >> "$SEEN"; done
    fi
    [ -z "$why" ] && { ro=OK; r2=OK; why=OK; }
    if [ "$why" = OK ] && [ "$r2" = OK ]; then echo "$route" >> "$TICK"; else echo "$route|$sec|${why:-?}" >> "$INVALID"; fi
  done <<< "$routes"
done
xcrun simctl status_bar "$SIM" clear >/dev/null 2>&1
