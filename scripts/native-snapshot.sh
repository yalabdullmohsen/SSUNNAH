#!/usr/bin/env bash
# لقطات فاتح/داكن لمسارات قسم (أو مسار مفرد) مع تحقق صارم. الاستخدام: native-snapshot.sh <قسم|route> [...]
# يكتب ~/ssunnah-board/snapshots/<قسم>/<مسار>-{light,dark}.png ويُلحق المسارات الصالحة بـ$TICK والمرفوضة بـ$INVALID (مسار|سبب)
set -uo pipefail
SIM=${SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}; BID=com.yousef.majlisilm
BOARD=${BOARD:-$HOME/ssunnah-board}; TICK=${TICK:-$BOARD/native-loop.ticks}; INVALID=${INVALID:-$BOARD/native-loop.invalid}
MAP=${MAP:-docs/native/ROUTE_TEMPLATE_MAP.json}; OCR="$(cd "$(dirname "$0")" && pwd)/native-snapshot-ocr.swift"
touch "$TICK" "$INVALID"
xcrun simctl boot "$SIM" >/dev/null 2>&1
xcrun simctl status_bar "$SIM" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 >/dev/null 2>&1
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
    slug=$(echo "${route#/}" | tr '/:' '__'); L="$BOARD/snapshots/$sec/$slug-light.png"; D="$BOARD/snapshots/$sec/$slug-dark.png"
    for mode in light dark; do
      xcrun simctl ui "$SIM" appearance $mode; xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1
      xcrun simctl launch "$SIM" $BID -snapshotRoute "$route" >/dev/null 2>&1; python3 -c "import time;time.sleep(4)"
      xcrun simctl io "$SIM" screenshot "$BOARD/snapshots/$sec/$slug-$mode.png" >/dev/null 2>&1
    done
    why=""; ro=$(swift "$OCR" "$L" "$route" 2>/dev/null); r2=$(swift "$OCR" "$D" "$route" 2>/dev/null)
    [ -s "$L" ] && [ -s "$D" ] || why="NOSHOT"
    # الأولوية لسبب المحتوى (خطأ/قيد الإعداد/فارغ) لأنه ينسب المسار للجهة الصحيحة؛ DUP فقط لشاشة سليمة مطابقة لمسار بمكوّن مختلف
    [ -z "$why" ] && { [ "$ro" != OK ] && why=$ro || { [ "$r2" != OK ] && why=$r2; }; }
    if [ -z "$why" ]; then
      hl=$(shasum -a 256 "$L" | cut -c1-64); hd=$(shasum -a 256 "$D" | cut -c1-64)
      [ "$hl" = "$hd" ] && why="LIGHT=DARK"
      c=$(comp "$route")
      for h in "$hl" "$hd"; do o=$(grep "^$h " "$SEEN" | head -1 | cut -d' ' -f2-); ob="${o#* }"; oc="${o% *}"; [ -n "$o" ] && [ "$oc" != "$c" ] && [ "$ob" != "${route##*/}" ] && why="${why:-DUP_SCREEN}"; [ -z "$o" ] && echo "$h $c ${route##*/}" >> "$SEEN"; done
    fi
    [ -z "$why" ] && { ro=OK; r2=OK; why=OK; }
    if [ "$why" = OK ] && [ "$r2" = OK ]; then echo "$route" >> "$TICK"; else echo "$route|$sec|${why:-?}" >> "$INVALID"; fi
  done <<< "$routes"
done
xcrun simctl status_bar "$SIM" clear >/dev/null 2>&1
