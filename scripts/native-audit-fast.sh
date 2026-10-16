#!/usr/bin/env bash
if [ -z "${BUILD_SLOT_HELD:-}" ]; then exec bash "$(cd "$(dirname "$0")" && pwd)/build-slot.sh" -- bash "$0" "$@"; fi  # بوابة الخانات: ببناءين متزامنين كحد أقصى (docs/native/WORKFLOW.md)
# تدقيق المسارات السريع: جلسة تطبيق واحدة على محاكي النافذة؛ التنقل بالروابط العميقة (simctl openurl majlisilm://…)
# لكل مسار: انتظار screen.ready (snapshot-ready.json) ثم لقطة وتسجيل الحالة. التحليل (OCR مُجمَّع) يجري بعد الالتقاط بالتوازي.
# الاستعمال: NATIVE_WINDOW=n2 APP=<SunnahApp.app> [MODE=light|dark] [FONT=accessibility-extra-extra-extra-large] [LIMIT=n] bash scripts/native-audit-fast.sh
# OPEN=inapp: الأسرع (التطبيق Debug يمرّ بنفسه على المسارات عبر AppRouter: -snapshotRoutes؛ بلا openurl ولا إعادة إطلاق). التفاصيل في docs/native/WORKFLOW.md.
# OPEN=launch: إطلاق لكل مسار بدل openurl (يتجاوز نافذة «فتح في سُنّة؟» التي تعترض الروابط العميقة على محاكٍ جديد).
# المخرجات: $BOARD/<tag>/states.tsv, verdicts.tsv, *.png, summary.md. الهدف: 212 مسارًا < 20 دقيقة.
set -uo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
. scripts/native-sim.sh || exit 2
# إعادة تشغيل المحاكي قبل كل جولة: يزيل حوارات SpringBoard العالقة («فتح في سُنّة؟») من اللقطات. REBOOT=0 لتخطّيها.
if [ "${REBOOT:-1}" = 1 ]; then xcrun simctl shutdown "$SIM" >/dev/null 2>&1; xcrun simctl boot "$SIM" >/dev/null 2>&1; xcrun simctl bootstatus "$SIM" -b >/dev/null 2>&1; sleep 3; fi
BID=com.yousef.majlisilm; MODE=${MODE:-light}; FONT=${FONT:-large}; LIMIT=${LIMIT:-999}
APP=${APP:-$HOME/.majalis-tools/dd/n2/Build/Products/Debug-iphonesimulator/SunnahApp.app}
TAG=${TAG:-$MODE-$FONT}; BOARD=${BOARD:-${N1_WORK:-$HOME/majalis-correct/.n1-work}/route-audit-fast}/$TAG; mkdir -p "$BOARD/shots"; : > "$BOARD/states.tsv"
TO=${SNAP_TIMEOUT:-15}
xcrun simctl status_bar "$SIM" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 >/dev/null 2>&1
xcrun simctl ui "$SIM" appearance "$MODE"; xcrun simctl ui "$SIM" content_size "$FONT"
[ -d "$APP" ] && xcrun simctl install "$SIM" "$APP" >/dev/null 2>&1
SIM=$SIM bash scripts/native-shot-guard.sh "$APP" "$BOARD/shots" || exit 2  # لقطات من بناء HEAD فقط + PROVENANCE.txt
node -e '
const fs=require("fs");const m=JSON.parse(fs.readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json","utf8"));
let s={};try{s=JSON.parse(fs.readFileSync("docs/native/ROUTE_SAMPLES.json","utf8"))}catch{}
m.routes.forEach(r=>console.log(r.path+"\t"+(s[r.path]||r.path)+"\t"+(r.component||r.template||"?")))' | head -"$LIMIT" > "$BOARD/routes.tsv"
launch() { xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1; xcrun simctl launch "$SIM" $BID -auditLoop YES "$@" >/dev/null 2>&1
  for _ in 1 2 3 4 5 6 7 8; do sleep 1; xcrun simctl spawn "$SIM" launchctl list 2>/dev/null | grep -Eq "UIKitApplication:$BID" && return 0; done; return 1; }
launch || { echo "native-audit-fast: التطبيق لا يعمل" >&2; exit 2; }
CT=$(xcrun simctl get_app_container "$SIM" $BID data)/tmp
START=$(date +%s)
inapp_run() {  # OPEN=inapp: التطبيق يمرّ بنفسه على المسارات (-snapshotRoutes)؛ السكربت يلتقط ويكتب audit-next فقط
  local base=0 n; n=$(wc -l < "$BOARD/routes.tsv" | tr -d ' ')
  while [ "$base" -lt "$n" ]; do
    tail -n +$((base+1)) "$BOARD/routes.tsv" | cut -f2 > "$CT/audit-routes.txt"; rm -f "$CT/audit-ready.json" "$CT/audit-next" "$CT/audit-done"
    xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1; xcrun simctl launch "$SIM" $BID -snapshotRoutes audit-routes.txt >/dev/null 2>&1
    local i=0 died=0
    while [ $((base+i)) -lt "$n" ]; do
      local end=$(( $(date +%s) + TO + 10 )) st=NOT_READY
      while [ "$(date +%s)" -lt "$end" ]; do
        if [ -s "$CT/audit-ready.json" ] && [ "$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['i'])" "$CT/audit-ready.json" 2>/dev/null)" = "$i" ]; then
          st=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['state'])" "$CT/audit-ready.json" 2>/dev/null || echo NOT_READY); break; fi
        sleep 0.1
      done
      IFS=$'\t' read -r route eff comp < <(sed -n "$((base+i+1))p" "$BOARD/routes.tsv")
      slug=$(echo "${route#/}" | tr '/:' '__'); [ -z "$slug" ] && slug=root
      xcrun simctl io "$SIM" screenshot "$BOARD/shots/$slug.png" >/dev/null 2>&1
      printf '%s\t%s\t%s\t%s\n' "$route" "$eff" "$comp" "$st" >> "$BOARD/states.tsv"
      i=$((i+1)); : > "$CT/audit-next"
      if [ "$st" = NOT_READY ] && ! xcrun simctl spawn "$SIM" launchctl list 2>/dev/null | grep -Eq "UIKitApplication:$BID"; then died=1; break; fi
    done
    [ "$died" = 1 ] && base=$((base+i)) || break   # التطبيق سقط: أكمل من المسار التالي بإطلاق جديد
  done
}
if [ "${OPEN:-url}" = inapp ]; then inapp_run; else
while IFS=$'\t' read -r route eff comp; do
  slug=$(echo "${route#/}" | tr '/:' '__'); [ -z "$slug" ] && slug=root
  rm -f "$CT/snapshot-ready.json"
  if [ "$eff" = "/" ] || [ "${OPEN:-url}" = launch ]; then launch -snapshotRoute "$eff" >/dev/null; else xcrun simctl openurl "$SIM" "majlisilm://${eff#/}" >/dev/null 2>&1; fi
  st=NOT_READY; end=$(( $(date +%s) + TO ))
  while [ "$(date +%s)" -lt "$end" ]; do
    [ -s "$CT/snapshot-ready.json" ] && { st=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['state'])" "$CT/snapshot-ready.json" 2>/dev/null || echo NOT_READY); break; }
    sleep 0.2
  done
  xcrun simctl io "$SIM" screenshot "$BOARD/shots/$slug.png" >/dev/null 2>&1
  printf '%s\t%s\t%s\t%s\n' "$route" "$eff" "$comp" "$st" >> "$BOARD/states.tsv"
  [ "$st" = NOT_READY ] && launch >/dev/null   # جلسة عالقة: أعد التشغيل ولا تُسمِّم ما بعدها
done < "$BOARD/routes.tsv"
fi
echo "captured $(wc -l < "$BOARD/states.tsv") in $(( $(date +%s) - START ))s" > "$BOARD/capture-time.txt"; cat "$BOARD/capture-time.txt"
xcrun simctl status_bar "$SIM" clear >/dev/null 2>&1
bash scripts/native-audit-analyze.sh "$BOARD"
