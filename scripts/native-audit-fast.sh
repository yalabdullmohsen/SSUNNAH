#!/usr/bin/env bash
# تدقيق المسارات السريع: جلسة تطبيق واحدة على محاكي النافذة؛ التنقل بملف أوامر في tmp الحاوية (audit-route.txt، يستطلعه التطبيق DEBUG بـ-auditLoop)؛ simctl openurl يُظهر حوار «فتح في التطبيق؟»
# لكل مسار: انتظار screen.ready (snapshot-ready.json) ثم لقطة وتسجيل الحالة. التحليل (OCR مُجمَّع) يجري بعد الالتقاط بالتوازي.
# الاستعمال: NATIVE_WINDOW=n2 APP=<SunnahApp.app> [MODE=light|dark] [FONT=accessibility-extra-extra-extra-large] [LIMIT=n] bash scripts/native-audit-fast.sh
# المخرجات: $BOARD/<tag>/states.tsv, verdicts.tsv, *.png, summary.md. الهدف: 212 مسارًا < 20 دقيقة.
set -uo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
. scripts/native-sim.sh || exit 2
BID=com.yousef.majlisilm; MODE=${MODE:-light}; FONT=${FONT:-large}; LIMIT=${LIMIT:-999}
APP=${APP:-/tmp/dd-n2/Build/Products/Debug-iphonesimulator/SunnahApp.app}
TAG=${TAG:-$MODE-$FONT}; BOARD=${BOARD:-/tmp/route-audit-fast}/$TAG; mkdir -p "$BOARD/shots"; : > "$BOARD/states.tsv"
TO=${SNAP_TIMEOUT:-15}
xcrun simctl status_bar "$SIM" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 >/dev/null 2>&1
xcrun simctl ui "$SIM" appearance "$MODE"; xcrun simctl ui "$SIM" content_size "$FONT"
[ -d "$APP" ] && xcrun simctl install "$SIM" "$APP" >/dev/null 2>&1
node -e '
const fs=require("fs");const m=JSON.parse(fs.readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json","utf8"));
let s={};try{s=JSON.parse(fs.readFileSync("docs/native/ROUTE_SAMPLES.json","utf8"))}catch{}
m.routes.forEach(r=>console.log(r.path+"\t"+(s[r.path]||r.path)+"\t"+(r.component||r.template||"?")))' | head -"$LIMIT" > "$BOARD/routes.tsv"
launch() { xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1; xcrun simctl launch "$SIM" $BID -auditLoop YES "$@" >/dev/null 2>&1
  for _ in $(seq 20); do sleep 1; case "$(xcrun simctl spawn "$SIM" launchctl list 2>/dev/null)" in *"UIKitApplication:$BID"*) return 0;; esac; done; return 1; }
launch || { echo "native-audit-fast: التطبيق لا يعمل" >&2; exit 2; }
CT=$(xcrun simctl get_app_container "$SIM" $BID data)/tmp
START=$(date +%s); SEQ=0
while IFS=$'\t' read -r route eff comp; do
  slug=$(echo "${route#/}" | tr '/:' '__'); [ -z "$slug" ] && slug=root
  rm -f "$CT/snapshot-ready.json"
  if [ "$eff" = "/" ]; then launch -snapshotRoute / >/dev/null; else echo "$((++SEQ)) $eff" > "$CT/audit-route.txt"; fi
  st=NOT_READY; end=$(( $(date +%s) + TO ))
  while [ "$(date +%s)" -lt "$end" ]; do
    [ -s "$CT/snapshot-ready.json" ] && { st=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['state'])" "$CT/snapshot-ready.json" 2>/dev/null || echo NOT_READY); break; }
    sleep 0.2
  done
  xcrun simctl io "$SIM" screenshot "$BOARD/shots/$slug.png" >/dev/null 2>&1
  printf '%s\t%s\t%s\t%s\n' "$route" "$eff" "$comp" "$st" >> "$BOARD/states.tsv"
  [ "$st" = NOT_READY ] && launch >/dev/null   # جلسة عالقة: أعد التشغيل ولا تُسمِّم ما بعدها
done < "$BOARD/routes.tsv"
echo "captured $(wc -l < "$BOARD/states.tsv") in $(( $(date +%s) - START ))s" > "$BOARD/capture-time.txt"; cat "$BOARD/capture-time.txt"
xcrun simctl status_bar "$SIM" clear >/dev/null 2>&1
bash scripts/native-audit-analyze.sh "$BOARD"
